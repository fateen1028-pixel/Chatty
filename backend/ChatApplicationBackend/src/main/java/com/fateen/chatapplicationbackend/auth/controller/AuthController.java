package com.fateen.chatapplicationbackend.auth.controller;

import com.fateen.chatapplicationbackend.auth.dto.*;
import com.fateen.chatapplicationbackend.auth.model.RefreshToken;
import com.fateen.chatapplicationbackend.auth.service.*;
import com.fateen.chatapplicationbackend.chat.dto.MessageResponse;
import com.fateen.chatapplicationbackend.device.model.Device;
import com.fateen.chatapplicationbackend.auth.repository.RefreshTokenRepo;
import com.fateen.chatapplicationbackend.useraction.repository.UserActionRepo;
import com.fateen.chatapplicationbackend.auth.security.CookieUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {


    private final AuthService authService;
    private final JwtService jwtService;
    private final UserActionRepo userRepo;
    private final RefreshTokenRepo refreshTokenRepo;
    private final RefreshTokenService refreshTokenService;
    private final CookieUtil cookieUtil;
    private final PasswordResetService passwordResetService;



    public AuthController(AuthService authService, JwtService jwtService, UserActionRepo userRepo, RefreshTokenRepo refreshTokenRepo, RefreshTokenService refreshTokenService, CookieUtil cookieUtil, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepo = userRepo;
        this.refreshTokenRepo = refreshTokenRepo;
        this.refreshTokenService = refreshTokenService;
        this.cookieUtil = cookieUtil;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        AuthResponse response =
                authService.login(request);

        ResponseCookie cookie =
                cookieUtil.createRefreshTokenCookie(
                        response.refreshToken()
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        cookie.toString()
                )
                .body(
                        Map.of(
                                "accessToken",
                                response.accessToken()
                        )
                );
    }


    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            HttpServletRequest request
    ) {

        String refreshTokenValue = null;

        Cookie[] cookies =
                request.getCookies();

        if (cookies != null) {

            for (Cookie cookie : cookies) {

                if (
                        cookie.getName()
                                .equals("refreshToken")
                ) {

                    refreshTokenValue =
                            cookie.getValue();
                }
            }
        }

        if (refreshTokenValue == null) {

            return ResponseEntity
                    .status(401)
                    .body("Missing refresh token");
        }

        RefreshToken oldRefreshToken =
                refreshTokenRepo
                        .findByToken(
                                refreshTokenValue
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Refresh token not found"
                                )
                        );

    /*
    VALIDATE DB TOKEN
    */

        if (oldRefreshToken.isRevoked()) {

            refreshTokenService.revokeAllByFamily(
                    oldRefreshToken.getFamilyId()
            );

            throw new RuntimeException(
                    "Refresh token reuse detected"
            );
        }

    /*
    VALIDATE JWT
    */

        if (!jwtService.isRefreshTokenValid(
                oldRefreshToken.getToken()
        )) {

            throw new RuntimeException(
                    "Invalid refresh JWT"
            );
        }

    /*
    EXTRACT USERNAME
    */

        String username =
                jwtService.extractUsername(
                        oldRefreshToken.getToken()
                );

        Device device =
                oldRefreshToken.getDevice();

        if (device == null) {
            throw new RuntimeException(
                    "Refresh token has no associated device"
            );
        }

    /*
    ROTATE TOKEN
    */

        refreshTokenService.revoke(
                oldRefreshToken
        );

        String newAccessToken =
                jwtService.generateAccessToken(
                        username,
                        device.getId()
                );

        String newRefreshToken =
                jwtService.generateRefreshToken(
                        username,
                        device.getId()
                );

        refreshTokenService.createRefreshToken(
                username,
                newRefreshToken,
                oldRefreshToken.getFamilyId(),
                oldRefreshToken.getDevice()
        );

        ResponseCookie cookie =
                cookieUtil.createRefreshTokenCookie(
                        newRefreshToken
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        cookie.toString()
                )
                .body(
                        Map.of(
                                "accessToken",
                                newAccessToken
                        )
                );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request
    ) {

        String refreshTokenValue = null;

        Cookie[] cookies =
                request.getCookies();

        if (cookies != null) {

            for (Cookie cookie : cookies) {

                if (
                        cookie.getName()
                                .equals("refreshToken")
                ) {

                    refreshTokenValue =
                            cookie.getValue();
                }
            }
        }

        if (refreshTokenValue != null) {

            refreshTokenRepo
                    .findByToken(
                            refreshTokenValue
                    )
                    .ifPresent(
                            refreshTokenService::revoke
                    );
        }

        ResponseCookie clearCookie =
                cookieUtil.deleteRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        clearCookie.toString()
                )
                .body("Logged out");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid
            @RequestBody
            ForgotPasswordRequest request
    ) {

        passwordResetService.requestPasswordReset(
                request.email()
        );

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(
                        new MessageResponse(
                                "If an account exists for this email, a reset link has been sent."
                        )
                );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid
            @RequestBody
            ResetPasswordRequest request
    ) {

        passwordResetService.resetPassword(
                request.token(),
                request.newPassword()
        );

        return ResponseEntity.ok(
                new MessageResponse(
                        "Password reset successfully."
                )
        );
    }
}
package com.fateen.chatapplicationbackend.services;

import com.fateen.chatapplicationbackend.models.*;
import com.fateen.chatapplicationbackend.models.dto.LoginRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterResponse;
import com.fateen.chatapplicationbackend.repository.AuthRepo;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final AuthRepo authRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            AuthRepo authRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService, RefreshTokenService refreshTokenService
    ) {
        this.authRepo = authRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public RegisterResponse register(RegisterRequest request) {



        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );
        try {
            authRepo.save(user);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return new RegisterResponse("User Registered");
    }

    public AuthResponse login(LoginRequest request) {

        String familyId =
                UUID.randomUUID().toString();

        User user = authRepo.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        boolean valid = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!valid) {
            throw new BadCredentialsException("User not found");
        }

        String accessToken =
                jwtService.generateAccessToken(
                        user.getUsername()
                );

        String refreshToken =
                jwtService.generateRefreshToken(
                        user.getUsername()
                );

        refreshTokenService.createRefreshToken(
                request.getUsername(),
                refreshToken,
                familyId
        );

        return new AuthResponse(accessToken,refreshToken);
    }
}
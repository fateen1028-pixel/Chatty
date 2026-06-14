package com.fateen.chatapplicationbackend.auth.service;

import com.fateen.chatapplicationbackend.auth.model.PasswordResetToken;
import com.fateen.chatapplicationbackend.auth.model.User;
import com.fateen.chatapplicationbackend.auth.repository.PasswordResetTokenRepo;
import com.fateen.chatapplicationbackend.useraction.repository.UserActionRepo;
import com.fateen.chatapplicationbackend.auth.security.PasswordResetTokenCodec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    PasswordResetService.class
            );

    private static final Duration TOKEN_LIFETIME =
            Duration.ofMinutes(15);

    private final UserActionRepo userRepo;
    private final PasswordResetTokenRepo tokenRepo;
    private final PasswordResetTokenCodec tokenCodec;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final String frontendUrl;

    public PasswordResetService(
            UserActionRepo userRepo,
            PasswordResetTokenRepo tokenRepo,
            PasswordResetTokenCodec tokenCodec,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService,
            @Value("${app.frontend-url}")
            String frontendUrl
    ) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.tokenCodec = tokenCodec;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public void requestPasswordReset(String email) {

        String normalizedEmail =
                email.trim()
                        .toLowerCase(Locale.ROOT);

        Optional<User> optionalUser =
                userRepo.findByEmailIgnoreCase(
                        normalizedEmail
                );

        /*
         * Never reveal whether the email exists.
         */
        if (optionalUser.isEmpty()) {
            return;
        }

        User user = optionalUser.get();

        /*
         * Invalidate previous reset links.
         */
        tokenRepo.deleteAllByUser(user);

        String rawToken =
                tokenCodec.generateRawToken();

        String tokenHash =
                tokenCodec.hash(rawToken);

        PasswordResetToken resetToken =
                new PasswordResetToken(
                        user,
                        tokenHash,
                        Instant.now()
                                .plus(TOKEN_LIFETIME)
                );

        tokenRepo.save(resetToken);

        String resetLink =
                UriComponentsBuilder
                        .fromUriString(frontendUrl)
                        .path("/reset-password")
                        .queryParam("token", rawToken)
                        .build()
                        .encode()
                        .toUriString();

        try {

            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    resetLink
            );

        } catch (IllegalStateException exception) {

            /*
             * Remove unusable token if email sending failed.
             */
            tokenRepo.delete(resetToken);

            log.error(
                    "Failed to send password reset email for user {}",
                    user.getUsername(),
                    exception
            );

            /*
             * Still do not reveal whether the email exists.
             */
        }
    }

    @Transactional
    public void resetPassword(
            String rawToken,
            String newPassword
    ) {

        String tokenHash =
                tokenCodec.hash(rawToken);

        PasswordResetToken resetToken =
                tokenRepo
                        .findAndLockByTokenHash(tokenHash)
                        .orElseThrow(
                                this::invalidResetToken
                        );

        if (
                resetToken.isUsed()
                        || resetToken.isExpired()
        ) {
            throw invalidResetToken();
        }

        User user =
                resetToken.getUser();

        String encodedPassword =
                passwordEncoder.encode(newPassword);

        user.setPassword(encodedPassword);

        resetToken.markUsed();

        userRepo.save(user);
        tokenRepo.save(resetToken);

        /*
         * Log out every existing session after password reset.
         */
        refreshTokenService.revokeAllForUsername(
                user.getUsername()
        );
    }

    private ResponseStatusException invalidResetToken() {

        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Reset link is invalid, expired, or already used"
        );
    }
}
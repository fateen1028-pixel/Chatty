package com.fateen.chatapplicationbackend.auth.service;

import com.fateen.chatapplicationbackend.auth.model.RefreshToken;
import com.fateen.chatapplicationbackend.device.model.Device;
import com.fateen.chatapplicationbackend.auth.repository.RefreshTokenRepo;
import com.fateen.chatapplicationbackend.useraction.repository.UserActionRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepo refreshTokenRepo;

    private final UserActionRepo userRepo;

    /*
    =========================================
    RUN EVERY 6 HOURS
    =========================================
    */


    @Transactional
    @Scheduled(fixedRate = 1000 * 60 * 60 * 6)
    public void cleanupExpiredTokens() {

        log.info(
                "Cleaning expired refresh tokens..."
        );

        refreshTokenRepo
                .deleteByExpiryDateBefore(
                        LocalDateTime.now()
                );

        log.info(
                "Expired refresh tokens removed"
        );
    }

    /*
    =========================================
    CLEAN REVOKED TOKENS
    =========================================
    */

    @Transactional
    @Scheduled(fixedRate = 1000 * 60 * 60 * 6)
    public void cleanupRevokedTokens() {

        log.info(
                "Cleaning revoked refresh tokens..."
        );

        refreshTokenRepo
                .deleteByRevokedTrue();

        log.info(
                "Revoked refresh tokens removed"
        );
    }

    @Transactional
    public void revokeAllForUsername(
            String username
    ) {
        refreshTokenRepo.revokeAllByUsername(
                username
        );
    }

    public RefreshTokenService(
            RefreshTokenRepo refreshTokenRepo, UserActionRepo userRepo
    ) {
        this.refreshTokenRepo = refreshTokenRepo;
        this.userRepo = userRepo;
    }

    public void createRefreshToken(
            String username,
            String token,
            String familyId,
            Device device
    ) {

//        User user =
//                userRepo.findByUsername(username);


        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUsername(username);

        refreshToken.setToken(token);

        refreshToken.setFamilyId(familyId);

        refreshToken.setRevoked(false);

        refreshToken.setExpiryDate(
                LocalDateTime.now().plusDays(7));

        refreshToken.setDevice(device);

        refreshTokenRepo.save(refreshToken);
    }

    public boolean isValid(
            RefreshToken token
    ) {

        return !token.isRevoked()
                &&
                token.getExpiryDate()
                        .isAfter(LocalDateTime.now());
    }

    public void revokeAllByDevice(
            Device device
    ) {

        List<RefreshToken> tokens =
                refreshTokenRepo.findByDevice(device);

        for (RefreshToken token : tokens) {

            token.setRevoked(true);
        }

        refreshTokenRepo.saveAll(tokens);
    }

    public void revoke(
            RefreshToken token
    ) {

        token.setRevoked(true);

        refreshTokenRepo.save(token);
    }

    public void revokeAllByFamily(String familyId) {

        List<RefreshToken> tokens =
                refreshTokenRepo.findByFamilyId(familyId);

        for (RefreshToken token : tokens) {

            token.setRevoked(true);
        }

        refreshTokenRepo.saveAll(tokens);
    }
}
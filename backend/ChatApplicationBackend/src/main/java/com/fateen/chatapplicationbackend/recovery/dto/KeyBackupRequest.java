package com.fateen.chatapplicationbackend.recovery.dto;

public record KeyBackupRequest(
        Integer version,
        String algorithm,
        String kdf,
        String hash,
        Integer iterations,
        String salt,
        String iv,
        String encryptedPrivateKey,
        String publicKey,
        String createdAt
) {
}
package com.fateen.chatapplicationbackend.models.dto;

public record ApproveDeviceRequest(
        String encryptedPrivateKey,
        String encryptedAesKey,
        String iv,
        String accountPublicKey
) {
}
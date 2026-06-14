package com.fateen.chatapplicationbackend.device.dto;

public record ApproveDeviceRequest(
        String encryptedPrivateKey,
        String encryptedAesKey,
        String iv,
        String accountPublicKey
) {
}
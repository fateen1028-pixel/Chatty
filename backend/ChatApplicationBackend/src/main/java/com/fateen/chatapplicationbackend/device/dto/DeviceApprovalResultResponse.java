package com.fateen.chatapplicationbackend.device.dto;

public record DeviceApprovalResultResponse(
        Long approvalId,
        String status,
        String encryptedPrivateKey,
        String encryptedAesKey,
        String iv,
        String accountPublicKey,
        String expiresAt,
        String approvedAt
) {
}
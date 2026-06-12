package com.fateen.chatapplicationbackend.models.dto;

public record PendingDeviceApprovalResponse(
        Long approvalId,
        Long newDeviceId,
        String deviceName,
        String verificationCode,
        String tempPublicKey,
        String createdAt,
        String expiresAt
) {
}
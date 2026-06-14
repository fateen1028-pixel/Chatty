package com.fateen.chatapplicationbackend.device.dto;

public record DeviceApprovalCreatedResponse(
        Long approvalId,
        String verificationCode,
        String status,
        String expiresAt
) {
}
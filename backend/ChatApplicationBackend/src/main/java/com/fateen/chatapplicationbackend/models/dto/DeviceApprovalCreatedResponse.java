package com.fateen.chatapplicationbackend.models.dto;

public record DeviceApprovalCreatedResponse(
        Long approvalId,
        String verificationCode,
        String status,
        String expiresAt
) {
}
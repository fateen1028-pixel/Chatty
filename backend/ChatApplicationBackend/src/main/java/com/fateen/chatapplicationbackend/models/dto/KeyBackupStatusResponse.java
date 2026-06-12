package com.fateen.chatapplicationbackend.models.dto;

public record KeyBackupStatusResponse(
        boolean enabled,
        String lastUpdated
) {
}
package com.fateen.chatapplicationbackend.recovery.dto;

public record KeyBackupStatusResponse(
        boolean enabled,
        String lastUpdated
) {
}
package com.fateen.chatapplicationbackend.models.dto;

public record DeviceKeyDTO(
        Long deviceId,
        String encryptedAesKey
) {
}
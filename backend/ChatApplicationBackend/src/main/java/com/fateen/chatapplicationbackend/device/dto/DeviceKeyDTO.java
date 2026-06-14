package com.fateen.chatapplicationbackend.device.dto;

public record DeviceKeyDTO(
        Long deviceId,
        String encryptedAesKey
) {
}
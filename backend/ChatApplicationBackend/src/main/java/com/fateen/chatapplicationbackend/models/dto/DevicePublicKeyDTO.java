package com.fateen.chatapplicationbackend.models.dto;

public record DevicePublicKeyDTO(
        Long deviceId,
        String publicKey
) {
}
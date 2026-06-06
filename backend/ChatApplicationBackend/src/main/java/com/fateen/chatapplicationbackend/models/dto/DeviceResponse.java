package com.fateen.chatapplicationbackend.models.dto;

public record DeviceResponse(
        Long id,
        String deviceName,
        boolean active
) {}
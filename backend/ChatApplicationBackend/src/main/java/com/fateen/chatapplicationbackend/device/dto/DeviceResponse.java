package com.fateen.chatapplicationbackend.device.dto;

public record DeviceResponse(
        Long id,
        String deviceName,
        boolean active
) {}
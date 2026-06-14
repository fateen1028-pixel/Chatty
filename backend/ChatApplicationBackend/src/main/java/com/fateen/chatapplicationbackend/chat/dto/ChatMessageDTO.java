package com.fateen.chatapplicationbackend.chat.dto;

import com.fateen.chatapplicationbackend.device.dto.DeviceKeyDTO;

import java.util.List;

public record ChatMessageDTO(

        Long receiverId,

        String ciphertext,

        String iv,

        List<DeviceKeyDTO> keys

) {}

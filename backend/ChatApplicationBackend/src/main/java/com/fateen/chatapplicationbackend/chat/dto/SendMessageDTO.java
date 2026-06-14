package com.fateen.chatapplicationbackend.chat.dto;

import com.fateen.chatapplicationbackend.device.dto.DeviceKeyDTO;

import java.util.List;

public record SendMessageDTO(

        String ciphertext,

        String iv,

        List<DeviceKeyDTO> keys

) {
}

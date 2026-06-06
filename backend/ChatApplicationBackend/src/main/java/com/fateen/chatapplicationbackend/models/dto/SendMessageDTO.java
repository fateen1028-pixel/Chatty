package com.fateen.chatapplicationbackend.models.dto;

import java.util.List;

public record SendMessageDTO(

        String ciphertext,

        String iv,

        List<DeviceKeyDTO> keys

) {
}

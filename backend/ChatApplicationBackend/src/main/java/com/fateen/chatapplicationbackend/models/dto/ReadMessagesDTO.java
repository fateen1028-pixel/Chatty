package com.fateen.chatapplicationbackend.models.dto;

import java.util.List;

public record ReadMessagesDTO(

        List<Long> messageIds

) {
}
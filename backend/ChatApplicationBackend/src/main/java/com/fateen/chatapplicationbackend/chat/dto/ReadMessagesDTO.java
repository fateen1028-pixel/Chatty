package com.fateen.chatapplicationbackend.chat.dto;

import java.util.List;

public record ReadMessagesDTO(

        List<Long> messageIds

) {
}
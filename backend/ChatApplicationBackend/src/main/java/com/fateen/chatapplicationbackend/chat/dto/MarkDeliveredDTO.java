package com.fateen.chatapplicationbackend.chat.dto;

import java.util.List;

public record MarkDeliveredDTO(

        List<Long> messageIds

) {
}
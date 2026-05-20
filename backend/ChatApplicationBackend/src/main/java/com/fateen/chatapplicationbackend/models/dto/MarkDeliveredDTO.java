package com.fateen.chatapplicationbackend.models.dto;

import java.util.List;

public record MarkDeliveredDTO(

        List<Long> messageIds

) {
}
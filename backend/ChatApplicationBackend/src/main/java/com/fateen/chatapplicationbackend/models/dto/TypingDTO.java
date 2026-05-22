package com.fateen.chatapplicationbackend.models.dto;

public record TypingDTO(

        Long receiverId,

        Boolean typing

) {
}
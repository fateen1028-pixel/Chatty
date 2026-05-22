package com.fateen.chatapplicationbackend.models.dto;

public record TypingEventDTO(

        String username,

        Boolean typing

) {
}
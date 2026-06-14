package com.fateen.chatapplicationbackend.chat.dto;

public record TypingEventDTO(

        String username,

        Boolean typing

) {
}
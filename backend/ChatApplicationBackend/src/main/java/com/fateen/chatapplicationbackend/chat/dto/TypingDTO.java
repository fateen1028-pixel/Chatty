package com.fateen.chatapplicationbackend.chat.dto;

public record TypingDTO(

        Long receiverId,

        Boolean typing

) {
}
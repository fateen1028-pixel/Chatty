package com.fateen.chatapplicationbackend.models.dto;

import com.fateen.chatapplicationbackend.models.enums.MessageStatus;

import java.time.LocalDateTime;

public record MessageResponseDTO(

        Long id,

        Long senderId,

        String senderUsername,

        Long receiverId,

        String message,

        LocalDateTime createdAt,

        MessageStatus status

) {}

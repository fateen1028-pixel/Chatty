package com.fateen.chatapplicationbackend.models.dto;

import java.time.LocalDateTime;

public record MessageResponseDTO(

        Long id,

        Long senderId,

        String senderUsername,

        Long receiverId,

        String message,

        LocalDateTime createdAt,

        boolean isRead

) {}

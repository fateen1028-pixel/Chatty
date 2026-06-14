package com.fateen.chatapplicationbackend.chat.dto;

import java.time.Instant;

public record MessageResponseDTO(

        Long id,

        Long senderId,

        String senderUsername,

        Long receiverId,

        String cipherText,

        String encryptedAesKey,

        String iv,

        Instant createdAt,

        MessageStatus status

) {}

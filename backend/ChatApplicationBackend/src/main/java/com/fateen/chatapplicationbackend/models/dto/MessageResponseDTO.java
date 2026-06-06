package com.fateen.chatapplicationbackend.models.dto;

import com.fateen.chatapplicationbackend.models.enums.MessageStatus;

import java.time.LocalDateTime;

public record MessageResponseDTO(

        Long id,

        Long senderId,

        String senderUsername,

        Long receiverId,

        String cipherText,

        String senderEncryptedAesKey,

        String receiverEncryptedAesKey,

        String iv,

        LocalDateTime createdAt,

        MessageStatus status

) {}

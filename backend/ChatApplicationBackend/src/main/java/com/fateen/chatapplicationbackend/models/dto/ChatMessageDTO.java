package com.fateen.chatapplicationbackend.models.dto;

public record ChatMessageDTO(

        Long receiverId,

        String ciphertext,

        String senderEncryptedAesKey,

        String receiverEncryptedAesKey,

        String iv

) {}

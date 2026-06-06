package com.fateen.chatapplicationbackend.models.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record RecentChatDTO(

        Long id,

        String username,

        String email,

        String cipherText,

        String encryptedAesKey,

        String iv,

        Instant createdAt

) {
}
package com.fateen.chatapplicationbackend.chat.dto;

import java.time.Instant;

public record RecentChatDTO(

        Long id,

        String username,

        String email,

        String cipherText,

        String encryptedAesKey,

        String iv,

        Instant createdAt,

        String profileImageUrl

) {
}
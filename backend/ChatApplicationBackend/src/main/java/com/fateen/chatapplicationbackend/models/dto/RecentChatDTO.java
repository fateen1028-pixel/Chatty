package com.fateen.chatapplicationbackend.models.dto;

import java.time.LocalDateTime;

public record RecentChatDTO(

        Long id,

        String username,

        String email,

        String lastMessage,

        LocalDateTime createdAt

) {
}
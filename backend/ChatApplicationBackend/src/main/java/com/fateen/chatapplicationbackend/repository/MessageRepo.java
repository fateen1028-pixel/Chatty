package com.fateen.chatapplicationbackend.repository;


import com.fateen.chatapplicationbackend.models.Message;
import com.fateen.chatapplicationbackend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepo extends JpaRepository<Message,Long> {

    @Query("""
    SELECT m
    FROM Message m
    WHERE
    (m.sender.id = :currentUserId AND m.receiver.id = :receiverId)
    OR
    (m.sender.id = :receiverId AND m.receiver.id = :currentUserId)
    ORDER BY m.createdAt ASC
""")
    List<Message> findConversation(
            Long currentUserId,
            Long receiverId
    );

    @Query("""
    SELECT m
    FROM Message m
    WHERE
    m.sender.id = :userId
    OR
    m.receiver.id = :userId
    ORDER BY m.createdAt DESC
""")
    List<Message> findRecentMessages(Long userId);
}

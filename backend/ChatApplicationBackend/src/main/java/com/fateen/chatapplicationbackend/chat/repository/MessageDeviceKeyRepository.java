package com.fateen.chatapplicationbackend.chat.repository;

import com.fateen.chatapplicationbackend.chat.model.MessageDeviceKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MessageDeviceKeyRepository
        extends JpaRepository<MessageDeviceKey,Long> {


    Optional<MessageDeviceKey> findByMessageIdAndDeviceId(
            Long messageId,
            Long deviceId
    );

    @Query("""
        SELECT k
        FROM MessageDeviceKey k
        WHERE k.message.id = :messageId
        AND k.device.user.id = :userId
        AND k.device.publicKey = :publicKey
        ORDER BY k.id ASC
    """)
    List<MessageDeviceKey> findKeysForSameUserAndPublicKey(
            Long messageId,
            Long userId,
            String publicKey
    );
}

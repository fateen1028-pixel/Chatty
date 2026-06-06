package com.fateen.chatapplicationbackend.repository;

import com.fateen.chatapplicationbackend.models.MessageDeviceKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MessageDeviceKeyRepository
        extends JpaRepository<MessageDeviceKey,Long> {


    Optional<MessageDeviceKey> findByMessageIdAndDeviceId(
            Long messageId,
            Long deviceId
    );
}

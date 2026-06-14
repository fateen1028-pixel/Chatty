package com.fateen.chatapplicationbackend.recovery.repository;

import com.fateen.chatapplicationbackend.recovery.model.KeyBackup;
import com.fateen.chatapplicationbackend.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KeyBackupRepo extends JpaRepository<KeyBackup, Long> {

    Optional<KeyBackup> findByUser(User user);

    boolean existsByUser(User user);
}
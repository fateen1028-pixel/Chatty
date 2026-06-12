package com.fateen.chatapplicationbackend.repository;

import com.fateen.chatapplicationbackend.models.KeyBackup;
import com.fateen.chatapplicationbackend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KeyBackupRepo extends JpaRepository<KeyBackup, Long> {

    Optional<KeyBackup> findByUser(User user);

    boolean existsByUser(User user);
}
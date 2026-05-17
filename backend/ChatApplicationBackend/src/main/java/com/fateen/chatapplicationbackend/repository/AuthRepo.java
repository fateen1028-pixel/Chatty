package com.fateen.chatapplicationbackend.repository;

import com.fateen.chatapplicationbackend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthRepo extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}
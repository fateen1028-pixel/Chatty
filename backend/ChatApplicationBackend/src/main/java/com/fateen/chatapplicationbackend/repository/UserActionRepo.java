package com.fateen.chatapplicationbackend.repository;

import com.fateen.chatapplicationbackend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UserActionRepo extends JpaRepository<User,Long> {
    User findByUsername(String username);

    Optional<User> findByEmailIgnoreCase(String email);
}

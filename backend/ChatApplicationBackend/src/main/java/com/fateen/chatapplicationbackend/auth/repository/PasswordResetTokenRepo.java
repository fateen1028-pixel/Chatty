package com.fateen.chatapplicationbackend.auth.repository;

import com.fateen.chatapplicationbackend.auth.model.PasswordResetToken;
import com.fateen.chatapplicationbackend.auth.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepo
        extends JpaRepository<PasswordResetToken, UUID> {

    void deleteAllByUser(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select token
            from PasswordResetToken token
            join fetch token.user
            where token.tokenHash = :tokenHash
            """)
    Optional<PasswordResetToken> findAndLockByTokenHash(
            @Param("tokenHash") String tokenHash
    );
}
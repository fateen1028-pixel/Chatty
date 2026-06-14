package com.fateen.chatapplicationbackend.auth.repository;

import com.fateen.chatapplicationbackend.device.model.Device;
import com.fateen.chatapplicationbackend.auth.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken,Long> {



    Optional<RefreshToken> findByToken(String token);

    void deleteByExpiryDateBefore(
            LocalDateTime time
    );

    void deleteByRevokedTrue();

    List<RefreshToken> findByFamilyId(String familyId);

    List<RefreshToken> findByDevice(Device device);

    @Modifying(clearAutomatically = true)
    @Query("""
        update RefreshToken token
        set token.revoked = true
        where token.device.user.username = :username
          and token.revoked = false
        """)
    int revokeAllByUsername(
            @Param("username")
            String username
    );

}

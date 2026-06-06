package com.fateen.chatapplicationbackend.repository;

import com.fateen.chatapplicationbackend.models.Device;
import com.fateen.chatapplicationbackend.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

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

}

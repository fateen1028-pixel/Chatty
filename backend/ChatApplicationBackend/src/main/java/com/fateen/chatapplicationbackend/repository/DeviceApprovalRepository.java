package com.fateen.chatapplicationbackend.repository;

import com.fateen.chatapplicationbackend.models.DeviceApproval;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.enums.DeviceApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface DeviceApprovalRepository extends JpaRepository<DeviceApproval, Long> {

    @Query("""
    SELECT da
    FROM DeviceApproval da
    JOIN FETCH da.newDevice
    WHERE da.user = :user
    AND da.status = :status
    AND da.expiresAt > :now
    ORDER BY da.createdAt DESC
""")
    List<DeviceApproval> findPendingWithNewDevice(
            User user,
            DeviceApprovalStatus status,
            Instant now
    );

    Optional<DeviceApproval> findByIdAndUser(
            Long id,
            User user
    );

    Optional<DeviceApproval> findTopByNewDevice_IdOrderByCreatedAtDesc(
            Long newDeviceId
    );
}
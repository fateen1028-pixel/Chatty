package com.fateen.chatapplicationbackend.device.repository;

import com.fateen.chatapplicationbackend.device.model.Device;
import com.fateen.chatapplicationbackend.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device,Long> {

    List<Device> findByUserAndActiveTrue(User user);

    Optional<Device> findByIdAndActiveTrue(Long id);

    Optional<Device> findByDeviceFingerprint(String fingerprint);


}

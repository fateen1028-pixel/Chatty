package com.fateen.chatapplicationbackend.services;


import com.fateen.chatapplicationbackend.models.Device;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.DevicePublicKeyDTO;
import com.fateen.chatapplicationbackend.models.dto.UserDTO;
import com.fateen.chatapplicationbackend.repository.DeviceRepository;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserActionService {

    private final UserActionRepo userActionRepo;
    private final DeviceRepository deviceRepository;

    public UserActionService(
            UserActionRepo userActionRepo,
            DeviceRepository deviceRepository
    ) {
        this.userActionRepo = userActionRepo;
        this.deviceRepository = deviceRepository;
    }

    public UserDTO getUserData(String username){

        User user = userActionRepo.findByUsername(username);

        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );

    }

    public User getUserByUsername(
            String username
    ) {
        return userActionRepo.findByUsername(
                username
        );
    }


    public User getReceiverById(Long receiverId) {

        return userActionRepo.findById(receiverId).orElseThrow();

    }

    public List<DevicePublicKeyDTO> getUserDevices(
            String username
    ) {

        User user =
                userActionRepo.findByUsername(username);

        List<Device> devices =
                deviceRepository.findByUserAndActiveTrue(
                        user
                );

        return devices.stream()
                .map(device ->
                        new DevicePublicKeyDTO(
                                device.getId(),
                                device.getPublicKey()
                        )
                )
                .toList();
    }
}

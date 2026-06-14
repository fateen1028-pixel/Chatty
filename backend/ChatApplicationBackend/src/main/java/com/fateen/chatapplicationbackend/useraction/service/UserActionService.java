package com.fateen.chatapplicationbackend.useraction.service;


import com.fateen.chatapplicationbackend.device.dto.BothPublicKeyDTO;
import com.fateen.chatapplicationbackend.device.model.Device;
import com.fateen.chatapplicationbackend.auth.model.User;
import com.fateen.chatapplicationbackend.useraction.dto.UserDTO;
import com.fateen.chatapplicationbackend.device.repository.DeviceRepository;
import com.fateen.chatapplicationbackend.useraction.repository.UserActionRepo;
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

    public List<BothPublicKeyDTO.DevicePublicKeyDTO> getUserDevices(
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
                        new BothPublicKeyDTO.DevicePublicKeyDTO(
                                device.getId(),
                                device.getPublicKey()
                        )
                )
                .toList();
    }
}

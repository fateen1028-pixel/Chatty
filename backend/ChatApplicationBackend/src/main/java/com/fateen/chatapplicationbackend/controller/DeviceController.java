package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.Device;
import com.fateen.chatapplicationbackend.models.RefreshToken;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.DeviceResponse;
import com.fateen.chatapplicationbackend.repository.DeviceRepository;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import com.fateen.chatapplicationbackend.services.JwtService;
import com.fateen.chatapplicationbackend.services.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private final JwtService jwtService;
    private final DeviceRepository deviceRepository;
    private final UserActionRepo userRepo;
    private final RefreshTokenService refreshTokenService;

    public DeviceController(
            JwtService jwtService,
            DeviceRepository deviceRepository,
            UserActionRepo userRepo,
            RefreshTokenService refreshTokenService
    ) {
        this.jwtService = jwtService;
        this.deviceRepository = deviceRepository;
        this.userRepo = userRepo;
        this.refreshTokenService = refreshTokenService;
    }

    @GetMapping("/current")
    public DeviceResponse currentDevice(
            @RequestHeader("Authorization")
            String authHeader
    ) {

        String token =
                authHeader.substring(7);

        Long deviceId =
                jwtService.extractDeviceId(token);

        Device device =
                deviceRepository
                        .findByIdAndActiveTrue(deviceId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Device not found"
                                )
                        );

        return new DeviceResponse(
                device.getId(),
                device.getDeviceName(),
                device.isActive()
        );


    }

    @GetMapping("/me")
    public List<DeviceResponse> myDevices(
            @RequestHeader("Authorization")
            String authHeader
    ) {

        String token =
                authHeader.substring(7);

        String username =
                jwtService.extractUsername(token);

        User user =
                userRepo.findByUsername(username);

        List<Device> devices =
                deviceRepository.findByUserAndActiveTrue(user);

        return devices.stream()
                .map(device ->
                        new DeviceResponse(
                                device.getId(),
                                device.getDeviceName(),
                                device.isActive()
                        )
                )
                .toList();

    }



    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDevice(
            @PathVariable Long id,
            @RequestHeader("Authorization")
            String authHeader
    ) {
        String token =
                authHeader.substring(7);

        String username =
                jwtService.extractUsername(token);

        User user =
                userRepo.findByUsername(username);


        Device device =
                deviceRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Device not found"
                                )
                        );


        if (!device.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Not your device"
            );
        }

        Long currentDeviceId =
                jwtService.extractDeviceId(token);

        if (currentDeviceId.equals(device.getId())) {

            throw new RuntimeException(
                    "Cannot remove current device"
            );
        }

        device.setActive(false);

        deviceRepository.save(device);

        refreshTokenService.revokeAllByDevice(
                device
        );

        return ResponseEntity.ok(
                "Device removed"
        );

    }

}

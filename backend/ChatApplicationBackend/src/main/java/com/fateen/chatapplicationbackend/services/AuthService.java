package com.fateen.chatapplicationbackend.services;

import com.fateen.chatapplicationbackend.models.*;
import com.fateen.chatapplicationbackend.models.dto.LoginRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterResponse;
import com.fateen.chatapplicationbackend.repository.AuthRepo;
import com.fateen.chatapplicationbackend.repository.DeviceRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthRepo authRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final DeviceRepository deviceRepository;

    public AuthService(
            AuthRepo authRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService, RefreshTokenService refreshTokenService, DeviceRepository deviceRepository
    ) {
        this.authRepo = authRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.deviceRepository = deviceRepository;
    }

    public RegisterResponse register(RegisterRequest request) {



        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );
        try {
            authRepo.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Username or Email is already registered");
        }catch (Exception e) {

            throw new RuntimeException("Database error occurred during registration");
        }
        return new RegisterResponse("User Registered");
    }

    public AuthResponse login(LoginRequest request) {

        String familyId =
                UUID.randomUUID().toString();

        User user = authRepo.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("Invalid credentials"));




        boolean valid = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!valid) {
            throw new BadCredentialsException("Invalid credentials");
        }

        Optional<Device> existing =
                deviceRepository.findByDeviceFingerprint(
                        request.getDeviceFingerprint()
                );

        Device device;

        if (existing.isPresent()) {

            device = existing.get();

            if (
                    !device.getUser()
                            .getId()
                            .equals(user.getId())
            ) {
                throw new RuntimeException(
                        "Device fingerprint belongs to another user"
                );
            }

            device.setLastSeen(Instant.now());

            device.setPublicKey(
                    request.getPublicKey()
            );

            deviceRepository.save(device);
        }else {

            device = new Device();

            device.setUser(user);

            device.setDeviceName(
                    request.getDeviceName()
            );

            device.setPublicKey(
                    request.getPublicKey()
            );

            device.setDeviceFingerprint(
                    request.getDeviceFingerprint()
            );

            device.setCreatedAt(
                    Instant.now()
            );

            device.setLastSeen(
                    Instant.now()
            );

            device.setDeviceName(
                    request.getDeviceName()
            );

            device.setActive(true);

            deviceRepository.save(device);
        }

        String accessToken =
                jwtService.generateAccessToken(
                        user.getUsername(),
                        device.getId()
                );

        String refreshToken =
                jwtService.generateRefreshToken(
                        user.getUsername(),
                        device.getId()
                );

        refreshTokenService.createRefreshToken(
                request.getUsername(),
                refreshToken,
                familyId,
                device
        );

        return new AuthResponse(accessToken,refreshToken);
    }
}
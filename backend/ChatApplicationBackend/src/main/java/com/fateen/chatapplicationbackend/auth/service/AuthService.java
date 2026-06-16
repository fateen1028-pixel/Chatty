package com.fateen.chatapplicationbackend.auth.service;

import com.fateen.chatapplicationbackend.auth.model.User;
import com.fateen.chatapplicationbackend.device.model.Device;
import com.fateen.chatapplicationbackend.auth.dto.AuthResponse;
import com.fateen.chatapplicationbackend.auth.dto.LoginRequest;
import com.fateen.chatapplicationbackend.auth.dto.RegisterRequest;
import com.fateen.chatapplicationbackend.auth.dto.RegisterResponse;
import com.fateen.chatapplicationbackend.auth.repository.AuthRepo;
import com.fateen.chatapplicationbackend.device.repository.DeviceRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public AuthResponse login(LoginRequest request) {

        User user = authRepo.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid credentials")
                );

        boolean validPassword = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!validPassword) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (
                request.getDeviceFingerprint() == null
                        || request.getDeviceFingerprint().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Device fingerprint is required"
            );
        }

        if (
                request.getPublicKey() == null
                        || request.getPublicKey().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Device public key is required"
            );
        }

        Optional<Device> existingDevice =
                deviceRepository.findByDeviceFingerprint(
                        request.getDeviceFingerprint()
                );

        Device device;

        if (existingDevice.isPresent()) {

            device = existingDevice.get();

            if (!device.getUser().getId().equals(user.getId())) {
                throw new IllegalStateException(
                        "Device fingerprint belongs to another user"
                );
            }

            String storedPublicKey =
                    device.getPublicKey();

            String receivedPublicKey =
                    request.getPublicKey();

            /*
             * Do not overwrite the existing public key.
             * But do not block authentication either.
             */
            if (
                    storedPublicKey != null
                            && !storedPublicKey.equals(receivedPublicKey)
            ) {
                System.err.println(
                        "WARNING: Encryption-key mismatch for device "
                                + device.getId()
                );
            }

            if (storedPublicKey == null) {
                device.setPublicKey(receivedPublicKey);
            }

            device.setDeviceName(
                    request.getDeviceName()
            );

            device.setLastSeen(
                    Instant.now()
            );

            device.setActive(true);

        } else {

            device = new Device();

            device.setUser(user);
            device.setDeviceName(request.getDeviceName());
            device.setPublicKey(request.getPublicKey());

            device.setDeviceFingerprint(
                    request.getDeviceFingerprint()
            );

            device.setCreatedAt(Instant.now());
            device.setLastSeen(Instant.now());
            device.setActive(true);
        }

        deviceRepository.save(device);

        String familyId =
                UUID.randomUUID().toString();

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
                user.getUsername(),
                refreshToken,
                familyId,
                device
        );

        return new AuthResponse(
                accessToken,
                refreshToken
        );
    }
}
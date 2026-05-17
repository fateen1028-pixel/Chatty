package com.fateen.chatapplicationbackend.services;

import com.fateen.chatapplicationbackend.models.*;
import com.fateen.chatapplicationbackend.models.dto.LoginRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterResponse;
import com.fateen.chatapplicationbackend.repository.AuthRepo;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthRepo authRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AuthRepo authRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.authRepo = authRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );

        authRepo.save(user);

        return new RegisterResponse("User Registered");
    }

    public AuthResponse login(LoginRequest request) {

        User user = authRepo.findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        boolean valid = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!valid) {
            throw new BadCredentialsException("User not found");
        }

        String token =
                jwtService.generateToken(user.getUsername());

        return new AuthResponse(token);
    }
}
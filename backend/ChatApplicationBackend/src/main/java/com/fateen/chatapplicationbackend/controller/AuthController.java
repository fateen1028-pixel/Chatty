package com.fateen.chatapplicationbackend.controller;

import com.fateen.chatapplicationbackend.models.*;
import com.fateen.chatapplicationbackend.models.dto.LoginRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterRequest;
import com.fateen.chatapplicationbackend.models.dto.RegisterResponse;
import com.fateen.chatapplicationbackend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

}
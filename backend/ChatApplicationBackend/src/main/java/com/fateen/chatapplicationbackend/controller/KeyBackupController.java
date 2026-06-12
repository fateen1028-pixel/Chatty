package com.fateen.chatapplicationbackend.controller;

import com.fateen.chatapplicationbackend.models.dto.KeyBackupRequest;
import com.fateen.chatapplicationbackend.models.dto.KeyBackupResponse;
import com.fateen.chatapplicationbackend.models.dto.KeyBackupStatusResponse;
import com.fateen.chatapplicationbackend.services.KeyBackupService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/key-backup")
public class KeyBackupController {

    private final KeyBackupService keyBackupService;

    public KeyBackupController(KeyBackupService keyBackupService) {
        this.keyBackupService = keyBackupService;
    }

    @GetMapping("/status")
    public KeyBackupStatusResponse getStatus(Authentication authentication) {
        String username = getUsername(authentication);

        return keyBackupService.getStatus(username);
    }

    @PostMapping
    public KeyBackupResponse saveBackup(
            Authentication authentication,
            @RequestBody KeyBackupRequest request
    ) {
        String username = getUsername(authentication);

        return keyBackupService.saveBackup(username, request);
    }

    @GetMapping
    public KeyBackupResponse getBackup(Authentication authentication) {
        String username = getUsername(authentication);

        return keyBackupService.getBackup(username);
    }

    private String getUsername(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated request");
        }

        return authentication.getName();
    }
}
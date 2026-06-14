package com.fateen.chatapplicationbackend.recovery.controller;

import com.fateen.chatapplicationbackend.recovery.dto.KeyBackupRequest;
import com.fateen.chatapplicationbackend.recovery.dto.KeyBackupResponse;
import com.fateen.chatapplicationbackend.recovery.dto.KeyBackupStatusResponse;
import com.fateen.chatapplicationbackend.recovery.service.KeyBackupService;
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
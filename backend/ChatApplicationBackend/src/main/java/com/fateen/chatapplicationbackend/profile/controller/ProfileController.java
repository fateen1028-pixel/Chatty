package com.fateen.chatapplicationbackend.profile.controller;

import com.fateen.chatapplicationbackend.profile.dto.ProfileImageResponse;
import com.fateen.chatapplicationbackend.profile.service.ProfileService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping(
            value = "/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProfileImageResponse> uploadImage(
            @RequestPart("image") MultipartFile image,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                profileService.uploadProfileImage(
                        authentication.getName(),
                        image
                )
        );
    }

    @GetMapping("/image")
    public ResponseEntity<ProfileImageResponse> getImage(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                profileService.getProfileImage(
                        authentication.getName()
                )
        );
    }
}
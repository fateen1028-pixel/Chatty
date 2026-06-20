package com.fateen.chatapplicationbackend.profile.service;

import com.fateen.chatapplicationbackend.auth.model.User;
import com.fateen.chatapplicationbackend.profile.dto.ProfileImageResponse;
import com.fateen.chatapplicationbackend.useraction.repository.UserActionRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileService {

    private final UserActionRepo userActionRepo;
    private final SupabaseStorageService storageService;

    public ProfileService(
            UserActionRepo userActionRepo,
            SupabaseStorageService storageService
    ) {
        this.userActionRepo = userActionRepo;
        this.storageService = storageService;
    }

    @Transactional
    public ProfileImageResponse uploadProfileImage(
            String username,
            MultipartFile image
    ) {
        User user = userActionRepo.findByUsername(username);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        SupabaseStorageService.UploadedImage uploaded =
                storageService.upload(user.getId(), image);

        user.setProfileImagePath(uploaded.path());

        userActionRepo.save(user);

        return new ProfileImageResponse(
                uploaded.publicUrl()
        );
    }

    @Transactional(readOnly = true)
    public ProfileImageResponse getProfileImage(
            String username
    ) {
        User user = userActionRepo.findByUsername(username);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        return new ProfileImageResponse(
                storageService.getPublicUrl(
                        user.getProfileImagePath()
                )
        );
    }
}
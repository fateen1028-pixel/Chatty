package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.BothPublicKeyDTO;
import com.fateen.chatapplicationbackend.models.dto.PublicKeyDTO;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/keys")
public class KeyController {

    private final UserActionRepo userRepo;

    public KeyController(UserActionRepo userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping("/public")
    public void setPublicKey(

            @RequestBody PublicKeyDTO dto,

            Principal principal
    ) {

        User user =
                userRepo.findByUsername(
                        principal.getName()
                );

        user.setPublicKey(
                dto.publicKey()
        );

        userRepo.save(user);
    }

    @GetMapping("/public/{userId}")
    public BothPublicKeyDTO getPublicKey(
            @PathVariable Long userId, Principal principal
    ) {

        User receiver =
                userRepo.findById(userId)
                        .orElseThrow();

        User sender =
                userRepo.findByUsername(principal.getName());

        return new BothPublicKeyDTO(
                sender.getPublicKey(),
                receiver.getPublicKey()
        );
    }
}
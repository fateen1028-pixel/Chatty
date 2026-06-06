package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.DevicePublicKeyDTO;
import com.fateen.chatapplicationbackend.models.dto.UserDTO;
import com.fateen.chatapplicationbackend.services.UserActionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserActionController {

    @Autowired
    private UserActionService userActionService;

    @GetMapping("/user-data")
    public UserDTO userData(Authentication authentication){

        String username =
                authentication.getName();

        return userActionService
                .getUserData(username);
    }

    @GetMapping("/receiver/search/{receiverUsername}")
    public UserDTO search (@PathVariable String receiverUsername){
        return userActionService.getUserData(receiverUsername);
    }

    @GetMapping("/users/{username}/devices")
    public List<DevicePublicKeyDTO> getUserDevices(
            @PathVariable String username
    ) {

        return userActionService
                .getUserDevices(username);
    }

}

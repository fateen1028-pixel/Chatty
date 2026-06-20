package com.fateen.chatapplicationbackend.useraction.controller;


import com.fateen.chatapplicationbackend.device.dto.BothPublicKeyDTO;
import com.fateen.chatapplicationbackend.useraction.dto.UserDTO;
import com.fateen.chatapplicationbackend.useraction.service.UserActionService;
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
    public List<BothPublicKeyDTO.DevicePublicKeyDTO> getUserDevices(
            @PathVariable String username
    ) {

        return userActionService
                .getUserDevices(username);
    }



}

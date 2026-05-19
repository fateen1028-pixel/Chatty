package com.fateen.chatapplicationbackend.controller;

import com.fateen.chatapplicationbackend.presence.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/presence")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping("/online-users")
    public Set<String> getOnlineUsers() {

        return presenceService
                .getOnlineUsers()
                .keySet();
    }
}
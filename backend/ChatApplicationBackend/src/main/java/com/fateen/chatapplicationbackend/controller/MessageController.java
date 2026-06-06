package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.Message;
import com.fateen.chatapplicationbackend.models.dto.MessageDTO;
import com.fateen.chatapplicationbackend.models.dto.MessageResponseDTO;
import com.fateen.chatapplicationbackend.models.dto.RecentChatDTO;
import com.fateen.chatapplicationbackend.models.dto.UserDTO;
import com.fateen.chatapplicationbackend.services.JwtService;
import com.fateen.chatapplicationbackend.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {


    private final MessageService messageService;
    private final JwtService jwtService;

    public MessageController(MessageService messageService, JwtService jwtService) {
        this.messageService = messageService;
        this.jwtService = jwtService;
    }

//    @PostMapping("{receiverId}")
//    public String sendMessage(
//            @PathVariable Long receiverId,
//            @RequestBody MessageDTO request,
//            Authentication authentication
//    ) {
//
//        String senderUsername = authentication.getName();
//
//        messageService.sendMessage(
//                senderUsername,
//                receiverId,
//                request.message()
//        );
//
//        return "Sent";
//    }

    @GetMapping("{receiverId}")
    public List<MessageResponseDTO> getMessages(
            @PathVariable Long receiverId,
            Authentication authentication,
            @RequestHeader("Authorization")
            String authHeader
    ) {

        String token =
                authHeader.substring(7);

        Long deviceId =
                jwtService.extractDeviceId(token);

        String currentUsername = authentication.getName();

        return messageService.getConversation(
                currentUsername,
                receiverId,
                deviceId
        );
    }

    @GetMapping("/chat/{receiverId}")
    public List<MessageResponseDTO> getChatBetweenUsers(@PathVariable Long receiverId, Authentication authentication,@RequestHeader("Authorization")
    String authHeader){
        String token =
                authHeader.substring(7);

        Long deviceId =
                jwtService.extractDeviceId(token);
        String senderUsername = authentication.getName();
        return messageService.getChatMessages(
                receiverId,
                senderUsername,
                deviceId
        );
    }




    @GetMapping("/recent-chats")
    public List<RecentChatDTO> getRecentChats(
            Authentication authentication,
            @RequestHeader("Authorization")
            String authHeader
    ){

        String token =
                authHeader.substring(7);

        Long deviceId =
                jwtService.extractDeviceId(token);

        return messageService.getRecentChats(
                authentication.getName(),
                deviceId
        );
    }

}

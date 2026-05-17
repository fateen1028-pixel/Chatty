package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.Message;
import com.fateen.chatapplicationbackend.models.dto.MessageDTO;
import com.fateen.chatapplicationbackend.models.dto.MessageResponseDTO;
import com.fateen.chatapplicationbackend.models.dto.RecentChatDTO;
import com.fateen.chatapplicationbackend.models.dto.UserDTO;
import com.fateen.chatapplicationbackend.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("{receiverId}")
    public String sendMessage(
            @PathVariable Long receiverId,
            @RequestBody MessageDTO request,
            Authentication authentication
    ) {

        String senderUsername = authentication.getName();

        messageService.sendMessage(
                senderUsername,
                receiverId,
                request.message()
        );

        return "Sent";
    }

    @GetMapping("{receiverId}")
    public List<MessageResponseDTO> getMessages(
            @PathVariable Long receiverId,
            Authentication authentication
    ) {

        String currentUsername = authentication.getName();

        return messageService.getConversation(
                currentUsername,
                receiverId
        );
    }

    @GetMapping("/chat/{receiverId}")
    public List<MessageResponseDTO> getChatBetweenUsers(@PathVariable Long receiverId, Authentication authentication){
        String senderUsername = authentication.getName();
        return messageService.getChatMessages(receiverId,senderUsername);
    }




    @GetMapping("/recent-chats")
    public List<RecentChatDTO> getRecentChats(
            Authentication authentication
    ) {

        return messageService.getRecentChats(
                authentication.getName()
        );
    }

}

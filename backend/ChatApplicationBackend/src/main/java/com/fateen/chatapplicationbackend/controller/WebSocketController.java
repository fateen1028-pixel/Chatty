package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.MessageResponseDTO;
import com.fateen.chatapplicationbackend.models.dto.ChatMessageDTO;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import com.fateen.chatapplicationbackend.services.MessageService;
import com.fateen.chatapplicationbackend.services.UserActionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Optional;

@Controller
public class WebSocketController {

    private final MessageService messageService;

    private final UserActionService userActionService;

    private final SimpMessagingTemplate messagingTemplate;


    public WebSocketController(MessageService messageService, SimpMessagingTemplate messagingTemplate, UserActionService userActionService) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.userActionService = userActionService;
    }

    @MessageMapping("/chat")
    public void sendMessage(ChatMessageDTO request, Principal principal) {

        MessageResponseDTO savedMessage =
                messageService.sendMessage(
                        principal.getName(),
                        request.receiverId(),
                        request.message()
                );

        User receiver =
                userActionService.getReceiverName(
                        request.receiverId()
                );

        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/messages",
                savedMessage
        );
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/messages",
                savedMessage
        );
    }
}

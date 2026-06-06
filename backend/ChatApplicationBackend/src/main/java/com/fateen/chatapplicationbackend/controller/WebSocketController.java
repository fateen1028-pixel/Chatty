package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.*;
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
                        request.ciphertext(),
                        request.senderEncryptedAesKey(),
                        request.receiverEncryptedAesKey(),
                        request.iv()
                );

        User receiver =
                userActionService.getReceiverById(
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

    @MessageMapping("/chat.read")
    public void markMessagesAsRead(
            ReadMessagesDTO dto,
            Principal principal
    ) {

        messageService.markMessagesAsRead(
                dto.messageIds(),
                principal.getName()
        );
    }

    @MessageMapping("/chat.delivered")
    public void markDelivered(
            MarkDeliveredDTO dto,
            Principal principal
    ) {

        messageService.markMessagesAsDelivered(
                dto.messageIds(),
                principal.getName()
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(
            TypingDTO request,
            Principal principal
    ) {

        User receiver =
                userActionService.getReceiverById(
                        request.receiverId()
                );

        messagingTemplate.convertAndSendToUser(

                receiver.getUsername(),

                "/queue/typing",

                new TypingEventDTO(
                        principal.getName(),
                        request.typing()
                )
        );
    }
}

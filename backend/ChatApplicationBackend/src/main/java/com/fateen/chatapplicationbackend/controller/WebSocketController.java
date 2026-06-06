package com.fateen.chatapplicationbackend.controller;


import com.fateen.chatapplicationbackend.models.Device;
import com.fateen.chatapplicationbackend.models.Message;
import com.fateen.chatapplicationbackend.models.MessageDeviceKey;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.*;
import com.fateen.chatapplicationbackend.repository.DeviceRepository;
import com.fateen.chatapplicationbackend.repository.MessageRepo;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import com.fateen.chatapplicationbackend.services.MessageService;
import com.fateen.chatapplicationbackend.services.UserActionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;

@Controller
public class WebSocketController {

    private final MessageService messageService;

    private final UserActionService userActionService;

    private final SimpMessagingTemplate messagingTemplate;

    private final DeviceRepository deviceRepository;



    public WebSocketController(MessageService messageService, SimpMessagingTemplate messagingTemplate, UserActionService userActionService, DeviceRepository deviceRepository) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.userActionService = userActionService;

        this.deviceRepository = deviceRepository;
    }


    private String extractUsername(
            Principal principal
    ) {
        return principal.getName()
                .split(":")[0];
    }

    private void sendMessageToAllDevices(
            User user,
            Long messageId
    ) {

        List<Device> devices =
                deviceRepository.findByUserAndActiveTrue(
                        user
                );

        for (Device device : devices) {

            MessageResponseDTO dto =
                    messageService.getMessageForDevice(
                            messageId,
                            device.getId()
                    );

            messagingTemplate.convertAndSendToUser(
                    user.getUsername()
                            + ":"
                            + device.getId(),
                    "/queue/messages",
                    dto
            );
        }
    }

    private void sendEventToAllDevices(
            User user,
            String destination,
            Object payload
    ) {

        List<Device> devices =
                deviceRepository.findByUserAndActiveTrue(
                        user
                );

        for (Device device : devices) {

            messagingTemplate.convertAndSendToUser(
                    user.getUsername()
                            + ":"
                            + device.getId(),
                    destination,
                    payload
            );
        }
    }


    @MessageMapping("/chat")
    public void sendMessage(
            ChatMessageDTO request,
            Principal principal,
            SimpMessageHeaderAccessor accessor
    ) {

        Long deviceId =
                (Long)
                        accessor.getSessionAttributes()
                                .get("deviceId");

        if (deviceId == null) {
            throw new RuntimeException(
                    "Missing device id in websocket session"
            );
        }



        MessageResponseDTO savedMessage =
                messageService.sendMessage(
                        principal.getName(),
                        request.receiverId(),
                        deviceId,
                        new SendMessageDTO(
                                request.ciphertext(),
                                request.iv(),
                                request.keys()
                        )
                );

        String senderUsername =
                extractUsername(principal);

        User sender =
                userActionService.getUserByUsername(
                        senderUsername
                );

        User receiver =
                userActionService.getReceiverById(
                        request.receiverId()
                );

        sendMessageToAllDevices(
                sender,
                savedMessage.id()
        );

        sendMessageToAllDevices(
                receiver,
                savedMessage.id()
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

        String senderUsername =
                extractUsername(principal);

        sendEventToAllDevices(
                receiver,
                "/queue/typing",
                new TypingEventDTO(
                        senderUsername,
                        request.typing()
                )
        );
    }
}

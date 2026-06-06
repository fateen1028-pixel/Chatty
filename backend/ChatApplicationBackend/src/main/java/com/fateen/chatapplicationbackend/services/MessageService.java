package com.fateen.chatapplicationbackend.services;


import com.fateen.chatapplicationbackend.models.Message;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.*;
import com.fateen.chatapplicationbackend.models.enums.MessageStatus;
import com.fateen.chatapplicationbackend.repository.MessageRepo;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MessageService {


    private final MessageRepo messageRepo;


    private final UserActionRepo userActionRepo;
    private final SimpMessagingTemplate messagingTemplate;


    public MessageService(MessageRepo messageRepo,UserActionRepo userActionRepo,SimpMessagingTemplate messagingTemplate) {
        this.messageRepo = messageRepo;
        this.userActionRepo = userActionRepo;
        this.messagingTemplate=messagingTemplate;
    }

    public MessageResponseDTO sendMessage(

            String senderUsername,

            Long receiverId,

            String ciphertext,

            String senderEncryptedAesKey,

            String receiverEncryptedAesKey,

            String iv
    ) {

        User sender = userActionRepo.findByUsername(senderUsername);

        User receiver = userActionRepo.findById(receiverId).orElseThrow();

        Message message = new Message();

        message.setSender(sender);
        message.setReceiver(receiver);
        message.setCiphertext(ciphertext);

        message.setSenderEncryptedAesKey(senderEncryptedAesKey);

        message.setReceiverEncryptedAesKey(receiverEncryptedAesKey);

        message.setIv(iv);
        message.setCreatedAt(Instant.now());
        message.setStatus(MessageStatus.SENT);

        messageRepo.save(message);

        return new MessageResponseDTO(
                message.getId(),
                sender.getId(),
                sender.getUsername(),
                receiver.getId(),
                message.getCiphertext(),
                message.getSenderEncryptedAesKey(),
                message.getReceiverEncryptedAesKey(),
                message.getIv(),
                message.getCreatedAt(),
                message.getStatus()
        );

    }

    public List<MessageResponseDTO> getConversation(
            String currentUsername,
            Long receiverId
    ) {

        User currentUser = userActionRepo
                .findByUsername(currentUsername);

        User receiver = userActionRepo
                .findById(receiverId)
                .orElseThrow();

        List<Message> messages =
                messageRepo.findConversation(
                        currentUser.getId(),
                        receiver.getId()
                );

        return messages.stream()
                .map(message -> new MessageResponseDTO(
                        message.getId(),
                        message.getSender().getId(),
                        message.getSender().getUsername(),
                        message.getReceiver().getId(),
                        message.getCiphertext(),
                        message.getSenderEncryptedAesKey(),
                        message.getReceiverEncryptedAesKey(),
                        message.getIv(),
                        message.getCreatedAt(),
                        message.getStatus()
                ))
                .toList();
    }

    public List<MessageResponseDTO> getChatMessages(Long receiverId,String senderUsername) {


        List<MessageResponseDTO> messages = getConversation(senderUsername,receiverId);
        return messages;

    }

    public List<RecentChatDTO> getRecentChats(String currentUsername) {

        User currentUser =
                userActionRepo.findByUsername(currentUsername);

        List<Message> messages =
                messageRepo.findRecentMessages(currentUser.getId());

        Map<Long, RecentChatDTO> recentChats =
                new LinkedHashMap<>();

        for (Message message : messages) {

            User otherUser;

            if (message.getSender().getId().equals(currentUser.getId())) {
                otherUser = message.getReceiver();
            } else {
                otherUser = message.getSender();
            }

            if (!recentChats.containsKey(otherUser.getId())) {

                recentChats.put(
                        otherUser.getId(),
                        new RecentChatDTO(

                                otherUser.getId(),

                                otherUser.getUsername(),

                                otherUser.getEmail(),

                                message.getCiphertext(),

                                message.getSenderEncryptedAesKey(),

                                message.getReceiverEncryptedAesKey(),

                                message.getIv(),

                                message.getCreatedAt()
                        )
                );
            }
        }

        return recentChats.values().stream().toList();
    }

    public void markMessagesAsRead(
            List<Long> messageIds,
            String currentUsername
    ) {

        User currentUser =
                userActionRepo.findByUsername(currentUsername);

        List<Message> messages =
                messageRepo.findAllById(messageIds);

        for (Message message : messages) {

        /*
        Security check
        Only receiver can mark as read
        */
            if (!message.getReceiver().getId()
                    .equals(currentUser.getId())) {
                continue;
            }

            message.setStatus(MessageStatus.READ);

            messagingTemplate.convertAndSendToUser(
                    message.getSender().getUsername(),
                    "/queue/read",
                    new ReadReceiptDTO(message.getId())
            );
        }

        messageRepo.saveAll(messages);
    }

    public void markMessagesAsDelivered(

            List<Long> messageIds,
            String currentUsername
    ) {

        User currentUser =
                userActionRepo.findByUsername(
                        currentUsername
                );

        List<Message> messages =
                messageRepo.findAllById(
                        messageIds
                );

        for (Message message : messages) {

        /*
        Only receiver can mark delivered
        */

            if (!message.getReceiver()
                    .getId()
                    .equals(currentUser.getId())) {

                continue;
            }

        /*
        Prevent overwriting READ
        */

            if (
                    message.getStatus()
                            == MessageStatus.READ
            ) {

                continue;
            }

            message.setStatus(
                    MessageStatus.DELIVERED
            );

        /*
        Notify sender realtime
        */

            messagingTemplate
                    .convertAndSendToUser(

                            message.getSender()
                                    .getUsername(),

                            "/queue/delivered",

                            new DeliveryReceiptDTO(
                                    message.getId()
                            )
                    );
        }

        messageRepo.saveAll(messages);
    }
}

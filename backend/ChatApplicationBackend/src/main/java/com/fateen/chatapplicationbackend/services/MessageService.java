package com.fateen.chatapplicationbackend.services;


import com.fateen.chatapplicationbackend.models.Message;
import com.fateen.chatapplicationbackend.models.User;
import com.fateen.chatapplicationbackend.models.dto.MessageDTO;
import com.fateen.chatapplicationbackend.models.dto.MessageResponseDTO;
import com.fateen.chatapplicationbackend.models.dto.RecentChatDTO;
import com.fateen.chatapplicationbackend.models.dto.UserDTO;
import com.fateen.chatapplicationbackend.repository.MessageRepo;
import com.fateen.chatapplicationbackend.repository.UserActionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MessageService {


    private final MessageRepo messageRepo;


    private final UserActionRepo userActionRepo;


    public MessageService(MessageRepo messageRepo,UserActionRepo userActionRepo) {
        this.messageRepo = messageRepo;
        this.userActionRepo = userActionRepo;
    }

    public MessageResponseDTO sendMessage(String senderUsername, Long receiverId, String messageText) {

        User sender = userActionRepo.findByUsername(senderUsername);

        User receiver = userActionRepo.findById(receiverId).orElseThrow();

        Message message = new Message();

        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessageText(messageText);
        message.setCreatedAt(LocalDateTime.now());
        message.setRead(false);

        messageRepo.save(message);

        return new MessageResponseDTO(
                message.getId(),
                sender.getId(),
                sender.getUsername(),
                receiver.getId(),
                messageText,
                message.getCreatedAt(),
                false
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

                        message.getMessageText(),

                        message.getCreatedAt(),

                        message.isRead()

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

                                message.getMessageText(),

                                message.getCreatedAt()
                        )
                );
            }
        }

        return recentChats.values().stream().toList();
    }
}

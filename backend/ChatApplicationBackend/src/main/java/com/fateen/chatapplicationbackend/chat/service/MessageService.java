package com.fateen.chatapplicationbackend.chat.service;


import com.fateen.chatapplicationbackend.chat.dto.*;
import com.fateen.chatapplicationbackend.device.dto.DeviceKeyDTO;
import com.fateen.chatapplicationbackend.device.model.Device;
import com.fateen.chatapplicationbackend.chat.model.Message;
import com.fateen.chatapplicationbackend.chat.model.MessageDeviceKey;
import com.fateen.chatapplicationbackend.auth.model.User;
import com.fateen.chatapplicationbackend.chat.dto.MessageStatus;
import com.fateen.chatapplicationbackend.device.repository.DeviceRepository;
import com.fateen.chatapplicationbackend.chat.repository.MessageDeviceKeyRepository;
import com.fateen.chatapplicationbackend.chat.repository.MessageRepo;
import com.fateen.chatapplicationbackend.useraction.repository.UserActionRepo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class MessageService {


    private final MessageRepo messageRepo;


    private final UserActionRepo userActionRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageDeviceKeyRepository messageDeviceKeyRepository;

    private final DeviceRepository deviceRepository;


    public MessageService(MessageRepo messageRepo, UserActionRepo userActionRepo, SimpMessagingTemplate messagingTemplate, MessageDeviceKeyRepository messageDeviceKeyRepository, DeviceRepository deviceRepository) {
        this.messageRepo = messageRepo;
        this.userActionRepo = userActionRepo;
        this.messagingTemplate=messagingTemplate;
        this.messageDeviceKeyRepository = messageDeviceKeyRepository;
        this.deviceRepository = deviceRepository;
    }

    private void notifyAllDevices(
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

    private Optional<MessageDeviceKey> findReadableKeyForCurrentDevice(
            Message message,
            User currentUser,
            Long currentDeviceId
    ) {
        Optional<MessageDeviceKey> directKey =
                messageDeviceKeyRepository.findByMessageIdAndDeviceId(
                        message.getId(),
                        currentDeviceId
                );

        if (directKey.isPresent()) {
            return directKey;
        }

        Device currentDevice =
                deviceRepository.findByIdAndActiveTrue(currentDeviceId)
                        .orElseThrow(() -> new RuntimeException("Current device not found"));

        String currentPublicKey =
                currentDevice.getPublicKey();

        if (currentPublicKey == null || currentPublicKey.isBlank()) {
            return Optional.empty();
        }

        List<MessageDeviceKey> fallbackKeys =
                messageDeviceKeyRepository.findKeysForSameUserAndPublicKey(
                        message.getId(),
                        currentUser.getId(),
                        currentPublicKey
                );

        if (fallbackKeys.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(fallbackKeys.get(0));
    }

    public MessageResponseDTO getMessageForDevice(
            Long messageId,
            Long deviceId
    ) {
        Message message =
                messageRepo.findById(messageId)
                        .orElseThrow();

        Device currentDevice =
                deviceRepository.findByIdAndActiveTrue(deviceId)
                        .orElseThrow(() -> new RuntimeException("Current device not found"));

        User currentUser =
                currentDevice.getUser();

        Optional<MessageDeviceKey> key =
                findReadableKeyForCurrentDevice(
                        message,
                        currentUser,
                        deviceId
                );

        return new MessageResponseDTO(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getUsername(),
                message.getReceiver().getId(),
                message.getCiphertext(),
                key.map(MessageDeviceKey::getEncryptedAesKey).orElse(null),
                message.getIv(),
                message.getCreatedAt(),
                message.getStatus()
        );
    }


    @Transactional
    public MessageResponseDTO sendMessage(
            String senderUsername,
            Long receiverId,
            Long currentDeviceId,
            SendMessageDTO request
    ){


        String username =
                senderUsername.split(":")[0];

        User sender =
                userActionRepo.findByUsername(username);

        User receiver = userActionRepo.findById(receiverId).orElseThrow();


        if (request.keys() == null || request.keys().isEmpty()) {
            throw new RuntimeException(
                    "Missing device keys"
            );
        }

        List<Long> providedDeviceIds =
                request.keys()
                        .stream()
                        .map(DeviceKeyDTO::deviceId)
                        .toList();

        Set<Long> uniqueProvidedDeviceIds =
                new HashSet<>(providedDeviceIds);

        if (uniqueProvidedDeviceIds.size() != providedDeviceIds.size()) {
            throw new RuntimeException(
                    "Duplicate device keys in request"
            );
        }

        List<Long> senderDeviceIds =
                deviceRepository.findByUserAndActiveTrue(sender)
                        .stream()
                        .map(Device::getId)
                        .toList();

        List<Long> receiverDeviceIds =
                deviceRepository.findByUserAndActiveTrue(receiver)
                        .stream()
                        .map(Device::getId)
                        .toList();

        Set<Long> requiredDeviceIds =
                new HashSet<>();

        requiredDeviceIds.addAll(senderDeviceIds);
        requiredDeviceIds.addAll(receiverDeviceIds);

        if (!uniqueProvidedDeviceIds.containsAll(requiredDeviceIds)) {
            throw new RuntimeException(
                    "Missing encrypted AES key for one or more active devices"
            );
        }

        if (!uniqueProvidedDeviceIds.contains(currentDeviceId)) {
            throw new RuntimeException(
                    "Missing encrypted AES key for current device"
            );
        }

        Message message = new Message();

        message.setSender(sender);

        message.setReceiver(receiver);

        message.setCiphertext(
                request.ciphertext()
        );

        message.setIv(
                request.iv()
        );

        message.setCreatedAt(
                Instant.now()
        );

        message.setStatus(
                MessageStatus.SENT
        );

        messageRepo.save(message);

        for (DeviceKeyDTO key : request.keys()) {

            Device device =
                    deviceRepository
                            .findById(key.deviceId())
                            .orElseThrow();

            if (!device.isActive()) {
                throw new RuntimeException(
                        "Inactive device"
                );
            }

            boolean allowed =
                    device.getUser().getId().equals(sender.getId())
                            ||
                            device.getUser().getId().equals(receiver.getId());

            if (!allowed) {
                throw new RuntimeException(
                        "Invalid device"
                );
            }

            MessageDeviceKey messageDeviceKey =
                    new MessageDeviceKey();

            messageDeviceKey.setMessage(message);

            messageDeviceKey.setDevice(device);

            messageDeviceKey.setEncryptedAesKey(
                    key.encryptedAesKey()
            );




            messageDeviceKeyRepository.save(
                    messageDeviceKey
            );
        }

        MessageDeviceKey currentDeviceKey =
                messageDeviceKeyRepository
                        .findByMessageIdAndDeviceId(
                                message.getId(),
                                currentDeviceId
                        )
                        .orElseThrow();

        return new MessageResponseDTO(
                message.getId(),
                sender.getId(),
                sender.getUsername(),
                receiver.getId(),
                message.getCiphertext(),
                currentDeviceKey.getEncryptedAesKey(),
                message.getIv(),
                message.getCreatedAt(),
                message.getStatus()
        );

    }

    public List<MessageResponseDTO> getConversation(
            String currentUsername,
            Long receiverId,
            Long deviceId
    ) {
        String username =
                currentUsername.split(":")[0];

        User currentUser =
                userActionRepo.findByUsername(username);

        User receiver = userActionRepo
                .findById(receiverId)
                .orElseThrow();

        List<Message> messages =
                messageRepo.findConversation(
                        currentUser.getId(),
                        receiver.getId()
                );

        return messages.stream()
                .map(message -> {
                    Optional<MessageDeviceKey> key =
                            findReadableKeyForCurrentDevice(
                                    message,
                                    currentUser,
                                    deviceId
                            );

                    return new MessageResponseDTO(
                            message.getId(),
                            message.getSender().getId(),
                            message.getSender().getUsername(),
                            message.getReceiver().getId(),
                            message.getCiphertext(),
                            key.map(MessageDeviceKey::getEncryptedAesKey).orElse(null),
                            message.getIv(),
                            message.getCreatedAt(),
                            message.getStatus()
                    );
                })
                .toList();
    }

    public List<MessageResponseDTO> getChatMessages(
            Long receiverId,
            String senderUsername,
            Long deviceId
    ) {


        return getConversation(
                senderUsername,
                receiverId,
                deviceId
        );

    }

    public List<RecentChatDTO> getRecentChats(
            String currentUsername,
            Long deviceId
    ) {
        String username =
                currentUsername.split(":")[0];

        User currentUser =
                userActionRepo.findByUsername(username);

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

            if (recentChats.containsKey(otherUser.getId())) {
                continue;
            }

            Optional<MessageDeviceKey> key =
                    findReadableKeyForCurrentDevice(
                            message,
                            currentUser,
                            deviceId
                    );

            recentChats.put(
                    otherUser.getId(),
                    new RecentChatDTO(
                            otherUser.getId(),
                            otherUser.getUsername(),
                            otherUser.getEmail(),
                            message.getCiphertext(),
                            key.map(MessageDeviceKey::getEncryptedAesKey).orElse(null),
                            message.getIv(),
                            message.getCreatedAt()
                    )
            );
        }

        return recentChats.values().stream().toList();
    }

    public void markMessagesAsRead(
            List<Long> messageIds,
            String currentUsername
    ) {

        String username =
                currentUsername.split(":")[0];

        User currentUser =
                userActionRepo.findByUsername(username);

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

            notifyAllDevices(
                    message.getSender(),
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

        String username =
                currentUsername.split(":")[0];

        User currentUser =
                userActionRepo.findByUsername(
                        username
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

            notifyAllDevices(

                            message.getSender(),

                            "/queue/delivered",

                            new DeliveryReceiptDTO(
                                    message.getId()
                            )
                    );
        }

        messageRepo.saveAll(messages);
    }
}

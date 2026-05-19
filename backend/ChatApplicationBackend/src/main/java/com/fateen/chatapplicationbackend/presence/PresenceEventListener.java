package com.fateen.chatapplicationbackend.presence;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(
            SessionConnectEvent event
    ) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication user =
                (Authentication) accessor.getUser();

        if (user == null) {
            return;
        }

        String username = user.getName();


        presenceService.userConnected(username);


        messagingTemplate.convertAndSend(
                "/topic/presence",
                new PresenceEventDTO(
                        "ONLINE",
                        username
                )
        );

        System.out.println(username + " connected");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(
            SessionDisconnectEvent event
    ) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Authentication user =
                (Authentication) accessor.getUser();

        if (user == null) {
            return;
        }

        String username = user.getName();

        /*
        Mark offline / decrement count
        */
        presenceService.userDisconnected(username);

        /*
        Broadcast offline event ONLY
        if fully offline
        */
        if (!presenceService.isOnline(username)) {

            messagingTemplate.convertAndSend(
                    "/topic/presence",
                    new PresenceEventDTO(
                            "OFFLINE",
                            username
                    )
            );
        }

        System.out.println(username + " disconnected");
    }
}
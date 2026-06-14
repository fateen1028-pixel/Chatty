package com.fateen.chatapplicationbackend.chat.security;

import com.fateen.chatapplicationbackend.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(
            Message<?> message,
            @NonNull MessageChannel channel
    ) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        assert accessor != null;
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader =
                    accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null &&
                    authHeader.startsWith("Bearer ")) {

                String token =
                        authHeader.substring(7);

                if (jwtService.isAccessTokenValid(token)) {

                    String username =
                            jwtService.extractUsername(token);

                    Long deviceId =
                            jwtService.extractDeviceId(token);

                    accessor.getSessionAttributes()
                            .put(
                                    "deviceId",
                                    deviceId
                            );

                    String principalName =
                            username + ":" + deviceId;

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    principalName,
                                    null,
                                    List.of()
                            );

                    accessor.setUser(auth);

                } else {

                    throw new IllegalArgumentException(
                            "Invalid JWT Token"
                    );
                }
            }
        }

        return message;
    }
}
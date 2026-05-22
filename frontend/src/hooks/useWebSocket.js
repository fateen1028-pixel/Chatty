import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(currentUserToken, currentUsername, setMessagesMap, setOnlineUsers) {
  const stompClientRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!currentUserToken) {
      return;
    }

    if (stompClientRef.current?.connected) {
      return;
    }

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('https://chatapp-backend-pvqn.onrender.com/ws'),
      connectHeaders: {
        Authorization: `Bearer ${currentUserToken}`
      },
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
      onConnect: () => {
        console.log('WebSocket Connected');

        stompClient.subscribe('/user/queue/messages', (message) => {
          const msg = JSON.parse(message.body);
          const isSentByMe = msg.senderUsername === currentUsername;
          const conversationId = isSentByMe ? msg.receiverId : msg.senderId;

          setMessagesMap(prev => {
            const existingMessages = prev[conversationId] || [];
            const alreadyExists = existingMessages.some(m => m.id === msg.id);

            if (alreadyExists) {
              return prev;
            }

            return {
              ...prev,
              [conversationId]: [...existingMessages, msg]
            };
          });

          if (!isSentByMe) {
            stompClient.publish({
              destination: '/app/chat.delivered',
              body: JSON.stringify({ messageIds: [msg.id] })
            });
          }

          window.dispatchEvent(new Event('refreshRecentChats'));
        });

        stompClient.subscribe('/user/queue/delivered', (message) => {
          const receipt = JSON.parse(message.body);
          setMessagesMap(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(conversationId => {
              updated[conversationId] = updated[conversationId].map(msg => {
                if (msg.id === receipt.messageId) {
                  return { ...msg, status: 'DELIVERED' };
                }
                return msg;
              });
            });
            return updated;
          });
        });

        stompClient.subscribe('/user/queue/read', (message) => {
          const receipt = JSON.parse(message.body);
          setMessagesMap(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(conversationId => {
              updated[conversationId] = updated[conversationId].map(msg => {
                if (msg.id === receipt.messageId) {
                  return { ...msg, status: 'READ' };
                }
                return msg;
              });
            });
            return updated;
          });
        });

        stompClient.subscribe('/user/queue/typing', (message) => {
          const typingEvent = JSON.parse(message.body);
          setTypingUsers(prev => ({
            ...prev,
            [typingEvent.senderUsername]: typingEvent.typing
          }));
        });

        stompClient.subscribe('/topic/presence', (message) => {
          const presenceEvent = JSON.parse(message.body);
          setOnlineUsers(prev => {
            const updated = new Set(prev);
            if (presenceEvent.type === 'ONLINE') {
              updated.add(presenceEvent.username);
            }
            if (presenceEvent.type === 'OFFLINE') {
              updated.delete(presenceEvent.username);
            }
            return updated;
          });
        });
      },
      onStompError: (frame) => {
        console.error(frame.headers['message']);
        console.error(frame.body);
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [currentUserToken, currentUsername, setMessagesMap, setOnlineUsers]);

  return { stompClientRef, typingUsers };
}
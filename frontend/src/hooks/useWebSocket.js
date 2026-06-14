import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { decryptChatMessage } from '../crypto/e2ee';
import { getPrivateKey } from '../crypto/storage';

export function useWebSocket(
  currentUsername,
  setMessagesMap,
  setOnlineUsers
) {

  const stompClientRef = useRef(null);

  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {



    const connectWebSocket = async () => {

      try {

        /*
        ============================
        GET LATEST ACCESS TOKEN
        ============================
        */

        const accessToken =
          localStorage.getItem('accessToken');

        if (!accessToken) {
          return;
        }

        /*
        ============================
        PREVENT DUPLICATE CONNECTIONS
        ============================
        */

        if (stompClientRef.current?.connected) {
          return;
        }

        /*
        ============================
        CREATE CLIENT
        ============================
        */

        const stompClient = new Client({

          webSocketFactory: () =>
            new SockJS(
              `${import.meta.env.VITE_API_URL}/ws`
            ),

          beforeConnect: async () => {

  let accessToken =
    localStorage.getItem('accessToken');

  /*
  ACCESS TOKEN MISSING
  */

  if (!accessToken) {

    /*
    REQUEST NEW ACCESS TOKEN
    */

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {
        method: 'POST',
        credentials: "include",

        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {

      localStorage.removeItem('accessToken');

      window.location.href = '/login';

      return;
    }

    const data = await response.json();

    accessToken = data.accessToken;

    localStorage.setItem(
      'accessToken',
      accessToken
    );
  }

  stompClient.connectHeaders = {

    Authorization:
      `Bearer ${accessToken}`
  };
},

          reconnectDelay: 5000,

          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          debug: (str) => {
            console.log('[STOMP]', str);
          },

          /*
          ============================
          ON CONNECT
          ============================
          */

          onConnect: () => {

            console.log('✅ WebSocket Connected');

            /*
            ============================
            PRIVATE MESSAGES
            ============================
            */

            stompClient.subscribe(
              '/user/queue/messages',
              async (message) => {

                const msg =
                  JSON.parse(message.body);

                  console.log("RAW", msg);

                  const isSentByMe =
  msg.senderUsername === currentUsername;

                  try {
                      const privateKey =
                          await getPrivateKey(currentUsername);

                      if (
                          privateKey &&
                          msg.cipherText &&
                          msg.encryptedAesKey
                      ) {
                          const decryptedText =
                              await decryptChatMessage(
                                  msg.cipherText,
                                  msg.encryptedAesKey,
                                  msg.iv,
                                  privateKey
                              );

                          msg.message =
                              decryptedText;
                      }

                  } catch (error) {
                      console.error(
                          'Decryption failed',
                          error
                      );

                      msg.message =
                          "[Decryption Failed]";
                  }

                

                const conversationId =
                  isSentByMe
                    ? msg.receiverId
                    : msg.senderId;

                    console.log(
  "STORING MESSAGE",
  JSON.stringify(msg, null, 2)
);

                setMessagesMap(prev => {

                  const existingMessages =
                    prev[conversationId] || [];

                  const alreadyExists =
                    existingMessages.some(
                      m => m.id === msg.id
                    );

                  if (alreadyExists) {
                    return prev;
                  }

                  return {
                    ...prev,
                    [conversationId]: [
                      ...existingMessages,
                      msg
                    ]
                  };
                });

                /*
                DELIVERED RECEIPT
                */

                if (!isSentByMe) {

                  stompClient.publish({

                    destination:
                      '/app/chat.delivered',

                    body: JSON.stringify({

                      messageIds: [msg.id]
                    })
                  });
                }

                window.dispatchEvent(
                  new Event('refreshRecentChats')
                );
              }
            );

            /*
            ============================
            DELIVERED
            ============================
            */

            stompClient.subscribe(
              '/user/queue/delivered',
              (message) => {

                const receipt =
                  JSON.parse(message.body);

                setMessagesMap(prev => {

                  const updated = { ...prev };

                  Object.keys(updated)
                    .forEach(conversationId => {

                      updated[conversationId] =
                        updated[conversationId]
                          .map(msg => {

                            if (
                              msg.id === receipt.messageId
                            ) {

                              return {
                                ...msg,
                                status: 'DELIVERED'
                              };
                            }

                            return msg;
                          });
                    });

                  return updated;
                });
              }
            );

            /*
            ============================
            READ
            ============================
            */

            stompClient.subscribe(
              '/user/queue/read',
              (message) => {

                const receipt =
                  JSON.parse(message.body);

                setMessagesMap(prev => {

                  const updated = { ...prev };

                  Object.keys(updated)
                    .forEach(conversationId => {

                      updated[conversationId] =
                        updated[conversationId]
                          .map(msg => {

                            if (
                              msg.id === receipt.messageId
                            ) {

                              return {
                                ...msg,
                                status: 'READ'
                              };
                            }

                            return msg;
                          });
                    });

                  return updated;
                });
              }
            );

            /*
            ============================
            TYPING
            ============================
            */

              stompClient.subscribe(
                  "/user/queue/typing",
                  (message) => {
                      const typingEvent =
                          JSON.parse(message.body);

                      const cleanSender =
                          typingEvent.senderUsername
                              ?.split(":")[0]
                              ?.trim()
                              ?.toLowerCase();

                      setTypingUsers(prev => ({
                          ...prev,
                          [cleanSender]: typingEvent.typing
                      }));
                  }
              );

            /*
            ============================
            PRESENCE
            ============================
            */

              stompClient.subscribe(
                  "/topic/presence",
                  (message) => {
                      const presenceEvent =
                          JSON.parse(message.body);

                      const cleanUsername =
                          presenceEvent.username
                              ?.split(":")[0]
                              ?.trim()
                              ?.toLowerCase();

                      setOnlineUsers(prev => {
                          const updated = new Set(prev);

                          if (presenceEvent.type === "ONLINE") {
                              updated.add(cleanUsername);
                          }

                          if (presenceEvent.type === "OFFLINE") {
                              updated.delete(cleanUsername);
                          }

                          return updated;
                      });
                  }
              );
          },

          /*
          ============================
          STOMP ERROR
          ============================
          */

          onStompError: (frame) => {

            console.error(
              '❌ Broker Error:',
              frame.headers['message']
            );

            console.error(frame.body);
          },

          /*
          ============================
          WEBSOCKET CLOSED
          ============================
          */

          onWebSocketClose: () => {

            console.log(
              '⚠️ WebSocket Closed'
            );
          },

          /*
          ============================
          WEBSOCKET ERROR
          ============================
          */

          onWebSocketError: (event) => {

            console.error(
              '❌ WebSocket Error',
              event
            );
          }
        });

        stompClient.activate();

        stompClientRef.current =
          stompClient;

      } catch (err) {

        console.error(
          'WebSocket connection failed',
          err
        );
      }
    };

    connectWebSocket();

    /*
    ============================
    CLEANUP
    ============================
    */

    return () => {



      if (stompClientRef.current) {

        console.log(
          '🛑 Disconnecting WebSocket'
        );

        stompClientRef.current.deactivate();
      }
    };

  }, []);

  return {
    stompClientRef,
    typingUsers
  };
}
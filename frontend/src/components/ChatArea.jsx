import {
  useState,
  useEffect,
  useRef,
  useMemo
} from 'react';

import ChatHeader from './ChatArea/ChatHeader';
import MessageList from './ChatArea/MessageList';
import MessageInput from './ChatArea/MessageInput';
import { useChatHistory } from '../hooks/useChatHistory';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { useWebSocket } from '../hooks/useWebSocket';
import { encryptChatMessageForDevices } from '../crypto/e2ee';
import {apiFetch} from "../services/api.js";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatArea({
  chat,
  onBack
}) {

  /*
  ==========================================
  STATE & REFS
  ==========================================
  */

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  /*
  ==========================================
  AUTH
  ==========================================
  */

  const accessToken = localStorage.getItem('accessToken');
  const currentUsername = localStorage.getItem('username');

  /*
  ==========================================
  CUSTOM HOOKS
  ==========================================
  */

  const { messagesMap, setMessagesMap } = useChatHistory(chat, accessToken);
  const { onlineUsers, setOnlineUsers } = useOnlineUsers(accessToken);
  const { stompClientRef, typingUsers } = useWebSocket(currentUsername, setMessagesMap, setOnlineUsers);

  /*
  ==========================================
  CLEANUP
  ==========================================
  */

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  /*
  ==========================================
  AUTO SCROLL
  ==========================================
  */

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({

        behavior: 'smooth'
      });

  }, [
    messagesMap,
    chat
  ]);

  /*
  ==========================================
  CURRENT CHAT MESSAGES
  ==========================================
  */

  const currentMessages = useMemo(
    () => messagesMap[chat?.id] || [],
    [messagesMap, chat?.id]
  );

  /*
  ==========================================
  MARK READ
  ==========================================
  */

  useEffect(() => {

    if (!chat) {
      return;
    }

    if (
      !stompClientRef.current
        ?.connected
    ) {
      return;
    }

    const unreadMessageIds =
      currentMessages
        .filter(msg =>

          msg.senderUsername !==
          currentUsername &&

          msg.status !==
          'READ'
        )
        .map(msg => msg.id);

    if (
      unreadMessageIds.length === 0
    ) {
      return;
    }

    // Optimistically update local state to 'READ' to break infinite loop
    setMessagesMap(prev => {
      const updated = { ...prev };
      if (updated[chat.id]) {
        updated[chat.id] = updated[chat.id].map(msg => {
          if (unreadMessageIds.includes(msg.id)) {
            return { ...msg, status: 'READ' };
          }
          return msg;
        });
      }
      return updated;
    });

    stompClientRef.current
      .publish({

        destination:
          '/app/chat.read',

        body: JSON.stringify({

          messageIds:
            unreadMessageIds
        })
      });

  }, [
    chat,
    chat?.id,
    currentMessages,
    currentUsername,
    stompClientRef,
    setMessagesMap
  ]);

  /*
  ==========================================
  TYPING EVENT
  ==========================================
  */

    const handleTyping = (value) => {
        if (isSending) {
            return;
        }

        setInput(value);

        if (!stompClientRef.current?.connected) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;

            stompClientRef.current.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({
                    receiverId: chat.id,
                    typing: true
                })
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;

            stompClientRef.current?.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({
                    receiverId: chat.id,
                    typing: false
                })
            });
        }, 1200);
    };

  /*
  ==========================================
  SEND MESSAGE
  ==========================================
  */

    const handleSend =
        async (e) => {

            e.preventDefault();

            if (
                !input.trim() ||
                !chat ||
                isSending
            ) {
                return;
            }

            if (
                !stompClientRef.current
                    ?.connected
            ) {
                return;
            }

            const messageToSend =
                input.trim();

            setIsSending(true);

            try {
                const senderDevicesResponse =
                    await apiFetch(
                        `/users/${currentUsername}/devices`
                    );

                if (!senderDevicesResponse.ok) {
                    console.error("Failed to fetch sender devices");
                    return;
                }

                const receiverDevicesResponse =
                    await apiFetch(
                        `/users/${chat.name}/devices`
                    );

                if (!receiverDevicesResponse.ok) {
                    console.error("Failed to fetch receiver devices");
                    return;
                }

                const senderDevices =
                    await senderDevicesResponse.json();

                const receiverDevices =
                    await receiverDevicesResponse.json();

                const allDevices =
                    Array.from(
                        new Map(
                            [
                                ...senderDevices,
                                ...receiverDevices
                            ].map(device => [
                                device.deviceId,
                                device
                            ])
                        ).values()
                    );

                const encryptedPayload =
                    await encryptChatMessageForDevices(
                        messageToSend,
                        allDevices
                    );

                stompClientRef.current
                    .publish({
                        destination:
                            '/app/chat',

                        body: JSON.stringify({
                            receiverId: chat.id,
                            ciphertext: encryptedPayload.ciphertext,
                            iv: encryptedPayload.iv,
                            keys: encryptedPayload.keys
                        })
                    });

                /*
                Stop typing
                */

                stompClientRef.current
                    .publish({
                        destination:
                            '/app/chat.typing',

                        body: JSON.stringify({
                            receiverId: chat.id,
                            typing: false
                        })
                    });

                isTypingRef.current = false;

                setInput('');

            } catch (error) {
                console.error(
                    'Error encrypting and sending message:',
                    error
                );
            } finally {
                setIsSending(false);
            }
        };

  /*
  ==========================================
  EMPTY CHAT
  ==========================================
  */

  if (!chat) {

    return (

      <div className="flex-1 flex items-center justify-center">

        <h2 className="text-2xl font-bold">

          Select a chat

        </h2>

      </div>
    );
  }

  /*
  ==========================================
  ONLINE
  ==========================================
  */

    const normalizedChatName =
        chat.name?.trim().toLowerCase();

    const isOnline =
        onlineUsers.has(normalizedChatName);

  /*
  ==========================================
  IS TYPING
  ==========================================
  */



    const isTyping =
        Boolean(
            typingUsers[normalizedChatName]
        );

  /*
  ==========================================
  UI
  ==========================================
  */

  return (

    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0B0C0E] h-full">

      <ChatHeader 
        chat={chat} 
        onBack={onBack} 
        isOnline={isOnline} 
        isTyping={isTyping} 
      />

      <MessageList 
        currentMessages={currentMessages} 
        currentUsername={currentUsername} 
        messagesEndRef={messagesEndRef} 
      />

        <MessageInput
            input={input}
            isSending={isSending}
            handleTyping={handleTyping}
            handleSend={handleSend}
        />

    </div>
  );
}
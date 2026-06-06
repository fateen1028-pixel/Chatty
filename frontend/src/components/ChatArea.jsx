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
import { encryptChatMessage } from '../crypto/e2ee';
import { importPublicKey } from '../crypto/rsa';
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
        setInput(value);

        if (!stompClientRef.current?.connected) return;

        // send "typing true" ONLY ONCE
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

        // reset stop timer
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
        !chat
      ) {
        return;
      }

      if (
        !stompClientRef.current
          ?.connected
      ) {
        return;
      }

      console.log("TOKEN = ", localStorage.getItem("accessToken"));

      try {
          console.log("USING APIFETCH");

          const response =
              await apiFetch(
                  `/keys/public/${chat.id}`
              );

          console.log("STATUS =", response.status);

          if (!response.ok) {
              const body = await response.text();
              console.log("BODY =", body);
              return;
          }

          const data = await response.json();

        const receiverPublicKey = await importPublicKey(data.receiverPublicKey);


        const senderPublicKey = await importPublicKey(data.senderPublicKey);

        const encryptedPayload =
          await encryptChatMessage(
            input.trim(),
            senderPublicKey,
            receiverPublicKey
          );

        // localStorage.setItem(
        //   'sent_' + encryptedPayload.ciphertext,
        //   input.trim()
        // );

        stompClientRef.current
          .publish({

            destination:
              '/app/chat',

            body: JSON.stringify({

              receiverId: chat.id,

              ciphertext: encryptedPayload.ciphertext,

              senderEncryptedAesKey: encryptedPayload.senderEncryptedAesKey,

              receiverEncryptedAesKey: encryptedPayload.receiverEncryptedAesKey,

              iv: encryptedPayload.iv
            })
          });
      } catch (error) {
        console.error('Error encrypting and sending message:', error);
      }

      /*
      Stop typing
      */

      stompClientRef.current
        .publish({

          destination:
            '/app/chat.typing',

          body: JSON.stringify({

            receiverId:
              chat.id,

            typing: false
          })
        });

      setInput('');
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

  const isOnline =
    onlineUsers.has(
      chat.name
    );

  /*
  ==========================================
  IS TYPING
  ==========================================
  */

  const isTyping =
    typingUsers[
      chat.name
    ];

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
        handleTyping={handleTyping} 
        handleSend={handleSend} 
      />

    </div>
  );
}
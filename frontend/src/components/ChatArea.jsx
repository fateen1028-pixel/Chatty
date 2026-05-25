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
  const { stompClientRef, typingUsers } = useWebSocket(accessToken, currentUsername, setMessagesMap, setOnlineUsers);

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
    stompClientRef
  ]);

  /*
  ==========================================
  TYPING EVENT
  ==========================================
  */

  const handleTyping =
    (value) => {

      setInput(value);

      if (
        !stompClientRef.current
          ?.connected
      ) {
        return;
      }

      /*
      User started typing
      */

      stompClientRef.current
        .publish({

          destination:
            '/app/chat.typing',

          body: JSON.stringify({

            receiverId:
              chat.id,

            typing: true
          })
        });

      /*
      Reset timer
      */

      if (
        typingTimeoutRef.current
      ) {

        clearTimeout(
          typingTimeoutRef.current
        );
      }

      /*
      Stop typing
      */

      typingTimeoutRef.current =
        setTimeout(() => {

          stompClientRef.current
            ?.publish({

              destination:
                '/app/chat.typing',

              body: JSON.stringify({

                receiverId:
                  chat.id,

                typing: false
              })
            });

        }, 1500);
    };

  /*
  ==========================================
  SEND MESSAGE
  ==========================================
  */

  const handleSend =
    (e) => {

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

      stompClientRef.current
        .publish({

          destination:
            '/app/chat',

          body: JSON.stringify({

            receiverId:
              chat.id,

            message:
              input.trim()
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
      chat.username
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
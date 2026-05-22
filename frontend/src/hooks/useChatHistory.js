import { useState, useEffect, useRef } from 'react';

export function useChatHistory(chat, currentUserToken) {
  const [messagesMap, setMessagesMap] = useState({});
  const loadedChatsRef = useRef(new Set());

  useEffect(() => {
    if (!chat || !currentUserToken) {
      return;
    }

    if (loadedChatsRef.current.has(chat.id)) {
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/messages/chat/${chat.id}`,
          {
            headers: {
              Authorization: `Bearer ${currentUserToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setMessagesMap(prev => {
          const realtimeMessages = prev[chat.id] || [];
          const mergedMessages = [
            ...data,
            ...realtimeMessages.filter(
              realtimeMsg =>
                !data.some(
                  dbMsg => dbMsg.id === realtimeMsg.id
                )
            )
          ];

          return {
            ...prev,
            [chat.id]: mergedMessages
          };
        });

        loadedChatsRef.current.add(chat.id);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMessages();
  }, [chat, currentUserToken]);

  return { messagesMap, setMessagesMap };
}
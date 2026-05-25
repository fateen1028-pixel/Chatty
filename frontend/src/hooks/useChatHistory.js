import { useState, useEffect, useRef } from 'react';

import { apiFetch } from '../services/api';

export function useChatHistory(chat, accessToken) {
  const [messagesMap, setMessagesMap] = useState({});
  const loadedChatsRef = useRef(new Set());

  useEffect(() => {
    if (!chat || !accessToken) {
      return;
    }

    if (loadedChatsRef.current.has(chat.id)) {
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await apiFetch(`/messages/chat/${chat.id}`);

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
  }, [chat, accessToken]);

  return { messagesMap, setMessagesMap };
}
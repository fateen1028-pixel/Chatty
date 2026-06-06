import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { getPrivateKey } from '../crypto/storage';
import { decryptChatMessage } from '../crypto/e2ee';

export function useChatHistory(chat, accessToken) {
  const [messagesMap, setMessagesMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    // Guard clause: Don't fetch if dependencies are missing
    if (!chat || !accessToken) {
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch raw payloads from the backend DB
        const response = await apiFetch(`/messages/chat/${chat.id}`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const privateKey = await getPrivateKey(currentUsername);

        // 2. Parallel decryption in-memory via Promise.all
        const decryptedData =
            await Promise.all(
                data.map(async (msg) => {
                  if (msg.message) return msg;

                  try {
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

                      return {
                        ...msg,
                        message: decryptedText
                      };
                    }
                  } catch (error) {
                    console.error(
                        "Decryption failed for msg ID:",
                        msg.id,
                        error
                    );

                    return {
                      ...msg,
                      message: "[Decryption Failed]"
                    };
                  }

                  return msg;
                })
            );

        // 3. Update state map with deduplication
        setMessagesMap(prev => {
          const realtimeMessages = prev[chat.id] || [];
          const messageMap = new Map(realtimeMessages.map(m => [m.id, m]));

          decryptedData.forEach(m => messageMap.set(m.id, m));

          return {
            ...prev,
            [chat.id]: Array.from(messageMap.values()).sort((a, b) => a.id - b.id)
          };
        });

      } catch (error) {
        console.error("Failed fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // 4. Cleanup function: Wipes memory cache for the active chat room on switch
    return () => {
      setIsLoading(false);
      setMessagesMap(prev => {
        const updated = { ...prev };
        delete updated[chat.id];
        return updated;
      });
    };
  }, [chat, accessToken]);

  return { messagesMap, setMessagesMap, isLoading };
}
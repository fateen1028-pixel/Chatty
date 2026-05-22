import { useState, useEffect } from 'react';

export function useOnlineUsers(currentUserToken) {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!currentUserToken) {
      return;
    }

    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch(
          'https://chatapp-backend-pvqn.onrender.com/presence/online-users',
          {
            headers: {
              Authorization: `Bearer ${currentUserToken}`
            }
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setOnlineUsers(new Set(data));
      } catch (error) {
        console.error(error);
      }
    };

    fetchOnlineUsers();
  }, [currentUserToken]);

  return { onlineUsers, setOnlineUsers };
}
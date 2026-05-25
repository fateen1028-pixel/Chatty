import { useState, useEffect } from 'react';

import { apiFetch } from '../services/api';

export function useOnlineUsers(accessToken) {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchOnlineUsers = async () => {
      try {
        const response = await apiFetch(`/presence/online-users`);

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
  }, [accessToken]);

  return { onlineUsers, setOnlineUsers };
}
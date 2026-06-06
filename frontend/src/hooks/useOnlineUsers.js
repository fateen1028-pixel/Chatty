import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

function normalizeUsername(username) {
  return username
      ?.split(":")[0]
      ?.trim()
      ?.toLowerCase();
}

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

        const normalizedUsers = data
            .map(normalizeUsername)
            .filter(Boolean);

        setOnlineUsers(new Set(normalizedUsers));
      } catch (error) {
        console.error(error);
      }
    };

    fetchOnlineUsers();
  }, [accessToken]);

  return { onlineUsers, setOnlineUsers };
}
import { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { apiFetch } from '../services/api';

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/user-data`, {
          method: 'GET'
        });

        if (res.ok) {
          const data = await res.json();

          localStorage.setItem('userId', data.id);
          localStorage.setItem('username', data.username);
          localStorage.setItem('email', data.email);
        }

        setContacts([]);
      } catch (e) {
        console.error("Failed to load user data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0B0C0E]">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading your chat...
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="flex h-screen bg-slate-50 dark:bg-[#0B0C0E] overflow-hidden selection:bg-indigo-500/30">
        <div
            className={`w-full md:w-[380px] lg:w-[420px] h-full flex-shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-[#0B0C0E]/30 backdrop-blur-xl ${
                selectedChat ? 'hidden md:flex' : 'flex'
            }`}
        >
          <Sidebar
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              contacts={contacts}
              setContacts={setContacts}
          />
        </div>

        <div
            className={`flex-1 h-full w-full bg-slate-50/50 dark:bg-transparent ${
                !selectedChat ? 'hidden md:flex' : 'flex'
            }`}
        >
          <ChatArea
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
              contacts={contacts}
              setContacts={setContacts}
          />
        </div>
      </div>
  );
}
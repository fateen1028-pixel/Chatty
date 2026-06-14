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
            <LoaderCircle className="w-8 h-8 animate-spin text-cyan-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading your chat...
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="flex h-[100dvh] bg-slate-50 dark:bg-[#0B0C0E] overflow-hidden selection:bg-cyan-500/30 relative">
        
        {/* Ambient Background Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           {/* Dark Mode Glows */}
           <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full transform-gpu will-change-transform"></div>
           <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full transform-gpu will-change-transform"></div>
           
           {/* Light Mode Glows */}
           <div className="dark:hidden absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-400/20 blur-[100px] rounded-full mix-blend-multiply transform-gpu will-change-transform"></div>
           <div className="dark:hidden absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-400/20 blur-[100px] rounded-full mix-blend-multiply transform-gpu will-change-transform"></div>
        </div>

        <div
            className={`relative z-10 w-full md:w-[380px] lg:w-[420px] h-full flex-shrink-0 border-r border-slate-200/60 dark:border-slate-800/50 bg-white/60 dark:bg-[#0B0C0E]/40 backdrop-blur-3xl ${
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
            className={`relative z-10 flex-1 h-full w-full bg-transparent ${
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
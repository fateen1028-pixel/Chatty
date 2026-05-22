import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Plus, Search, MessageSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({
  selectedChat,
  setSelectedChat,
  contacts,
  setContacts
}) {

  const { isDark, toggleTheme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  const username =
    localStorage.getItem('username') || 'User';

  const token =
    localStorage.getItem('token');

  const userAvatar =
    'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  // REPLACE ENTIRE useEffect WITH THIS

useEffect(() => {

  const loadRecentChats = async () => {

    try {

      const res = await fetch(
        'https://chatapp-backend-pvqn.onrender.com/messages/recent-chats',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error('Failed to load chats');
      }

      const data = await res.json();

      const formattedContacts = data.map(chat => ({

        id: chat.id,

        name: chat.username,

        email: chat.email,

        avatar:
          'https://cdn-icons-png.flaticon.com/512/149/149071.png',

        status: 'online',

        unread: 0,

        lastMessage: chat.lastMessage,

        time: chat.createdAt
          ? new Date(chat.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          : ''

      }));

      setContacts(formattedContacts);

    } catch (err) {

      console.error(err);
    }
  };

  loadRecentChats();

  window.addEventListener(
    "refreshRecentChats",
    loadRecentChats
  );

  return () => {

    window.removeEventListener(
      "refreshRecentChats",
      loadRecentChats
    );
  };

}, []);

  const handleLogout = () => {

    localStorage.clear();

    window.location.href = '/login';
  };

  const handleNewChat = async (e) => {

    e.preventDefault();

    setEmailError('');

    if (!emailInput.trim()) return;

    try {

      const res = await fetch(
        `https://chatapp-backend-pvqn.onrender.com/receiver/search/${emailInput}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error('User not found');
      }

      const data = await res.json();

      const newContact = {

        id: data.id,

        name: data.username,

        email: data.email,

        avatar:
          'https://cdn-icons-png.flaticon.com/512/149/149071.png',

        status: 'online',

        unread: 0,

        lastMessage: '',

        time: 'Just now'
      };

      setContacts(prev => {

        const exists =
          prev.find(c => c.id === newContact.id);

        if (exists) {
          return prev;
        }

        return [newContact, ...prev];
      });

      setSelectedChat(newContact);

      setIsModalOpen(false);

      setEmailInput('');

    } catch (err) {

      setEmailError(err.message);
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-[380px] flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B0C0E] h-full transition-colors relative">

      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={userAvatar}
              alt="Profile"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-[#111113] shadow-sm"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0B0C0E] rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {username}
            </h2>
            <span className="text-xs text-emerald-500 font-medium">
              Available
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all"
            title="New Chat"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200/50 dark:border-slate-800 transform transition-all">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">
              New Message
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Enter the email address of the person you want to chat with.
            </p>

            <form onSubmit={handleNewChat}>
              <input
                type="text"
                placeholder="Ex: john@example.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-2 px-1">
                  {emailError}
                </p>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-5 pb-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search messages or users"
            className="w-full bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all placeholder:text-slate-400"
          />
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-4">
        <h3 className="px-3 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Recent
        </h3>
        
        <div className="space-y-1">
          {contacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => setSelectedChat(contact)}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${
                selectedChat?.id === contact.id
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50 dark:ring-slate-900/50"
                />
                {contact.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                )}
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
                    {contact.name}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap ml-2">
                    {contact.time}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate pr-2">
                    {contact.lastMessage || "Started a conversation"}
                  </p>
                  {contact.unread > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No chats yet</p>
              <p className="text-xs text-slate-400 mt-1">Search for a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
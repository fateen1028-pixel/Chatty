import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Plus } from 'lucide-react';
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
        'http://localhost:8080/messages/recent-chats',
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
        `http://localhost:8080/receiver/search/${emailInput}`,
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
    <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full transition-colors relative">

      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">

        <div className="flex items-center space-x-3">

          <img
            src={userAvatar}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />

          <div>

            <h2 className="font-semibold text-slate-800 dark:text-slate-100">
              {username}
            </h2>

            <span className="text-xs text-green-500 font-medium">
              Online
            </span>

          </div>
        </div>

        <div className="flex space-x-2">

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <LogOut size={20} />
          </button>

        </div>
      </div>

      {isModalOpen && (

        <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-sm shadow-xl">

            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              New Message
            </h3>

            <form onSubmit={handleNewChat}>

              <input
                type="text"
                placeholder="Enter Recipient's Email ID"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded p-2 mb-2 focus:outline-none"
              />

              {emailError && (
                <p className="text-red-500 text-sm mb-4">
                  {emailError}
                </p>
              )}

              <div className="flex justify-end space-x-2 mt-4">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Chat
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-4">

        <div className="relative">

          <input
            type="text"
            placeholder="Search messages or users"
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />

          <span className="absolute left-3 top-2.5 text-slate-400">
            🔍
          </span>

        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        <h3 className="px-5 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Recent Chats
        </h3>

        {contacts.map(contact => (

          <div
            key={contact.id}
            onClick={() => setSelectedChat(contact)}
            className={`flex items-center p-4 cursor-pointer transition-colors ${
              selectedChat?.id === contact.id
                ? 'bg-indigo-50 dark:bg-slate-800 border-l-4 border-indigo-500'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >

            <div className="relative">

              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              {contact.status === 'online' && (

                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>

              )}
            </div>

            <div className="ml-4 flex-1 overflow-hidden">

              <div className="flex justify-between items-baseline mb-1">

                <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {contact.name}
                </h4>

                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                  {contact.time}
                </span>

              </div>

              <div className="flex justify-between items-center">

                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {contact.lastMessage}
                </p>

                {contact.unread > 0 && (

                  <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                    {contact.unread}
                  </span>

                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
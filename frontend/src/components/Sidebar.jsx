import { useState, useEffect } from 'react';
import {
    Moon,
    Sun,
    LogOut,
    Plus,
    Search,
    MessageSquare,
    LoaderCircle,
    ShieldCheck
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '../context/ThemeContext';
import { apiFetch } from '../services/api';
import { getPrivateKey } from '../crypto/storage';
import { decryptChatMessage } from '../crypto/e2ee';

export default function Sidebar({
                                    selectedChat,
                                    setSelectedChat,
                                    contacts,
                                    setContacts
                                }) {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isChatsLoading, setIsChatsLoading] = useState(true);
    const [isStartingChat, setIsStartingChat] = useState(false);


    const username =
        localStorage.getItem('username') || 'User';

    const userAvatar =
        'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    useEffect(() => {
        const loadRecentChats = async () => {
            setIsChatsLoading(true);

            try {
                const res = await apiFetch('/messages/recent-chats');

                if (!res.ok) {
                    throw new Error('Failed to load chats');
                }

                const data = await res.json();

                const currentUsername =
                    localStorage.getItem('username');

                const privateKey =
                    await getPrivateKey(currentUsername);

                const formattedContacts =
                    await Promise.all(
                        data.map(async chat => {
                            let text = chat.cipherText;

                            if (
                                text &&
                                privateKey &&
                                chat.encryptedAesKey
                            ) {
                                try {
                                    text = await decryptChatMessage(
                                        chat.cipherText,
                                        chat.encryptedAesKey,
                                        chat.iv,
                                        privateKey
                                    );
                                } catch (err) {
                                    console.error(
                                        'Recent chat decrypt failed:',
                                        err
                                    );

                                    text = 'Encrypted message';
                                }
                            } else if (text) {
                                text = 'Encrypted message';
                            }

                            return {
                                id: chat.id,
                                name: chat.username,
                                email: chat.email,
                                avatar:
                                    'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                                status: 'offline',
                                unread: 0,
                                lastMessage: text,
                                time: chat.createdAt
                                    ? new Date(chat.createdAt)
                                        .toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                    : ''
                            };
                        })
                    );

                setContacts(formattedContacts);
            } catch (err) {
                console.error(err);
            } finally {
                setIsChatsLoading(false);
            }
        };

        loadRecentChats();

        window.addEventListener(
            'refreshRecentChats',
            loadRecentChats
        );

        return () => {
            window.removeEventListener(
                'refreshRecentChats',
                loadRecentChats
            );
        };
    }, [setContacts]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const handleNewChat = async (e) => {
        e.preventDefault();

        if (isStartingChat) {
            return;
        }

        setEmailError('');

        const receiverUsername =
            emailInput.trim();

        if (!receiverUsername) {
            setEmailError('Username is required');
            return;
        }

        setIsStartingChat(true);

        try {
            const res =
                await apiFetch(
                    `/receiver/search/${receiverUsername}`
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
                status: 'offline',
                unread: 0,
                lastMessage: '',
                time: 'Just now'
            };

            setContacts(prev => {
                const exists =
                    prev.find(
                        contact => contact.id === newContact.id
                    );

                if (exists) {
                    return prev;
                }

                return [
                    newContact,
                    ...prev
                ];
            });

            setSelectedChat(newContact);
            setIsModalOpen(false);
            setEmailInput('');
        } catch (err) {
            setEmailError(err.message);
        } finally {
            setIsStartingChat(false);
        }
    };

    return (
        <div className="w-full flex flex-col bg-transparent h-full transition-colors relative">
            <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img
                                src={userAvatar}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-[#111113] shadow-sm"
                            />

                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0B0C0E] rounded-full" />
                        </div>

                        <div className="flex flex-col">
                            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
                                {username}
                            </h2>

                            <span className="text-[12px] text-emerald-500 font-semibold tracking-wide uppercase mt-0.5">
                Available
              </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            title="New Chat"
                        >
                            <Plus size={18} strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={() => navigate('/backup')}
                            className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Security & Recovery"
                        >
                            <ShieldCheck size={18} strokeWidth={2.5} />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isDark ? (
                                <Sun size={18} strokeWidth={2.5} />
                            ) : (
                                <Moon size={18} strokeWidth={2.5} />
                            )}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            <LogOut size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="absolute inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1A1A1D] p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200/50 dark:border-slate-800 transform transition-all">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 tracking-tight">
                            New Message
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                            Enter the username of the person you want to chat with.
                        </p>

                        <form onSubmit={handleNewChat}>
                            <input
                                type="text"
                                placeholder="Ex: John"
                                value={emailInput}
                                disabled={isStartingChat}
                                onChange={e => setEmailInput(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                            />

                            {emailError && (
                                <p className="text-red-500 text-sm mt-2 px-1 font-medium">
                                    {emailError}
                                </p>
                            )}

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    disabled={isStartingChat}
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-60 disabled:pointer-events-none"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isStartingChat}
                                    className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
                                >
                                    {isStartingChat ? (
                                        <span className="flex items-center gap-2">
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Searching...
                    </span>
                                    ) : (
                                        'Start Chat'
                                    )}
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
                        className="w-full bg-white dark:bg-[#1A1A1D] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all placeholder:text-slate-400/80"
                    />

                    <Search
                        size={18}
                        className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                <h3 className="px-3 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    Recent
                </h3>

                <div className="space-y-1">
                    {isChatsLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                            <LoaderCircle className="w-7 h-7 animate-spin text-indigo-600 mb-3" />

                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Loading chats...
                            </p>
                        </div>
                    ) : contacts.length > 0 ? (
                        contacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedChat(contact)}
                                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border ${
                                    selectedChat?.id === contact.id
                                        ? 'bg-white dark:bg-[#1A1A1D] border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/20 dark:shadow-none translate-x-1'
                                        : 'border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:translate-x-0.5'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={contact.avatar}
                                        alt={contact.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
                                    />

                                    {contact.status === 'online' && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                                    )}
                                </div>

                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-[15px]">
                                            {contact.name}
                                        </h4>

                                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2 tracking-wide">
                      {contact.time}
                    </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate pr-2 leading-tight">
                                            {contact.lastMessage || 'Started a conversation'}
                                        </p>

                                        {contact.unread > 0 && (
                                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-sm">
                        {contact.unread}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                <MessageSquare className="w-6 h-6 text-slate-400" />
                            </div>

                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                No chats yet
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                Search for a user to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
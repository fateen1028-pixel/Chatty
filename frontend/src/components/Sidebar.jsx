import { useState, useEffect } from 'react';
import {
    Moon,
    Sun,
    LogOut,
    Plus,
    Search,
    MessageSquare,
    LoaderCircle,
    ShieldCheck,
    MoreVertical,
    User
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useTheme } from '../hooks/useTheme.js';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    const username =
        localStorage.getItem('username') || 'User';

    const userAvatar =
        `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=0ea5e9,4f46e5&textColor=ffffff`;

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
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${chat.username}&backgroundColor=0ea5e9,4f46e5&textColor=ffffff`,
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

    const handleLogout = async () => {
        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/auth/logout`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            );
        } catch (error) {
            console.error('Backend logout failed:', error);
        } finally {
            /*
             * Remove authentication state only.
             *
             * Do not delete:
             * - publicKey-${username}
             * - deviceFingerprint-${username}
             * - IndexedDB private key
             */
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');

            window.location.href = '/login';
        }
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
                    `https://api.dicebear.com/7.x/initials/svg?seed=${data.username}&backgroundColor=0ea5e9,4f46e5&textColor=ffffff`,
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
        <div className="w-full flex flex-col bg-white/60 dark:bg-transparent h-full transition-colors relative border-r border-slate-200/60 dark:border-slate-800/80">
            <div className="p-5 flex flex-col gap-5 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                            <img
                                src={userAvatar}
                                alt="Profile"
                                className="relative w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-[#0B0C0E] shadow-sm transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-[2px] border-white dark:border-[#0B0C0E] rounded-full shadow-sm" />
                        </div>

                        <div className="flex flex-col">
                            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {username}
                            </h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                <span className="text-[11.5px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                                    Available
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="flex items-center gap-0.5 bg-slate-100/80 dark:bg-[#1A1A1D]/80 p-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-inner backdrop-blur-sm">
                                <button
                                    onClick={toggleTheme}
                                    className="p-1.5 rounded-full text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-sm transition-all"
                                    title="Toggle Theme"
                                >
                                    {isDark ? (
                                        <Sun size={16} strokeWidth={2.5} />
                                    ) : (
                                        <Moon size={16} strokeWidth={2.5} />
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`p-1.5 rounded-full transition-all duration-200 ${isMenuOpen ? 'bg-white dark:bg-slate-800 text-cyan-600 shadow-sm' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-sm'}`}
                                    title="Menu"
                                >
                                    <MoreVertical size={16} strokeWidth={2.5} />
                                </button>
                            </div>

                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-[#1A1A1D]/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl shadow-xl z-50 overflow-hidden origin-top-right transition-all">
                                        <div className="py-1">
                                            <button
                                                onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <User size={15} className="text-cyan-600 dark:text-cyan-400" />
                                                Profile Settings
                                            </button>
                                            <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-1" />
                                            <button
                                                onClick={() => { navigate('/backup'); setIsMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <ShieldCheck size={15} className="text-cyan-600 dark:text-cyan-400" />
                                                Security & Backup
                                            </button>
                                            <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-1" />
                                            <button
                                                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            >
                                                <LogOut size={15} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="p-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
                            title="New Chat"
                        >
                            <Plus size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="absolute inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-2xl p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-white/40 dark:border-slate-800/50 transform transition-all">
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
                                className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 mb-1 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
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
                                    className="px-5 py-2.5 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md shadow-cyan-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
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
                        className="w-full bg-white dark:bg-[#1A1A1D] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-sm transition-all placeholder:text-slate-400/80"
                    />

                    <Search
                        size={18}
                        className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                <h3 className="px-3 py-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    Recent
                </h3>

                <div className="space-y-1">
                    {isChatsLoading ? (
                        <div className="px-3 py-2 space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center p-2 animate-pulse">
                                    <div className="w-12 h-12 bg-slate-200/60 dark:bg-slate-800/60 rounded-full flex-shrink-0" />
                                    <div className="ml-3 flex-1 space-y-2.5">
                                        <div className="h-3.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-1/2" />
                                        <div className="h-2.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : contacts.length > 0 ? (
                        contacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedChat(contact)}
                                className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 border ${
                                    selectedChat?.id === contact.id
                                        ? 'bg-white dark:bg-[#1A1A1D] border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none translate-x-1'
                                        : 'bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-slate-800/50 hover:border-slate-200/50 dark:hover:border-transparent hover:shadow-sm hover:translate-x-0.5'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={contact.avatar}
                                        alt={contact.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-900 shadow-sm"
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
                                            <span className="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 shadow-sm">
                        {contact.unread}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4 opacity-90 hover:opacity-100 transition-opacity">
                            <div className="relative w-16 h-16 mb-5">
                                <div className="absolute inset-0 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full animate-ping" />
                                <div className="relative flex items-center justify-center w-full h-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full ring-4 ring-white dark:ring-[#0B0C0E]">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                            </div>

                            <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                No messages yet
                            </p>

                            <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                                Search for a user or start a new chat to connect.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
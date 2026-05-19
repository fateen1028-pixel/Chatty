import { useState, useEffect, useRef } from 'react';

import {
  MoreVertical,
  Phone,
  Video,
  Send,
  Smile,
  Paperclip
} from 'lucide-react';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function ChatArea({ chat, onBack }) {

  /*
  ==========================================
  STATE
  ==========================================
  */

  const [messagesMap, setMessagesMap] =
    useState({});

  const [onlineUsers, setOnlineUsers] =
    useState(new Set());

  const [input, setInput] = useState('');

  /*
  ==========================================
  REFS
  ==========================================
  */

  const messagesEndRef = useRef(null);

  const stompClientRef = useRef(null);

  /*
  ==========================================
  AUTH
  ==========================================
  */

  const currentUserToken =
    localStorage.getItem('token');

  const currentUsername =
    localStorage.getItem('username');

  /*
  ==========================================
  FETCH OLD CONVERSATION MESSAGES
  ==========================================
  */

  useEffect(() => {

    if (!chat || !currentUserToken) return;

    /*
    Prevent unnecessary re-fetching
    */

    if (messagesMap[chat.id]) return;

    const fetchMessages = async () => {

      try {

        const response = await fetch(
          `http://localhost:8080/messages/chat/${chat.id}`,
          {
            headers: {
              Authorization:
                `Bearer ${currentUserToken}`,
              'Content-Type':
                'application/json'
            }
          }
        );

        if (!response.ok) {

          console.error(
            'Failed to fetch messages'
          );

          return;
        }

        const data = await response.json();

        setMessagesMap(prev => ({
          ...prev,
          [chat.id]: data
        }));

      } catch (error) {

        console.error(error);
      }
    };

    fetchMessages();

  }, [chat, currentUserToken]);

  /*
  ==========================================
  FETCH ONLINE USERS SNAPSHOT
  ==========================================
  */

  useEffect(() => {

    if (!currentUserToken) return;

    const fetchOnlineUsers = async () => {

      try {

        const response = await fetch(
          'http://localhost:8080/presence/online-users',
          {
            headers: {
              Authorization:
                `Bearer ${currentUserToken}`
            }
          }
        );

        if (!response.ok) {

          console.error(
            'Failed to fetch online users'
          );

          return;
        }

        const data = await response.json();

        /*
        Backend returns:
        ["john", "alex"]
        */

        setOnlineUsers(new Set(data));

      } catch (error) {

        console.error(error);
      }
    };

    fetchOnlineUsers();

  }, [currentUserToken]);

  /*
  ==========================================
  WEBSOCKET CONNECTION
  ==========================================
  */

  useEffect(() => {

    if (!currentUserToken) return;

    /*
    Prevent duplicate websocket connections
    */

    if (stompClientRef.current?.connected) {
      return;
    }

    const stompClient = new Client({

      webSocketFactory: () =>
        new SockJS(
          'http://localhost:8080/ws'
        ),

      connectHeaders: {
        Authorization:
          `Bearer ${currentUserToken}`
      },

      reconnectDelay: 5000,

      debug: (str) => {
        console.log(str);
      },

      /*
      ==========================================
      CONNECTED
      ==========================================
      */

      onConnect: () => {

        console.log(
          'WebSocket Connected'
        );

        /*
        ==========================================
        MESSAGE SUBSCRIPTION
        ==========================================
        */

        stompClient.subscribe(
          '/user/queue/messages',

          (message) => {

            const msg =
              JSON.parse(message.body);

            /*
            Determine conversation
            */

            const isSentByMe =
              msg.senderUsername ===
              currentUsername;

            const conversationId =
              isSentByMe
                ? msg.receiverId
                : msg.senderId;

            setMessagesMap(prev => {

              const existingMessages =
                prev[conversationId] || [];

              /*
              Prevent duplicate messages
              */

              const alreadyExists =
                existingMessages.some(
                  m => m.id === msg.id
                );

              if (alreadyExists) {
                return prev;
              }

              return {

                ...prev,

                [conversationId]: [

                  ...existingMessages,

                  msg
                ]
              };
            });

            /*
            Refresh sidebar chats
            */

            window.dispatchEvent(
              new Event(
                'refreshRecentChats'
              )
            );
          }
        );

        /*
        ==========================================
        PRESENCE SUBSCRIPTION
        ==========================================
        */

        stompClient.subscribe(
          '/topic/presence',

          (message) => {

            const presenceEvent =
              JSON.parse(message.body);

            /*
            {
              type: "ONLINE" | "OFFLINE",
              username: "john"
            }
            */

            setOnlineUsers(prev => {

              const updated =
                new Set(prev);

              /*
              USER ONLINE
              */

              if (
                presenceEvent.type ===
                'ONLINE'
              ) {

                updated.add(
                  presenceEvent.username
                );
              }

              /*
              USER OFFLINE
              */

              if (
                presenceEvent.type ===
                'OFFLINE'
              ) {

                updated.delete(
                  presenceEvent.username
                );
              }

              return updated;
            });
          }
        );
      },

      /*
      ==========================================
      SOCKET CLOSED
      ==========================================
      */

      onWebSocketClose: () => {

        console.log(
          'WebSocket disconnected'
        );
      },

      /*
      ==========================================
      STOMP ERROR
      ==========================================
      */

      onStompError: (frame) => {

        console.error(
          'Broker error:',
          frame.headers['message']
        );

        console.error(
          'Additional details:',
          frame.body
        );
      }
    });

    /*
    Activate websocket
    */

    stompClient.activate();

    stompClientRef.current =
      stompClient;

    /*
    Cleanup
    */

    return () => {

      if (stompClientRef.current) {

        stompClientRef.current
          .deactivate();
      }
    };

  }, [currentUserToken]);

  /*
  ==========================================
  AUTO SCROLL
  ==========================================
  */

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({

        behavior: 'smooth'
      });

  }, [messagesMap, chat]);

  /*
  ==========================================
  SEND MESSAGE
  ==========================================
  */

  const handleSend = (e) => {

    e.preventDefault();

    if (!input.trim() || !chat) {
      return;
    }

    if (
      !stompClientRef.current ||
      !stompClientRef.current.connected
    ) {

      console.error(
        'WebSocket not connected'
      );

      return;
    }

    const chatMessage = {

      receiverId: chat.id,

      message: input.trim()
    };

    try {

      stompClientRef.current.publish({

        destination: '/app/chat',

        body: JSON.stringify(
          chatMessage
        )
      });

      setInput('');

    } catch (error) {

      console.error(
        'Failed to send websocket message',
        error
      );
    }
  };

  /*
  ==========================================
  EMPTY CHAT SCREEN
  ==========================================
  */

  if (!chat) {

    return (

      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-[#0B0C0E] transition-colors relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 opacity-50 z-0"></div>

        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-center mb-6 transform -rotate-6 z-10 hover:rotate-0 transition-transform duration-500">

          <span className="text-5xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
            💬
          </span>

        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 z-10 tracking-tight">

          Your Conversations

        </h2>

        <p className="text-slate-500 dark:text-slate-400 z-10 text-sm max-w-sm text-center">

          Select an existing chat
          from the sidebar or start
          a new conversation to begin
          messaging.

        </p>

      </div>
    );
  }

  /*
  ==========================================
  ONLINE STATUS
  ==========================================
  */


  console.log(chat);
  console.log(Array.from(onlineUsers));

  
  const isOnline =
    onlineUsers.has(chat.name);



  /*
  ==========================================
  MAIN UI
  ==========================================
  */

  return (

    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0B0C0E] transition-colors h-full relative">

      {/* HEADER */}

      <div className="h-[72px] px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0">

        <div className="flex items-center space-x-4">

          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 mr-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            ←
          </button>

          <div className="relative">

            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
            />

            {isOnline && (

              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>

            )}

          </div>

          <div className="flex flex-col">

            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">

              {chat.name}

            </h3>

            <p className="text-xs font-medium text-emerald-500 dark:text-emerald-400 mt-0.5">

              {isOnline
                ? 'Online now'
                : 'Offline'}

            </p>

          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500">

          <button className="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-500 transition-all rounded-full">

            <Phone
              size={18}
              strokeWidth={2.5}
            />

          </button>

          <button className="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-500 transition-all rounded-full">

            <Video
              size={18}
              strokeWidth={2.5}
            />

          </button>

          <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all rounded-full">

            <MoreVertical
              size={18}
              strokeWidth={2.5}
            />

          </button>

        </div>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">

        {(messagesMap[chat.id] || [])
          .map((msg) => {

            const isOwn =
              msg.senderUsername ===
              currentUsername;

            return (

              <div
                key={msg.id}
                className={`flex ${
                  isOwn
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                <div
                  className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${
                    isOwn
                      ? 'items-end'
                      : 'items-start'
                  }`}
                >

                  <div
                    className={`px-4 py-2.5 shadow-sm transform transition-all ${
                      isOwn
                        ? 'bg-indigo-600 font-medium text-white rounded-2xl rounded-tr-[4px]'
                        : 'bg-white font-medium dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-[4px]'
                    }`}
                  >

                    <p className="text-[14.5px] leading-[1.6]">

                      {msg.message}

                    </p>

                  </div>

                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 px-1 tracking-wide">

                    {
                      msg.createdAt &&
                      new Date(
                        msg.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: '2-digit',
                          minute: '2-digit'
                        }
                      )
                    }

                  </span>

                </div>
              </div>
            );
          })}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}

      <div className="p-4 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 sticky bottom-0 z-10">

        <form
          onSubmit={handleSend}
          className="flex items-end space-x-2 max-w-5xl mx-auto w-full"
        >

          <button
            type="button"
            className="p-3 mb-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all rounded-full"
          >

            <Smile
              size={20}
              strokeWidth={2.5}
            />

          </button>

          <button
            type="button"
            className="p-3 mb-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all rounded-full"
          >

            <Paperclip
              size={20}
              strokeWidth={2.5}
            />

          </button>

          <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-inner group">

            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              placeholder="Message..."
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 px-5 py-3.5 text-[15px] focus:outline-none placeholder:text-slate-400"
            />

          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3.5 mb-0.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >

            <Send
              size={18}
              strokeWidth={2.5}
              className="ml-0.5"
            />

          </button>

        </form>
      </div>
    </div>
  );
}
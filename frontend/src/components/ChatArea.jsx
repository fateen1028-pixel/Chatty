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

  const [messagesMap, setMessagesMap] = useState({});
  const [input, setInput] = useState('');

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const currentUserToken = localStorage.getItem('token');
  const currentUsername = localStorage.getItem('username');

  /*
  ==========================================
  FETCH OLD CONVERSATION MESSAGES
  ==========================================
  */

  useEffect(() => {

    if (!chat || !currentUserToken) return;

    /*
    Prevent unnecessary re-fetching
    if conversation already exists
    */

    if (messagesMap[chat.id]) return;

    const fetchMessages = async () => {

      try {

        const response = await fetch(
          `http://localhost:8080/messages/chat/${chat.id}`,
          {
            headers: {
              Authorization: `Bearer ${currentUserToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          console.error('Failed to fetch messages');
          return;
        }

        const data = await response.json();

        /*
        Store RAW backend objects
        */
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
  WEBSOCKET CONNECTION
  ==========================================
  */

  useEffect(() => {

    if (!currentUserToken) return;

    /*
    Prevent duplicate websocket connections
    */

    if (stompClientRef.current?.connected) return;

    const stompClient = new Client({

      webSocketFactory: () =>
        new SockJS('http://localhost:8080/ws'),

      connectHeaders: {
        Authorization: `Bearer ${currentUserToken}`
      },

      reconnectDelay: 5000,

      debug: (str) => {
        console.log(str);
      },

      onConnect: () => {

        console.log('WebSocket Connected');

        stompClient.subscribe(
          '/user/queue/messages',
          (message) => {

            const msg = JSON.parse(message.body);

            /*
            Backend MUST send:
            {
              id,
              senderId,
              senderUsername,
              receiverId,
              message,
              createdAt
            }
            */

            const isSentByMe =
              msg.senderUsername === currentUsername;

            /*
            Determine conversation
            */

            const conversationId = isSentByMe
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

            window.dispatchEvent(
  new Event("refreshRecentChats")
);
          }
        );
      },

      onWebSocketClose: () => {
        console.log('WebSocket disconnected');
      },

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

    stompClient.activate();

    stompClientRef.current = stompClient;

    return () => {

      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };

  }, [currentUserToken]);

  /*
  ==========================================
  AUTO SCROLL
  ==========================================
  */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
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

    if (!input.trim() || !chat) return;

    if (
      !stompClientRef.current ||
      !stompClientRef.current.connected
    ) {
      console.error('WebSocket not connected');
      return;
    }

    const chatMessage = {

      receiverId: chat.id,
      message: input.trim()
    };

    try {

      stompClientRef.current.publish({

        destination: '/app/chat',

        body: JSON.stringify(chatMessage)
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

      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">

        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">💬</span>
        </div>

        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Welcome to ChatApp
        </h2>

        <p className="text-slate-500 dark:text-slate-400">
          Select a chat to start messaging
        </p>

      </div>
    );
  }

  /*
  ==========================================
  MAIN UI
  ==========================================
  */

  return (

    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors h-full">

      {/* HEADER */}

      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">

        <div className="flex items-center space-x-4">

          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            ←
          </button>

          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-10 h-10 rounded-full"
          />

          <div>

            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {chat.name}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chat.status === 'online'
                ? 'Online now'
                : 'Last seen recently'}
            </p>

          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">

          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Phone size={20} />
          </button>

          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Video size={20} />
          </button>

          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>

        </div>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {(messagesMap[chat.id] || []).map((msg) => {

          const isOwn =
            msg.senderUsername === currentUsername;

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
                className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${
                  isOwn
                    ? 'items-end'
                    : 'items-start'
                }`}
              >

                <div
                  className={`px-4 py-2.5 rounded-2xl ${
                    isOwn
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-800'
                  }`}
                >

                  <p className="text-sm leading-relaxed">
                    {msg.message}
                  </p>

                </div>

                <span className="text-[10px] text-slate-400 mt-1.5 px-1">

                  {
                    msg.createdAt &&
                    new Date(msg.createdAt)
                      .toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                  }

                </span>

              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">

        <form
          onSubmit={handleSend}
          className="flex items-center space-x-2"
        >

          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Smile size={24} />
          </button>

          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Paperclip size={24} />
          </button>

          <div className="flex-1 relative">

            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Type a message..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full pl-5 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
            />

          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>

        </form>
      </div>
    </div>
  );
}
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

  /*
  Tracks which chats were fetched
  from DB already
  */

  const [loadedChats, setLoadedChats] =
    useState(new Set());

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

    if (!chat || !currentUserToken) {
      return;
    }

    /*
    Prevent duplicate DB fetches
    */

    if (loadedChats.has(chat.id)) {
      return;
    }

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

        /*
        Merge DB messages with any
        realtime websocket messages
        */

        setMessagesMap(prev => {

          const existingMessages =
            prev[chat.id] || [];

          const mergedMessages = [

            ...data,

            ...existingMessages.filter(
              realtimeMsg =>

                !data.some(
                  dbMsg =>
                    dbMsg.id ===
                    realtimeMsg.id
                )
            )
          ];

          return {

            ...prev,

            [chat.id]:
              mergedMessages
          };
        });

        /*
        Mark chat as loaded
        */

        setLoadedChats(prev => {

          const updated =
            new Set(prev);

          updated.add(chat.id);

          return updated;
        });

      } catch (error) {

        console.error(error);
      }
    };

    fetchMessages();

  }, [
    chat,
    currentUserToken,
    loadedChats
  ]);

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
              Prevent duplicates
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
            ==========================================
            SEND DELIVERY ACK
            ==========================================
            */

            if (!isSentByMe) {

              stompClient.publish({

                destination:
                  '/app/chat.delivered',

                body: JSON.stringify({

                  messageIds: [msg.id]
                })
              });
            }

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
        DELIVERED RECEIPT
        ==========================================
        */

        stompClient.subscribe(

          '/user/queue/delivered',

          (message) => {

            const receipt =
              JSON.parse(message.body);

            setMessagesMap(prev => {

              const updated =
                { ...prev };

              Object.keys(updated)
                .forEach(
                  conversationId => {

                    updated[
                      conversationId
                    ] =
                      updated[
                        conversationId
                      ].map(msg => {

                        if (
                          msg.id ===
                          receipt.messageId
                        ) {

                          return {

                            ...msg,

                            status:
                              'DELIVERED'
                          };
                        }

                        return msg;
                      });
                  }
                );

              return updated;
            });
          }
        );

        /*
        ==========================================
        READ RECEIPT
        ==========================================
        */

        stompClient.subscribe(

          '/user/queue/read',

          (message) => {

            const receipt =
              JSON.parse(message.body);

            setMessagesMap(prev => {

              const updated =
                { ...prev };

              Object.keys(updated)
                .forEach(
                  conversationId => {

                    updated[
                      conversationId
                    ] =
                      updated[
                        conversationId
                      ].map(msg => {

                        if (
                          msg.id ===
                          receipt.messageId
                        ) {

                          return {

                            ...msg,

                            status: 'READ'
                          };
                        }

                        return msg;
                      });
                  }
                );

              return updated;
            });
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

            setOnlineUsers(prev => {

              const updated =
                new Set(prev);

              if (
                presenceEvent.type ===
                'ONLINE'
              ) {

                updated.add(
                  presenceEvent.username
                );
              }

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
  CURRENT CHAT MESSAGES
  ==========================================
  */

  const currentMessages =
    messagesMap[chat?.id] || [];

  /*
  ==========================================
  MARK MESSAGES AS READ
  ==========================================
  */

  useEffect(() => {

    if (!chat) return;

    if (
      !stompClientRef.current ||
      !stompClientRef.current.connected
    ) {
      return;
    }

    const unreadMessageIds =
      currentMessages
        .filter(msg =>

          msg.senderUsername !==
          currentUsername &&

          msg.status !== 'READ'
        )
        .map(msg => msg.id);

    if (unreadMessageIds.length === 0) {
      return;
    }

    stompClientRef.current.publish({

      destination: '/app/chat.read',

      body: JSON.stringify({

        messageIds:
          unreadMessageIds
      })
    });

  }, [
    chat?.id,
    currentMessages,
    currentUsername
  ]);

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

      <div className="flex-1 flex items-center justify-center">

        <h2 className="text-2xl font-bold">

          Select a chat

        </h2>

      </div>
    );
  }

  /*
  ==========================================
  ONLINE STATUS
  ==========================================
  */

  const isOnline =
    onlineUsers.has(chat.name);

  /*
  ==========================================
  MAIN UI
  ==========================================
  */

  return (

    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0B0C0E] h-full relative">

      {/* HEADER */}

      <div className="h-[72px] px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111113]/80 flex items-center justify-between sticky top-0">

        <div className="flex items-center space-x-4">

          <button
            onClick={onBack}
            className="md:hidden"
          >
            ←
          </button>

          <div className="relative">

            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 rounded-full"
            />

            {isOnline && (

              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>

            )}

          </div>

          <div>

            <h3 className="text-sm font-bold">

              {chat.name}

            </h3>

            <p className="text-xs text-emerald-500">

              {
                isOnline
                  ? 'Online now'
                  : 'Offline'
              }

            </p>

          </div>
        </div>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {currentMessages.map((msg) => {

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
                className={`max-w-[75%] flex flex-col ${
                  isOwn
                    ? 'items-end'
                    : 'items-start'
                }`}
              >

                <div
                  className={`px-4 py-2.5 ${
                    isOwn
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-[4px]'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-[4px]'
                  }`}
                >

                  <p>

                    {msg.message}

                  </p>

                </div>

                <div className="flex items-center gap-1 mt-1.5 px-1">

                  <span className="text-[10px] text-slate-400">

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

                  {
                    isOwn && (

                      <span className="text-[10px] text-slate-400">

                        {
                          msg.status === 'SENT'
                            ? '✓'
                            : msg.status === 'DELIVERED'
                            ? '✓✓'
                            : '✓✓ Read'
                        }

                      </span>
                    )
                  }

                </div>

              </div>

            </div>
          );
        })}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}

      <div className="p-4 bg-white/80 dark:bg-[#111113]/80 border-t border-slate-200/80 dark:border-slate-800/80 sticky bottom-0">

        <form
          onSubmit={handleSend}
          className="flex items-end space-x-2"
        >

          <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 rounded-3xl">

            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              placeholder="Message..."
              className="w-full bg-transparent px-5 py-3.5 focus:outline-none"
            />

          </div>

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3.5 bg-indigo-600 text-white rounded-full"
          >

            <Send
              size={18}
              strokeWidth={2.5}
            />

          </button>

        </form>
      </div>
    </div>
  );
}
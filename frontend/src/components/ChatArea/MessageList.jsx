import React from 'react';

export default function MessageList({ currentMessages, currentUsername, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {currentMessages.map(
        (msg) => {
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
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm'
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
                          hour:
                            '2-digit',
                          minute:
                            '2-digit'
                        }
                      )
                    }
                  </span>

                  {
                    isOwn && (
                      <span className="text-[10px] text-slate-400">
                        {
                          msg.status ===
                          'SENT'
                            ? '✓'
                            : msg.status ===
                              'DELIVERED'
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
        }
      )}

      <div
        ref={messagesEndRef}
      />
    </div>
  );
}

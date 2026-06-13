import React from 'react';

export default function MessageList({ currentMessages, currentUsername, messagesEndRef }) {

  console.log(
  "RENDERING",
  currentMessages
);
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth bg-transparent scrollbar-custom">
      {currentMessages.map(
        (msg) => {
          const isOwn =
            msg.senderUsername ===
            currentUsername;

          return (
            <div
              key={msg.id}
              className={`flex w-full ${
                isOwn
                  ? 'justify-end'
                  : 'justify-start'
              } group`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] flex flex-col ${
                  isOwn
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                <div
                  className={`px-4 py-3 transition-all duration-300 ${
                    isOwn
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl rounded-br-none shadow-md shadow-cyan-500/30'
                      : 'bg-white dark:bg-[#1A1A1D] text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed break-words">
                    {msg.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
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
                      <span className="text-[11px] text-cyan-500 dark:text-cyan-400 font-bold tracking-widest flex">
                        {
                          msg.status === 'SENT'
                            ? <span className="opacity-70">✓</span>
                            : msg.status === 'DELIVERED'
                            ? <span>✓✓</span>
                            : msg.status === 'READ'
                            ? <span className="text-emerald-500 dark:text-emerald-400">✓✓</span>
                            : null
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

import React from 'react';

export default function MessageList({ currentMessages, currentUsername, messagesEndRef }) {

  console.log(
  "RENDERING",
  currentMessages
);
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth bg-slate-50/50 dark:bg-[#0B0C0E]/50">
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
                  className={`px-4 py-3 shadow-sm transition-all duration-200 ${
                    isOwn
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20'
                      : 'bg-white dark:bg-[#1A1A1D] text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
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
                      <span className="text-[11px] text-indigo-500 dark:text-indigo-400 font-bold tracking-widest flex">
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

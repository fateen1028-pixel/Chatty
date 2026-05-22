import React from 'react';

export default function ChatHeader({ chat, onBack, isOnline, isTyping }) {
  return (
    <div className="h-18 px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#111113]/80 flex items-center justify-between">
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
              isTyping
                ? 'Typing...'
                : isOnline
                ? 'Online now'
                : 'Offline'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

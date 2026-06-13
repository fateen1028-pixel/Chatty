import React from 'react';

export default function ChatHeader({ chat, onBack, isOnline, isTyping }) {
  return (
    <div className="h-18 px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B0C0E]/80 backdrop-blur-xl flex items-center justify-between shadow-sm z-10 sticky top-0">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
        >
          <span className="sr-only">Back</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <div className="relative">
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            {chat.name}
          </h3>
          <p className="text-xs font-medium mt-0.5 mb-0 flex items-center gap-1.5 transition-colors duration-200">
            {
              isTyping ? (
                <span className="text-cyan-500 flex items-center gap-1">
                  Typing
                  <span className="flex space-x-0.5">
                    <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </span>
              ) : isOnline ? (
                <span className="text-emerald-500">Online now</span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Offline</span>
              )
            }
          </p>
        </div>
      </div>
    </div>
  );
}

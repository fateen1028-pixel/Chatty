import React from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({ input, handleTyping, handleSend }) {
  return (
    <div className="p-4 bg-white/90 dark:bg-[#0B0C0E]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80">
      <form
        onSubmit={handleSend}
        className="flex items-end space-x-3 max-w-4xl mx-auto"
      >
        <div className="flex-1 bg-slate-100 dark:bg-[#1A1A1D] border border-transparent dark:border-slate-800/60 rounded-3xl shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 transition-all duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) =>
              handleTyping(
                e.target.value
              )
            }
            placeholder="Type a message..."
            className="w-full bg-transparent px-6 py-3.5 focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <Send
            size={20}
            strokeWidth={2.5}
            className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""}
          />
        </button>
      </form>
    </div>
  );
}

import React from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({ input, handleTyping, handleSend }) {
  return (
    <div className="p-4 bg-white/80 dark:bg-[#111113]/80 border-t border-slate-200/80 dark:border-slate-800/80">
      <form
        onSubmit={handleSend}
        className="flex items-end space-x-2"
      >
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-3xl">
          <input
            type="text"
            value={input}
            onChange={(e) =>
              handleTyping(
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
  );
}

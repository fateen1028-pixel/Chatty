
import { Send } from 'lucide-react';

export default function MessageInput({
                                         input,
                                         isSending,
                                         handleTyping,
                                         handleSend
                                     }) {
    return (
        <div className="p-4 bg-white/90 dark:bg-[#0B0C0E]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80">
            <form
                onSubmit={handleSend}
                className="flex items-end space-x-3 max-w-4xl mx-auto"
            >
                <div className="flex-1 bg-slate-100 dark:bg-[#1A1A1D] border border-transparent dark:border-slate-800/60 rounded-3xl shadow-inner focus-within:ring-2 focus-within:ring-cyan-500/30 focus-within:border-cyan-500/50 transition-all duration-300">
                    <input
                        type="text"
                        value={input}
                        disabled={isSending}
                        onChange={(e) =>
                            handleTyping(
                                e.target.value
                            )
                        }
                        placeholder={isSending ? "Sending..." : "Type a message..."}
                        className="w-full bg-transparent px-6 py-3.5 focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="p-3.5 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:hover:from-cyan-500 disabled:hover:to-blue-600 disabled:shadow-none disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all duration-300"
                >
                    {isSending ? (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send
                            size={20}
                            strokeWidth={2.5}
                            className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""}
                        />
                    )}
                </button>
            </form>
        </div>
    );
}
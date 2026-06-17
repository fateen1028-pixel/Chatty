import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Lock,
  Send,
  ExternalLink,
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0C0E] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* 1. Header */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B0C0E] z-50 sticky top-0">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <Link to="/" aria-label="Chatty home" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
            <MessageSquare className="text-cyan-500 w-5 h-5" />
            <span className="text-slate-900 dark:text-slate-100">Chatty</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-[14px] font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">How it works</a>
            <a
  href="https://github.com/fateen1028-pixel/Chatty"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
>
  <ExternalLink size={14} aria-hidden="true" />
  <span>GitHub</span>
</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/login" className="px-3 sm:px-4 py-2 text-[14px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg outline-none">
              Log in
            </Link>
            <Link to="/register" className="px-3 sm:px-4 py-2 text-[14px] font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none">
              <span className="hidden sm:inline">Create account</span>
              <span className="sm:hidden">Sign up</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-28 pb-16 sm:pb-24">
        {/* Subtle grid only in hero */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Copy (Left) */}
            <div className="w-full lg:w-[45%] flex flex-col items-start text-left pt-4 lg:pt-0">
              <div className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm tracking-wide uppercase mb-4 sm:mb-5">
                Secure real-time messaging
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-5 sm:mb-6 leading-[1.15]">
                Your messages should stay <span className="text-cyan-600 dark:text-cyan-500">yours</span>.
              </h1>
              <p className="text-[17px] sm:text-lg text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 leading-relaxed max-w-lg">
                Chatty encrypts conversations before they leave your device and delivers them in real time, with typing indicators, delivery status, and read receipts built in.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link to="/register" className="px-6 py-3.5 text-[15px] font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-colors text-center focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none">
                  Create an account
                </Link>
                <Link to="/login" className="px-6 py-3.5 text-[15px] font-semibold rounded-xl bg-white dark:bg-[#0B0C0E] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-center focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none">
                  Log in
                </Link>
              </div>
              <div className="mt-8 sm:mt-10 text-[13px] text-slate-500 dark:text-slate-500 font-medium">
                An <a href="https://github.com/fateen1028-pixel/Chatty" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-2 transition-colors">open-source</a> messaging project by <a href="https://fateen.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-slate-300 underline underline-offset-2 transition-colors">Mohamed Fateen</a>.
              </div>
            </div>

            {/* 3. Product Preview (Right) */}
            <div className="w-full lg:w-[55%] relative">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0C0E] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden flex h-[500px] text-left">
                 {/* Sidebar */}
                 <div className="hidden sm:flex w-[260px] flex-col border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent">
                   <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
                     <div className="relative">
                       <input type="text" placeholder="Search messages or users" className="w-full bg-white dark:bg-[#1A1A1D] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-[13px] focus:outline-none" readOnly tabIndex="-1" />
                       <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     </div>
                   </div>
                   <div className="flex-1 overflow-hidden p-2 space-y-1">
                     {/* Contact 1 */}
                     <div className="flex items-center p-2.5 rounded-xl bg-white dark:bg-[#1A1A1D] border border-slate-200/80 dark:border-slate-800 shadow-sm">
                       <div className="relative flex-shrink-0">
                         <img src="https://api.dicebear.com/7.x/initials/svg?seed=Alex&backgroundColor=0ea5e9,4f46e5&textColor=ffffff" alt="Alex" className="w-10 h-10 rounded-full ring-2 ring-slate-100 dark:ring-slate-900" />
                         <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                       </div>
                       <div className="ml-3 flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-0.5">
                           <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-[13px] truncate">Alex</h4>
                           <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-2 shrink-0">10:45 AM</span>
                         </div>
                         <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">Perfect. I’ll test it from an...</p>
                       </div>
                     </div>
                     {/* Contact 2 */}
                     <div className="flex items-center p-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/30 border border-transparent">
                       <div className="relative flex-shrink-0">
                         <img src="https://api.dicebear.com/7.x/initials/svg?seed=Sarah&backgroundColor=0ea5e9,4f46e5&textColor=ffffff" alt="Sarah" className="w-10 h-10 rounded-full ring-2 ring-slate-100 dark:ring-slate-900" />
                       </div>
                       <div className="ml-3 flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-0.5">
                           <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-[13px] truncate">Sarah</h4>
                           <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-2 shrink-0">Yesterday</span>
                         </div>
                         <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">Are we still meeting later?</p>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Chat Area */}
                 <div className="flex-1 flex flex-col bg-transparent relative h-full">
                   {/* Chat Header */}
                   <div className="h-16 px-4 sm:px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <div className="relative sm:hidden">
                         <img src="https://api.dicebear.com/7.x/initials/svg?seed=Alex&backgroundColor=0ea5e9,4f46e5&textColor=ffffff" alt="Alex" className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-900" />
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                       </div>
                       <div className="flex flex-col">
                         <h3 className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">Alex</h3>
                         <p className="text-[11px] font-medium mt-0.5 text-emerald-500">Online now</p>
                       </div>
                     </div>
                   </div>
                   
                   {/* Messages */}
                   <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                     {/* Encryption notification */}
                     <div className="flex justify-center mb-6">
                       <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1A1D] border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5">
                         <Lock size={12} className="text-slate-500 dark:text-slate-400" />
                         <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Messages are end-to-end encrypted</span>
                       </div>
                     </div>
                     
                     {/* Received */}
                     <div className="flex w-full justify-start">
                       <div className="max-w-[85%] flex flex-col items-start">
                         <div className="px-3.5 py-2.5 bg-white dark:bg-[#1A1A1D] text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                           <p className="text-[13.5px] leading-relaxed break-words">Did the new message encryption flow pass the test?</p>
                         </div>
                         <div className="flex items-center gap-1.5 mt-1 px-1">
                           <span className="text-[10px] font-medium text-slate-400">10:42 AM</span>
                         </div>
                       </div>
                     </div>

                     {/* Sent */}
                     <div className="flex w-full justify-end">
                       <div className="max-w-[85%] flex flex-col items-end">
                         <div className="px-3.5 py-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl rounded-br-none shadow-md shadow-cyan-500/20">
                           <p className="text-[13.5px] leading-relaxed break-words">Yes. The message is encrypted before it reaches the server.</p>
                         </div>
                         <div className="flex items-center gap-1 mt-1 px-1">
                           <span className="text-[10px] font-medium text-slate-400">10:44 AM</span>
                           <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold tracking-widest">✓✓</span>
                         </div>
                       </div>
                     </div>

                     {/* Received */}
                     <div className="flex w-full justify-start">
                       <div className="max-w-[85%] flex flex-col items-start">
                         <div className="px-3.5 py-2.5 bg-white dark:bg-[#1A1A1D] text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                           <p className="text-[13.5px] leading-relaxed break-words">Perfect. I’ll test it from another device.</p>
                         </div>
                         <div className="flex items-center gap-1.5 mt-1 px-1">
                           <span className="text-[10px] font-medium text-slate-400">10:45 AM</span>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Input Area */}
                   <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
                     <div className="flex items-center space-x-2">
                       <div className="flex-1 bg-slate-100 dark:bg-[#1A1A1D] border border-transparent dark:border-slate-800/60 rounded-full flex items-center">
                         <div className="w-full px-4 py-2.5 text-[13px] text-slate-400">Type a message...</div>
                       </div>
                       <div className="p-2.5 bg-slate-200/50 dark:bg-[#1A1A1D] text-slate-400 dark:text-slate-500 rounded-full border border-slate-200 dark:border-slate-800/60 flex items-center justify-center">
                         <Send size={16} strokeWidth={2.5} className="ml-0.5" />
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50/50 dark:bg-transparent dark:border-t dark:border-slate-800/80">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="mb-12 md:mb-16 md:text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
              What happens when you send a message
            </h2>
            <p className="text-[16px] text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Encryption happens in the browser before the message is stored or delivered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-px bg-slate-200 dark:bg-slate-800/80"></div>
            
            {/* Step 1 */}
            <div className="relative pt-2 md:pt-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0B0C0E] border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 mb-6 md:mx-auto relative z-10 text-lg">
                1
              </div>
              <div className="md:text-center px-2">
                <h3 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 mb-2">Encrypt on the device</h3>
                <p className="text-[14.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Chatty encrypts the message content with AES-GCM before sending it to the backend.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pt-2 md:pt-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0B0C0E] border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 mb-6 md:mx-auto relative z-10 text-lg">
                2
              </div>
              <div className="md:text-center px-2">
                <h3 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 mb-2">Deliver in real time</h3>
                <p className="text-[14.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  The encrypted payload is stored and delivered through WebSocket-based messaging.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pt-2 md:pt-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0B0C0E] border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 mb-6 md:mx-auto relative z-10 text-lg">
                3
              </div>
              <div className="md:text-center px-2">
                <h3 className="text-[17px] font-semibold text-slate-900 dark:text-slate-100 mb-2">Decrypt for the recipient</h3>
                <p className="text-[14.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  The recipient’s device uses its private key to recover the message locally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product capabilities */}
      <section id="features" className="py-20 md:py-28 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="mb-14 md:mb-20">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              What Chatty handles
            </h2>
          </div>

          <div className="space-y-12 md:space-y-16 max-w-4xl">
            {/* Capability 1 */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 md:gap-10">
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-[19px] pt-1">
                End-to-end encrypted conversations
              </h3>
              <div>
                <p className="text-[15.5px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                  Message content is encrypted before transmission. The backend stores encrypted payloads instead of readable conversation text.
                </p>
                <div className="text-[13px] text-slate-500 dark:text-slate-500 font-medium">
                  AES-GCM message encryption with RSA-OAEP key wrapping.
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800/80"></div>

            {/* Capability 2 */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 md:gap-10">
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-[19px] pt-1">
                Real-time conversation state
              </h3>
              <div>
                <p className="text-[15.5px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                  Messages, online presence, typing state, delivery updates, and read receipts are synchronized without page refreshes.
                </p>
                <div className="text-[13px] text-slate-500 dark:text-slate-500 font-medium">
                  WebSocket and STOMP-based communication.
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800/80"></div>

            {/* Capability 3 */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3 md:gap-10">
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-[19px] pt-1">
                Session and device security
              </h3>
              <div>
                <p className="text-[15.5px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                  Authentication, refresh-token handling, device keys, and account recovery are treated as separate security responsibilities.
                </p>
                <div className="text-[13px] text-slate-500 dark:text-slate-500 font-medium">
                  JWT access tokens and HTTP-only refresh cookies.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Developer/project section */}
      <section className="py-16 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-transparent">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111216] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h3 className="text-[19px] font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
                Built as a real system, not a UI mockup.
              </h3>
              <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Chatty is a full-stack engineering project by Mohamed Fateen, built with React, Spring Boot, PostgreSQL, WebSockets, and browser-based cryptography.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <a href="https://github.com/fateen1028-pixel/Chatty" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-[14px] font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors text-center flex justify-center items-center gap-2 focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none">
                View source on GitHub
              </a>
              <a href="https://fateen.dev/" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 text-[14px] font-medium rounded-xl bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors text-center focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none">
                Visit developer portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B0C0E]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-200 text-[15px]">
            <MessageSquare className="w-4 h-4 text-cyan-500" />
            <span>Chatty</span>
          </div>
          <div className="flex gap-6 text-[13.5px] font-medium">
            <a href="https://github.com/fateen1028-pixel/Chatty" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">GitHub</a>
            <a href="https://fateen.dev/" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Developer portfolio</a>
          </div>
          <div className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
            Built by Mohamed Fateen © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

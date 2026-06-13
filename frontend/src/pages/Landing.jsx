import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Shield, Moon, CheckCircle2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C0E] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-x-hidden relative">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
          <MessageSquare className="text-cyan-500" />
          <span>Chatty</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#features" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Features</a>
          <a href="#about" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">About</a>
        </nav>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Log in
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20 transition-all">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-24 text-center relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          V1.0 is now live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl">
          Connect seamlessly with <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">real-time messaging</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Experience lightning-fast communication with typing indicators, read receipts, and a beautiful dark mode. Everything you need in a modern chat application.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/register" className="px-8 py-4 text-base font-bold rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            Start Chatting for Free
          </Link>
          <a href="#features" className="px-8 py-4 text-base font-bold rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center justify-center">
            Explore Features
          </a>
        </div>

        {/* Dashboard Preview mockup */}
        <div className="relative w-full max-w-5xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-2 shadow-2xl">
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B0C0E] aspect-video relative flex">
            {/* Sidebar mock */}
            <div className="w-1/3 md:w-1/4 border-r border-slate-200 dark:border-slate-800 h-full p-4 hidden sm:block">
              <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mb-6 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                      <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Chat mock */}
            <div className="flex-1 h-full p-6 flex flex-col justify-end">
               <div className="space-y-6">
                 {/* Received Bubble */}
                 <div className="flex justify-start">
                   <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700 max-w-[70%]">
                     <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                     <div className="h-2 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                   </div>
                 </div>
                 {/* Sent Bubble */}
                 <div className="flex justify-end pr-8">
                   <div className="bg-cyan-600 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[70%] text-right">
                     <div className="h-2 w-40 bg-cyan-400 rounded mb-2 ml-auto"></div>
                     <div className="h-2 w-24 bg-cyan-400 rounded ml-auto"></div>
                   </div>
                 </div>
               </div>
               <div className="mt-8 h-12 w-full bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Built with modern tech to give you the best messaging experience possible.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard 
            icon={<Zap className="text-amber-500" size={24} />}
            title="Real-time Engine"
            desc="Messages are delivered instantly using WebSockets. No refreshing needed, just seamless conversation."
          />
          <FeatureCard 
            icon={<CheckCircle2 className="text-green-500" size={24} />}
            title="Read Receipts"
            desc="Know exactly when your messages are delivered and read with granular message status indicators."
          />
          <FeatureCard 
            icon={<Moon className="text-blue-500" size={24} />}
            title="Dark Mode Support"
            desc="Easy on the eyes. Chatty perfectly adapts to your system preferences or toggles with a click."
          />
          <FeatureCard 
            icon={<Shield className="text-rose-500" size={24} />}
            title="Secure Login"
            desc="JWT based authentication with automatic token refreshing via HTTP-only cookies keeps your sessions safe."
          />
          <FeatureCard 
            icon={<MessageSquare className="text-cyan-500" size={24} />}
            title="Typing Indicators"
            desc="See when the other person is typing in real-time, bridging the gap of digital communication."
          />
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-end">
            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="text-2xl font-bold mb-2 relative z-10">Ready to dive in?</h3>
            <p className="text-cyan-100 mb-6 relative z-10">Join thousands of users chatting daily.</p>
            <Link to="/register" className="inline-block bg-white text-cyan-600 px-6 py-3 rounded-xl font-bold hover:bg-cyan-50 transition-colors self-start relative z-10">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur pb-12 pt-16 relative z-10">
        <div className="container mx-auto px-6 text-center text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2 text-xl font-bold mb-6 text-slate-800 dark:text-slate-200">
            <MessageSquare className="text-cyan-500" />
            <span>Chatty</span>
          </div>
          <p className="mb-4">Designed for the modern web.</p>
          <p className="text-sm">© {new Date().getFullYear()} Chatty App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
      {desc}
    </p>
  </div>
);

export default Landing;

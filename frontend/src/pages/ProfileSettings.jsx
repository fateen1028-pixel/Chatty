import { useState } from 'react';
import { ArrowLeft, User, Camera, Lock, Mail, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('User'); // Dummy default
  const [email, setEmail] = useState('user@example.com'); // Dummy default
  const [password, setPassword] = useState('');
  
  const handleSaveProfile = (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic here
    // API URL: PUT /users/profile
    console.log('Profile saved', { username, email });
  };
  
  const handleSavePassword = (e) => {
    e.preventDefault();
    // TODO: Implement password change logic here
    // API URL: PUT /users/change-password
    console.log('Password updated');
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0B0C0E] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#1A1A1D]/80 backdrop-blur-xl flex items-center px-4 md:px-6 sticky top-0 z-10">
        <button
          onClick={() => navigate('/chat')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-3"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-lg font-bold">Profile Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Avatar Section */}
          <div className="bg-white dark:bg-[#1A1A1D] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <div className="relative group cursor-pointer mb-4">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-[#0B0C0E]">
                <User size={40} className="text-slate-400" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <h2 className="font-semibold text-lg">{username}</h2>
            <p className="text-slate-500 text-sm">{email}</p>
            {/* TODO: API URL for avatar upload: POST /users/avatar */}
          </div>

          {/* Profile Form */}
          <div className="bg-white dark:bg-[#1A1A1D] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <User size={20} className="text-cyan-500" />
              Personal Information
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0C0E] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0B0C0E] border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-md shadow-cyan-500/20">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Security Form */}
          <div className="bg-white dark:bg-[#1A1A1D] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock size={20} className="text-cyan-500" />
              Change Password
            </h3>
            
            <form onSubmit={handleSavePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 dark:bg-[#0B0C0E] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="flex items-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
                  <Lock size={18} />
                  Update Password
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}

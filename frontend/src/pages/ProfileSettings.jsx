import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, User, Camera, Lock, Mail, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(localStorage.getItem('username')); // Dummy default
  const [email, setEmail] = useState(localStorage.getItem('email')); // Dummy default
  const [password, setPassword] = useState('');

  const fileInputRef = useRef(null);

  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');



  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/profile/image`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
        );

        if (!response.ok) {
          throw new Error('Could not load profile image');
        }

        const data = await response.json();

        setProfileImageUrl(data.profileImageUrl || '');
      } catch (error) {
        console.error(error);
      }
    };

    loadProfileImage();
  }, []);


  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarError('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Only JPG, PNG and WebP images are allowed');
      event.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setAvatarError('Image must be smaller than 5 MB');
      event.target.value = '';
      return;
    }

    const temporaryPreview = URL.createObjectURL(file);
    setAvatarPreview(temporaryPreview);
    setAvatarUploading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/profile/image`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.message || 'Profile image upload failed'
        );
      }

      const data = await response.json();

      setProfileImageUrl(data.profileImageUrl);
      setAvatarPreview('');
    } catch (error) {
      console.error(error);
      setAvatarPreview('');
      setAvatarError(error.message);
    } finally {
      setAvatarUploading(false);
      URL.revokeObjectURL(temporaryPreview);
      event.target.value = '';
    }
  };
  
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
            <div className="relative mb-4">
              <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="relative group rounded-full disabled:cursor-not-allowed"
                  aria-label="Change profile image"
              >
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-[#0B0C0E]">
                  {avatarPreview || profileImageUrl ? (
                      <img
                          src={avatarPreview || profileImageUrl}
                          alt={`${username}'s profile`}
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      <User size={40} className="text-slate-400" />
                  )}
                </div>

                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarUploading ? (
                      <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                      <Camera size={24} className="text-white" />
                  )}
                </div>
              </button>

              <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
              />
            </div>

            {avatarError && (
                <p className="mb-3 text-sm text-red-500">
                  {avatarError}
                </p>
            )}
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

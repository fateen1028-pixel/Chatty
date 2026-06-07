import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff ,LoaderCircle} from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { prepareDeviceForLogin } from "../crypto/initializekey.js";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const device = await prepareDeviceForLogin(username);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    password,
                    deviceName: device.deviceName,
                    deviceFingerprint: device.deviceFingerprint,
                    publicKey: device.publicKey
                })
            });

            if (!response.ok) {
                let errorMessage = 'Login failed';

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = `Server Error: ${response.statusText || response.status}`;
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.accessToken) {
                throw new Error("Invalid server response structure");
            }

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('username', username);

            navigate('/chat');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0C0E] transition-colors relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111113]/80 rounded-[2rem] shadow-2xl p-8 sm:p-10 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 transform -rotate-3">
             <span className="text-3xl font-bold transform rotate-3">C</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Sign in to continue to ChatApp</p>
        </div>

        {error && <div className="mb-4 text-red-500 text-center text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    icon={Mail}
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                    required
                    disabled={isLoading}
                />
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              <span className="text-slate-600 dark:text-slate-300">Remember me</span>
            </label>
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Forgot password?
            </a>
          </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
      <LoaderCircle className="w-4 h-4 animate-spin" />
      Signing in...
    </span>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
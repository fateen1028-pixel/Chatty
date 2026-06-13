import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User ,LoaderCircle} from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return null;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      return;
    }

    setError('');

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      setError("Username is required");
      return;
    }

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required");
      return;
    }

    const passwordError = validatePassword(trimmedPassword);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password: trimmedPassword
        })
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.detail ||
            'Registration failed'
        );
      }

      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0C0E] transition-colors relative overflow-hidden">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111113]/80 rounded-[2rem] shadow-2xl p-8 sm:p-10 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transform rotate-3">
             <span className="text-3xl font-bold transform -rotate-3">C</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Join to start chatting in seconds</p>
        </div>

        {error && <div className="mb-4 text-red-500 text-center text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={User}
                  required
                  disabled={isRegistering}
              />
            </div>
            <div>
              <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                  disabled={isRegistering}
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
                  disabled={isRegistering}
              />
              <button
                  type="button"
                  disabled={isRegistering}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:pointer-events-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
              type="submit"
              disabled={isRegistering}
              className="w-full"
          >
            {isRegistering ? (
                <span className="flex items-center justify-center gap-2">
      <LoaderCircle className="w-4 h-4 animate-spin" />
      Creating account...
    </span>
            ) : (
                "Sign Up"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
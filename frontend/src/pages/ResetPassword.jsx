import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Lock,
    Eye,
    EyeOff,
    LoaderCircle,
    ArrowLeft,
} from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isLoading) {
            return;
        }

        setError('');

        if (!token) {
            setError('This password reset link is invalid.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/reset-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token,
                        newPassword,
                    }),
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                // Response may contain no JSON.
            }

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            navigate('/login', {
                replace: true,
                state: {
                    message: 'Password changed successfully. Sign in again.',
                },
            });
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0C0E]">
                <div className="w-full max-w-md text-center bg-white dark:bg-[#111113] rounded-3xl p-10 shadow-xl">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Invalid reset link
                    </h1>

                    <p className="mt-3 text-slate-500 dark:text-slate-400">
                        The reset token is missing.
                    </p>

                    <Link
                        to="/forgot-password"
                        className="inline-block mt-6 font-medium text-indigo-600 dark:text-indigo-400"
                    >
                        Request another link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0C0E]">
            <div className="w-full max-w-md bg-white dark:bg-[#111113] rounded-[2rem] shadow-2xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock size={30} />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                        Create new password
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400">
                        Enter a new password for your account.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            icon={Lock}
                            autoComplete="new-password"
                            required
                            disabled={isLoading}
                        />

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        icon={Lock}
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Updating password...
              </span>
                        ) : (
                            'Reset password'
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                    >
                        <ArrowLeft size={16} />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
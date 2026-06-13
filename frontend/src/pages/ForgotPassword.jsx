import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, LoaderCircle, ArrowLeft } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isLoading) {
            return;
        }

        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                // Response may contain no JSON.
            }

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to process password reset request'
                );
            }

            setMessage(
                data.message ||
                'If an account exists for this email, a reset link has been sent.'
            );
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0C0E]">
            <div className="w-full max-w-md bg-white dark:bg-[#111113] rounded-[2rem] shadow-2xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail size={30} />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                        Forgot password?
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400">
                        Enter your account email. We will send you a reset link.
                    </p>
                </div>

                {message && (
                    <div className="mb-5 rounded-xl bg-green-50 dark:bg-green-950/30 p-4 text-sm text-green-700 dark:text-green-400">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        icon={Mail}
                        autoComplete="email"
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
                Sending link...
              </span>
                        ) : (
                            'Send reset link'
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
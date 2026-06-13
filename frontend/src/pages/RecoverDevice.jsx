import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Shield,
    ArrowLeft,
    LoaderCircle,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

export default function RecoverDevice() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [recoveryPhrase, setRecoveryPhrase] = useState('');
    const [error, setError] = useState('');
    const [isRecovering, setIsRecovering] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleRecover = async (e) => {
        e.preventDefault();

        if (isRecovering) {
            return;
        }

        setError('');

        const trimmedUsername = username.trim();
        const trimmedPhrase = recoveryPhrase.trim().toLowerCase();

        if (!trimmedUsername) {
            setError('Username is required');
            return;
        }

        if (!trimmedPhrase) {
            setError('Recovery phrase is required');
            return;
        }

        const wordCount = trimmedPhrase.split(/\s+/).length;

        if (wordCount !== 12) {
            setError('Recovery phrase must contain 12 words');
            return;
        }

        setIsRecovering(true);

        try {
            // UI-only for now.
            // Later:
            // 1. Fetch encrypted private key backup from backend
            // 2. Derive key from recovery phrase
            // 3. Decrypt private key locally
            // 4. Save restored private key in IndexedDB
            // 5. Mark this device as trusted

            await new Promise(resolve => setTimeout(resolve, 800));

            setIsDone(true);
        } catch (err) {
            setError(err.message || 'Recovery failed');
        } finally {
            setIsRecovering(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0C0E] transition-colors relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/80 dark:bg-[#111113]/80 rounded-[2rem] shadow-2xl p-8 sm:p-10 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 z-10">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 mb-6"
                >
                    <ArrowLeft size={17} />
                    Back to login
                </Link>

                {!isDone ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-cyan-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
                                <Shield size={32} />
                            </div>

                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                                Recover Device
                            </h1>

                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Use your recovery phrase to restore encrypted chat access on this device.
                            </p>
                        </div>

                        <div className="mb-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex gap-3">
                            <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />

                            <p className="text-sm text-amber-700 dark:text-amber-200/80 leading-relaxed">
                                This should only happen locally. The server must never receive your recovery phrase.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 text-red-500 text-center text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRecover} className="space-y-5">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isRecovering}
                            />

                            <textarea
                                value={recoveryPhrase}
                                onChange={(e) => setRecoveryPhrase(e.target.value)}
                                rows={4}
                                placeholder="Enter your 12-word recovery phrase"
                                disabled={isRecovering}
                                className="w-full bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400"
                            />

                            <Button
                                type="submit"
                                disabled={isRecovering}
                                className="w-full disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isRecovering ? (
                                    <span className="flex items-center justify-center gap-2">
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Recovering...
                  </span>
                                ) : (
                                    'Recover This Device'
                                )}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                            <CheckCircle2 size={42} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                                Recovery UI complete
                            </h1>

                            <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Next we will connect this to the real encrypted key backup flow.
                            </p>
                        </div>

                        <Button onClick={() => navigate('/login')} className="w-full">
                            Go to Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "../components/Navigation";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) navigate('/', { replace: true });
    }, [isLoggedIn]);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'register') {
                const data = await api.post('/auth/register', { username, email, password });
                if (data.error) { setError(data.error); return; }
                login(data.token, data.user);
            } else {
                const data = await api.post('/auth/login', { email, password });
                if (data.error) { setError(data.error); return; }
                login(data.token, data.user);
            }
            navigate('/', { replace: true });
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-[#f5f1e8]">
            <Navigation />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="max-w-md mx-auto">
                    <div className="border-2 border-orange-900/20 rounded-3xl p-8 bg-white">
                        <h1 className="text-3xl text-orange-900 mb-6 text-center">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h1>

                        {/* Mode Toggle */}
                        <div className="flex rounded-lg border-2 border-orange-900/20 mb-6 overflow-hidden">
                            <button
                                onClick={() => { setMode('login'); setError(''); }}
                                className={`flex-1 py-2 text-sm transition-colors ${mode === 'login' ? 'bg-orange-600 text-white' : 'text-orange-900/60 hover:text-orange-900'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { setMode('register'); setError(''); }}
                                className={`flex-1 py-2 text-sm transition-colors ${mode === 'register' ? 'bg-orange-600 text-white' : 'text-orange-900/60 hover:text-orange-900'}`}
                            >
                                Register
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'register' && (
                                <div>
                                    <label className="block text-orange-900/60 mb-2 text-sm">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-900/40" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                            className="w-full bg-white border-2 border-orange-900/20 rounded-lg px-10 py-3 text-orange-900 focus:outline-none focus:border-orange-600 transition-colors"
                                            placeholder="Choose a username"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-orange-900/60 mb-2 text-sm">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-900/40" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white border-2 border-orange-900/20 rounded-lg px-10 py-3 text-orange-900 focus:outline-none focus:border-orange-600 transition-colors"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-orange-900/60 mb-2 text-sm">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-900/40" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white border-2 border-orange-900/20 rounded-lg px-10 py-3 text-orange-900 focus:outline-none focus:border-orange-600 transition-colors"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-3 rounded-lg transition-colors"
                            >
                                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-orange-900/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-orange-900/60">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full bg-white border-2 border-orange-900/20 hover:border-orange-600 text-orange-900 py-3 rounded-full transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

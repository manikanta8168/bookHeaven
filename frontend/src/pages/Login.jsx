import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { BookOpen } from 'lucide-react';
import api from '../lib/api';

const Login = ({ adminMode = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { userInfo, login } = useAuthStore();

    const redirectParam = new URLSearchParams(location.search).get('redirect');
    const redirect = adminMode
        ? redirectParam || '/admin/dashboard'
        : redirectParam || '/';

    useEffect(() => {
        if (userInfo) {
            navigate(redirect);
        }
    }, [navigate, userInfo, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (adminMode && isRegister) {
                throw new Error('Admin registration is disabled');
            }

            if (isRegister) {
                const { data } = await api.post('/users', { name, email, password });
                login(data);
            } else {
                const { data } = await api.post('/users/login', { email, password });
                if (adminMode && !data.isAdmin) {
                    throw new Error('This account is not an admin account');
                }
                login(data);
            }
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-bg">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-surface p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-dark-border">
                <div className="text-center">
                    <BookOpen className="h-12 w-12 text-primary-600 mx-auto" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        {adminMode ? 'Admin sign in' : isRegister ? 'Create an account' : 'Sign in to your account'}
                    </h2>
                    {!adminMode && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                            <button
                                onClick={() => setIsRegister(!isRegister)}
                                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                            >
                                {isRegister ? 'Sign in' : 'Register now'}
                            </button>
                        </p>
                    )}
                </div>

                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center">{error}</div>}

                    <div className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

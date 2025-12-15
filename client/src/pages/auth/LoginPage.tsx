import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const email = (e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement).value;
        const password = (e.currentTarget.querySelector('input[type="password"]') as HTMLInputElement).value;
        const lang = location.pathname.split('/')[1] || 'en';

        try {
            // FIXED: Real Authentication + Direct Slug Redirect
            let ENV_API = import.meta.env.VITE_API_URL;
            if (ENV_API && !ENV_API.startsWith('http')) {
                ENV_API = `https://${ENV_API}`;
            }
            const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Save Auth Info
                localStorage.setItem('flow_realtor_token', data.token);
                localStorage.setItem('flow_realtor_slug', data.user.slug || '');
                localStorage.setItem('flow_realtor_role', data.user.role || 'broker');

                // Direct Redirect to Slug URL
                if (data.user.role === 'admin') {
                    navigate(`/${lang}/admin/dashboard`);
                } else if (data.user.slug) {
                    navigate(`/${lang}/${data.user.slug}/dashboard`);
                } else {
                    // Fallback if no slug (should rarely happen after backfill)
                    navigate(`/${lang}/dashboard`);
                }
            } else {
                alert('Login Failed: ' + data.message);
            }
        } catch (error: any) {
            console.error('Login Error:', error);
            alert('Connection Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                    <p className="text-gray-500 mt-2">Sign in to your FlowRealtors account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="you@agency.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account? <a href="/register" className="text-blue-600 font-medium hover:underline">Get started</a>
                </div>
            </div>
        </div>
    );
}

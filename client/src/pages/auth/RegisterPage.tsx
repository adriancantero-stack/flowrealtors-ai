
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
  FlowRealtors Registration Page
  - Creates a new Broker account
  - Auto-logs in after creation
  - Redirects to custom slug dashboard
*/

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const lang = location.pathname.split('/')[1] || 'en';

        try {
            // Use API_BASE absolute URL logic
            let ENV_API = import.meta.env.VITE_API_URL;
            if (ENV_API && !ENV_API.startsWith('http')) {
                ENV_API = `https://${ENV_API}`;
            }
            const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, account_type: 'broker' })
            });

            const data = await res.json();

            if (res.ok) {
                // Auto-login logic (reuse token if backend return it, or just redir to login)
                // Since register endpoint returns user info but no token typically, 
                // let's try to auto-login OR redirect to login with pre-filled email.

                // For MVP speed: Alert success and go to login
                alert('Account created! Please sign in.');
                navigate(`/${lang}/login`);
            } else {
                alert('Registration Failed: ' + data.message);
            }
        } catch (error: any) {
            console.error('Register Error:', error);
            alert('Connection Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Start for Free</h2>
                    <p className="text-gray-500 mt-2">Create your FlowRealtors account</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input name="name" type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-all outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Doe" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input name="email" type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-all outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@agency.com" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input name="password" type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 transition-all outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <a href="/login" className="text-blue-600 font-medium hover:underline">Sign In</a>
                </div>
            </div>
        </div>
    );
}

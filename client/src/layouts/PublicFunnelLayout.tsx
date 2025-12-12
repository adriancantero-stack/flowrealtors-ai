import { Outlet } from 'react-router-dom';

export default function PublicFunnelLayout() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Minimal Header (optional: could be customized per realtor) */}
            <header className="border-b py-4">
                <div className="max-w-6xl mx-auto px-6 text-center text-xs text-gray-400">
                    Trusted Realtor Partner
                </div>
            </header>

            <main>
                <Outlet />
            </main>

            <footer className="border-t py-8 mt-20">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Real Estate Services. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

import { Outlet, NavLink, Link, useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users,
    Settings, PlayCircle, Share2, LogOut, LayoutTemplate
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { useEffect, useState } from 'react';

export default function DashboardLayout() {
    const { t } = useTranslation();
    const { lang, slug } = useParams();
    const navigate = useNavigate();
    const [realtorName, setRealtorName] = useState('Realtor');

    // Base URL for the current realtor
    const baseUrl = `/${lang}/${slug}`;

    const navItems = [
        { href: `${baseUrl}/dashboard`, label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
        { href: `${baseUrl}/leads`, label: t('nav.leads'), icon: Users },
        { href: `${baseUrl}/automations`, label: t('nav.automations'), icon: PlayCircle },
        { href: `${baseUrl}/integrations`, label: t('nav.integrations'), icon: Share2 },
        { href: `${baseUrl}/funnel`, label: t('nav.funnel'), icon: LayoutTemplate },
        { href: `${baseUrl}/settings`, label: t('nav.settings'), icon: Settings },
    ];

    // Validate Slug & Fetch Info
    useEffect(() => {
        if (!slug) return;

        let ENV_API = import.meta.env.VITE_API_URL;
        if (ENV_API && !ENV_API.startsWith('http')) {
            ENV_API = `https://${ENV_API}`;
        }
        const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

        fetch(`${API_BASE}/api/realtors/${slug}/summary`)
            .then(res => {
                if (!res.ok) throw new Error('Invalid Realtor');
                return res.json();
            })
            .then(data => {
                setRealtorName(data.realtor.name);
            })
            .catch(err => {
                console.error('Slug validation error:', err);
                // navigate(`/${lang}/login`);
            });
    }, [slug, lang, navigate]);

    return (
        <div className="min-h-screen font-sans bg-gray-50 flex">
            {/* Using standard Tailwind classes here, layout structure is managed by CSS via classes applied inside if using pure CSS components, but mixing Tailwind is fine */}

            {/* Sidebar (Flow UI .sidebar class applied) */}
            <aside className="sidebar z-20">
                <div className="h-16 flex items-center px-4 mb-2">
                    {/* Updated Logo to match Landing Page */}
                    <img src="/logo.png" alt="FlowRealtors Logo" className="h-10 w-auto" />
                </div>

                <nav className="flex-1 space-y-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.end}
                                className={({ isActive }) => cn(
                                    "sidebar-item",
                                    isActive && "active"
                                )}
                            >
                                <Icon className="w-5 h-5 opacity-70" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4 border-t border-gray-200">
                    <Link to="/login" className="sidebar-item hover:text-red-600 hover:bg-red-50 group">
                        <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                        {t('auth.logout')}
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-[260px]">
                {/* Navbar (Flow UI .navbar) */}
                <header className="navbar flex justify-between items-center px-8 py-4 bg-white border-b border-gray-100 mb-8 rounded-2xl shadow-sm mx-8 mt-6">
                    {/* Left: Full Date */}
                    <div className="text-gray-500 font-medium text-sm">
                        {(() => {
                            const dateStr = new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            });
                            // Capitalize first letter
                            return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                        })()}
                    </div>

                    {/* Right: Avatar + Name */}
                    <div className="flex items-center gap-3">
                        <span className="text-gray-900 font-semibold text-base">
                            {realtorName}
                        </span>
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-blue-100"
                            style={{ backgroundColor: '#0A84FF' }}
                        >
                            {realtorName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

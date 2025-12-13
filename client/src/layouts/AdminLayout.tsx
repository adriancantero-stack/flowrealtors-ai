import { Outlet, NavLink, Link, useParams } from 'react-router-dom';
import {
    LayoutDashboard, Users, MessageSquare, Activity,
    Settings, LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';

export default function AdminLayout() {
    const { t } = useTranslation();
    const { lang } = useParams();
    const prefix = lang ? `/${lang}` : '/en';

    const navItems = [
        { href: `${prefix}/admin/dashboard`, label: t('admin.nav.overview'), icon: LayoutDashboard },
        { href: `${prefix}/admin/brokers`, label: 'Corretores', icon: Users },
        { href: `${prefix}/admin/leads`, label: t('admin.nav.leads'), icon: MessageSquare },
        { href: `${prefix}/admin/settings`, label: 'Configurações', icon: Settings },
        { href: `${prefix}/admin/logs`, label: 'Logs & Monitor', icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Admin Sidebar - Darker/Technical look */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <img src="/logo-white.png" alt="FlowRealtors" className="h-8 w-auto" />
                    </div>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={({ isActive }) => cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive ? "bg-[#1786ff] text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className="mr-3 h-5 w-5 opacity-70" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 pb-4">
                        <div className="w-8 h-8 rounded bg-[#1786ff] flex items-center justify-center text-xs font-bold">
                            AD
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">Adrian C.</div>
                            <div className="text-xs text-slate-400">Super Admin</div>
                        </div>
                    </div>
                    <Link to="/login" className="flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-red-900/20 hover:text-red-400 transition-colors">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h2 className="text-xl font-bold text-gray-800">{t('admin.panel_title')}</h2>
                    <div className="flex items-center gap-4">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{t('admin.system_status')}</span>
                        {/* Avatar placeholder */}
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            AD
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

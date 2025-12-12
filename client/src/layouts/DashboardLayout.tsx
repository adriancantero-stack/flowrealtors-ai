import { Outlet, NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard, Users,
    Settings, PlayCircle, Share2, LogOut, LayoutTemplate
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';

export default function DashboardLayout() {
    const { t } = useTranslation();

    const navItems = [
        { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
        { href: '/dashboard/leads', label: t('nav.leads'), icon: Users },
        { href: '/dashboard/automations', label: t('nav.automations'), icon: PlayCircle },
        { href: '/dashboard/intergrations', label: t('nav.integrations'), icon: Share2 },
        { href: '/dashboard/funnel', label: t('nav.funnel'), icon: LayoutTemplate },
        { href: '/dashboard/settings', label: t('nav.settings'), icon: Settings },
    ];

    return (
        <div className="min-h-screen font-sans bg-gray-50 flex">
            {/* Using standard Tailwind classes here, layout structure is managed by CSS via classes applied inside if using pure CSS components, but mixing Tailwind is fine */}

            {/* Sidebar (Flow UI .sidebar class applied) */}
            <aside className="sidebar z-20">
                <div className="h-16 flex items-center px-4 mb-2">
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        Flow<span className="text-primary">Realtor</span>
                    </span>
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
                <header className="navbar">
                    <div className="text-sm font-medium text-gray-500">
                        {/* Breadcrumbs or Page Title could go here */}
                        Wednesday, Oct 24
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
                            <img src="https://ui-avatars.com/api/?name=User&background=random" className="w-full h-full object-cover" />
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

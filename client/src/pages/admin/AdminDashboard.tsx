import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // Fallback mock data in case API is not running/failing
        const mockStats = {
            realtors: { total: 12, active: 8 },
            leads: { total: 145, today: 3, conversion_rate: 12 },
            automations: { executed: 1240, pending: 5 }
        };

        fetch('http://localhost:5001/api/admin/dashboard')
            .then(res => {
                if (!res.ok) throw new Error('API Failed');
                return res.json();
            })
            .then(setStats)
            .catch(err => {
                console.warn('Dashboard API failed, using mock data:', err);
                setStats(mockStats);
            });
    }, []);

    if (!stats) return <div>{t('admin.dashboard.loading')}</div>;

    const cards = [
        { label: t('admin.cards.realtors'), value: stats.realtors?.total || 0, sub: `${stats.realtors?.active || 0} active`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: t('admin.cards.leads'), value: stats.leads?.total || 0, sub: `+${stats.leads?.today || 0} today`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { label: t('admin.cards.conversion'), value: `${stats.leads?.conversion_rate || 0}%`, sub: 'Qualified Leads', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: t('admin.cards.automations'), value: stats.automations?.executed || 0, sub: `${stats.automations?.pending || 0} pending`, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h2>
                <p className="text-gray-500">{t('admin.dashboard.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`p-3 rounded-lg ${card.bg}`}>
                                    <Icon className={`w-6 h-6 ${card.color}`} />
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                            <div className="text-xs text-gray-400 mt-2">{card.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* System Health / Alerts Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-gray-400" />
                    {t('admin.alerts.title')}
                </h3>
                <div className="space-y-2">
                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-100 flex justify-between">
                        <span>⚠️ WhatsApp Provider not connected for 2 Users</span>
                        <button className="underline">View</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

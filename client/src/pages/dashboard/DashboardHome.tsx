import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';

// Simple helper component for status badges
function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        'New': 'badge-info',
        'Qualified': 'badge-success',
        'Hot': 'badge-danger',
        'In Qualification': 'badge-warning',
        'Not Interested': 'badge-neutral'
    };
    return (
        <span className={`badge ${colors[status] || 'badge-neutral'}`}>
            {status}
        </span>
    );
}

export default function DashboardHome() {
    const { t } = useTranslation();
    const [stats, setStats] = useState<any>(null);
    const user = { onboarding_completed: false }; // Mock user context

    useEffect(() => {
        fetch('http://localhost:3000/api/admin/dashboard')
            .then(res => res.json())
            .then(data => setStats(data));
    }, []);

    // Cards configuration using i18n
    const cards = [
        { label: t('dashboard.new_leads'), value: stats?.leads?.today || 3, sub: '+2 from yesterday', icon: Users, color: 'text-blue-500 bg-blue-50' },
        { label: t('dashboard.qualified_leads'), value: 8, sub: '67% rate', icon: TrendingUp, color: 'text-green-500 bg-green-50' },
        { label: t('dashboard.hot_leads'), value: 2, sub: 'Action required', icon: Activity, color: 'text-purple-500 bg-purple-50' },
        { label: t('dashboard.pending_followups'), value: 12, sub: 'View list', icon: MessageSquare, color: 'text-orange-500 bg-orange-50' },
    ];

    // Mock Leads Data
    const leads = [
        { id: 1, name: 'Alice Walker', source: 'Instagram', status: 'New', score: 45, lastMessage: '2m ago' },
        { id: 2, name: 'Roberto Carlos', source: 'WhatsApp', status: 'Qualified', score: 85, lastMessage: '1h ago' },
        { id: 3, name: 'John Smith', source: 'Facebook', status: 'Hot', score: 92, lastMessage: '3h ago' },
        { id: 4, name: 'Maria Garcia', source: 'TikTok', status: 'In Qualification', score: 60, lastMessage: '5m ago' },
        { id: 5, name: 'David Miller', source: 'YouTube', status: 'Not Interested', score: 10, lastMessage: '1d ago' },
    ];

    return (
        <div className="space-y-6">
            {/* Onboarding Banner */}
            {!user.onboarding_completed && (
                <div className="bg-gradient-to-r from-primary to-primary-hover rounded-xl p-6 text-white flex items-center justify-between shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold mb-1">FlowRealtors</h2>
                        <p className="opacity-90">{t('dashboard.resume_onboarding')}</p>
                    </div>
                    <Link to="/onboarding" className="btn bg-white text-primary hover:bg-gray-50 border-0">
                        {t('dashboard.resume_button')}
                    </Link>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
                <button className="btn btn-secondary text-sm">Download Report</button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="card p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg ${card.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-gray-400 flex items-center">
                                {card.sub}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Lead Inbox Table */}
            <div className="card !p-0 overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/30">
                    <h2 className="text-lg font-bold text-gray-900">Lead Inbox</h2>
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className="input w-64 !py-2 !text-sm"
                    />
                </div>

                <div className="table-container border-0 rounded-none">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{t('leads.table.name')}</th>
                                <th>{t('leads.table.source')}</th>
                                <th>{t('leads.table.status')}</th>
                                <th>{t('leads.table.score')}</th>
                                <th>{t('leads.table.last_message')}</th>
                                <th className="text-right">{t('leads.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead.id} className="group cursor-pointer">
                                    <td>
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3 border border-gray-200">
                                                {lead.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-medium text-gray-900">{lead.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-gray-500">{lead.source}</td>
                                    <td>
                                        <StatusBadge status={lead.status} />
                                    </td>
                                    <td>
                                        <div className="flex items-center">
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full mr-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${lead.score > 80 ? 'bg-success' : lead.score > 50 ? 'bg-warning' : 'bg-gray-300'}`}
                                                    style={{ width: `${lead.score}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">{lead.score}</span>
                                        </div>
                                    </td>
                                    <td className="text-gray-400">{lead.lastMessage}</td>
                                    <td className="text-right">
                                        <button className="text-primary font-medium text-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

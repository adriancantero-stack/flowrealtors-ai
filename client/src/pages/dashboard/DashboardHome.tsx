import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, MessageSquare } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
    const { slug, lang } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const user = { onboarding_completed: true }; // Should come from API/Context

    useEffect(() => {
        if (!slug) return;

        let ENV_API = import.meta.env.VITE_API_URL;
        if (ENV_API && !ENV_API.startsWith('http')) {
            ENV_API = `https://${ENV_API}`;
        }
        const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

        setLoading(true);

        // Fetch Summary and Leads concurrently
        Promise.all([
            fetch(`${API_BASE}/api/realtors/${slug}/summary`).then(res => res.json()),
            fetch(`${API_BASE}/api/realtors/${slug}/leads?pageSize=5`).then(res => res.json())
        ])
            .then(([summaryData, leadsData]) => {
                setStats(summaryData.stats);
                setLeads(leadsData.items || []);
            })
            .catch(err => console.error('Dashboard Fetch Error:', err))
            .finally(() => setLoading(false));

    }, [slug]);

    // Cards configuration using i18n
    const cards = [
        { label: t('dashboard.new_leads'), value: stats?.new_leads || 0, sub: '+0 from yesterday', icon: Users, color: 'text-blue-500 bg-blue-50' },
        { label: t('dashboard.qualified_leads'), value: stats?.qualified_leads || 0, sub: 'High Potential', icon: TrendingUp, color: 'text-green-500 bg-green-50' },
        { label: t('dashboard.hot_leads'), value: stats?.hot_leads || 0, sub: 'Action required', icon: Activity, color: 'text-purple-500 bg-purple-50' },
        { label: t('dashboard.pending_followups'), value: stats?.pending_followups || 0, sub: 'View list', icon: MessageSquare, color: 'text-orange-500 bg-orange-50' },
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
                <button className="btn btn-secondary text-sm">{t('dashboard.download_report')}</button>
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
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                        {loading ? '...' : card.value}
                                    </h3>
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
                    <h2 className="text-lg font-bold text-gray-900">{t('dashboard.lead_inbox')}</h2>
                    <Link to={`/${lang}/${slug}/leads`} className="text-sm text-primary font-medium hover:underline">
                        View all
                    </Link>
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
                            {leads.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No leads found.
                                    </td>
                                </tr>
                            )}
                            {leads.map((lead) => (
                                <tr
                                    key={lead.id}
                                    className="group cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    onClick={() => navigate(`/${lang}/${slug}/leads/${lead.id}`)}
                                >
                                    <td>
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3 border border-gray-200">
                                                {lead.name ? lead.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '?'}
                                            </div>
                                            <span className="font-medium text-gray-900">{lead.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="text-gray-500">{lead.source || 'Direct'}</td>
                                    <td>
                                        <StatusBadge status={lead.status || 'New'} />
                                    </td>
                                    <td>
                                        {lead.ai_score ? (
                                            <div className="flex items-center">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full mr-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${lead.ai_score > 80 ? 'bg-success' : lead.ai_score > 50 ? 'bg-warning' : 'bg-gray-300'}`}
                                                        style={{ width: `${lead.ai_score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-500">{lead.ai_score}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="text-gray-400 text-xs">
                                        {lead.last_message_preview ? (
                                            <span className="truncate max-w-[150px] block" title={lead.last_message_preview}>
                                                {lead.last_message_preview.length > 20 ? lead.last_message_preview.substring(0, 20) + '...' : lead.last_message_preview}
                                            </span>
                                        ) : (
                                            new Date(lead.createdAt || Date.now()).toLocaleDateString()
                                        )}
                                    </td>
                                    <td className="text-right">
                                        <button className="text-primary font-medium text-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                            <td className="text-right">
                                                <button
                                                    className="text-primary font-medium text-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/${lang}/${slug}/leads/${lead.id}`);
                                                    }}
                                                >
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

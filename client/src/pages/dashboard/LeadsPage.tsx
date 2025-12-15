import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';

// Helper for status badges (reused)
function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        'New': 'badge-info',
        'Qualified': 'badge-success',
        'Hot': 'badge-danger',
        'In Qualification': 'badge-warning',
        'Not Interested': 'badge-neutral',
        'Follow-up': 'badge-warning'
    };
    return (
        <span className={`badge ${colors[status] || 'badge-neutral'}`}>
            {status}
        </span>
    );
}

export default function LeadsPage() {
    const { t } = useTranslation();
    const { slug } = useParams();

    // State
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!slug) return;
        fetchLeads();
    }, [slug, page, statusFilter]); // Re-fetch on filter change

    const fetchLeads = (searchTerm?: string) => {
        setLoading(true);
        let ENV_API = import.meta.env.VITE_API_URL;
        if (ENV_API && !ENV_API.startsWith('http')) {
            ENV_API = `https://${ENV_API}`;
        }
        const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

        const query = new URLSearchParams({
            page: page.toString(),
            pageSize: '10',
            q: searchTerm !== undefined ? searchTerm : search, // Allow immediate search override
            status: statusFilter
        });

        fetch(`${API_BASE}/api/realtors/${slug}/leads?${query.toString()}`)
            .then(res => res.json())
            .then(data => {
                setLeads(data.items || []);
                setTotal(data.total);
                setTotalPages(data.totalPages);
            })
            .catch(err => console.error('Leads Fetch Error:', err))
            .finally(() => setLoading(false));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1
        fetchLeads();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('nav.leads')}</h1>
                <button className="btn btn-primary">
                    {t('leads.export')}
                </button>
            </div>

            <div className="card !p-0 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 bg-gray-50/50">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('dashboard.search_placeholder')}
                            className="input w-full !pl-10 !py-2"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    {/* Filter Status */}
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            className="select !py-2 !text-sm w-40"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">{t('leads.all_status')}</option>
                            <option value="New">New</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Hot">Hot</option>
                            <option value="In Qualification">In Qualification</option>
                            <option value="Not Interested">Not Interested</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container border-0 rounded-none relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    <table className="table">
                        <thead>
                            <tr>
                                <th>{t('leads.table.name')}</th>
                                <th>{t('leads.table.status')}</th>
                                <th>{t('leads.table.source')}</th>
                                <th>{t('leads.table.score')}</th>
                                <th>{t('leads.table.last_message')}</th>
                                <th className="text-right">{t('leads.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {leads.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        {t('leads.no_leads')}
                                    </td>
                                </tr>
                            )}
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td className="font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3 border border-gray-200">
                                                {lead.name ? lead.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '?'}
                                            </div>
                                            {lead.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadge status={lead.status || 'New'} />
                                    </td>
                                    <td className="text-gray-500">{lead.source || 'Direct'}</td>
                                    <td>
                                        {lead.ai_score ? (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${lead.ai_score > 80 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {lead.ai_score}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="text-gray-400 text-xs max-w-[200px] truncate">
                                        {lead.last_message_preview || new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="text-right">
                                        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                    <span className="text-sm text-gray-500">
                        {t('leads.page_info').replace('{page}', page.toString()).replace('{total}', totalPages.toString())} ({total} leads)
                    </span>
                    <div className="flex space-x-2">
                        <button
                            className="btn btn-secondary !px-2"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            className="btn btn-secondary !px-2"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

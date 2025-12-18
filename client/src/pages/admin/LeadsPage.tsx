import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, User, ArrowRight } from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    phone: string;
    email: string;
    status: string;
    desired_city?: string;
    budget?: string;
    createdAt: string;
    broker?: { name: string };
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    // FIXED: Use the same fallback URL logic as GeminiSettingsPage/BrokersPage
    let ENV_API = import.meta.env.VITE_API_URL;
    if (ENV_API && !ENV_API.startsWith('http')) {
        ENV_API = `https://${ENV_API}`;
    }
    const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

    useEffect(() => {
        fetchLeads();
    }, [filterStatus]);

    const fetchLeads = async () => {
        try {
            const query = new URLSearchParams();
            if (filterStatus) query.append('status', filterStatus);

            const token = localStorage.getItem('flow_realtor_token');
            const res = await fetch(`${API_BASE}/api/admin/leads?${query.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setLeads(data);
        } catch (error) {
            console.error('Failed to load leads', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'qualified': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'appointment_set': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie oportunidades e contatos.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-500 appearance-none"
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Todos os Status</option>
                            <option value="new">Novos</option>
                            <option value="qualified">Qualificados</option>
                            <option value="appointment_set">Agendados</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">Lead</th>
                            <th className="px-6 py-4 font-medium">Interesse</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Corretor</th>
                            <th className="px-6 py-4 font-medium">Data</th>
                            <th className="px-6 py-4 font-medium text-right">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{lead.name || 'Sem nome'}</span>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <span className="flex items-center gap-1"><MessageSquare size={10} /> {lead.phone}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex flex-col gap-1">
                                        {lead.desired_city && <span className="text-gray-900 font-medium">{lead.desired_city}</span>}
                                        {lead.budget && <span className="text-xs">{lead.budget}</span>}
                                        {!lead.desired_city && !lead.budget && <span className="text-gray-400">-</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                                        {lead.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {lead.broker ? (
                                        <span className="flex items-center gap-1.5 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded text-xs w-fit">
                                            <User size={12} /> {lead.broker.name.split(' ')[0]}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">Não atribuído</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-blue-600 transition">
                                        <ArrowRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && leads.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Nenhum lead encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}

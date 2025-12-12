import { useState } from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function LeadsPage() {
    const { t } = useTranslation();
    const [leads] = useState([
        { id: 1, name: 'Alice Cooper', status: 'New', source: 'Instagram' },
        { id: 2, name: 'Bob Wilson', status: 'Qualified', source: 'WhatsApp' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
                <button className="btn btn-primary">
                    Add Lead
                </button>
            </div>

            <div className="card !p-0 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b flex items-center space-x-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            className="input w-full !pl-10 !py-2"
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </button>
                </div>

                {/* Table */}
                <div className="table-container border-0 rounded-none">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{t('leads.table.name')}</th>
                                <th>{t('leads.table.status')}</th>
                                <th>{t('leads.table.source')}</th>
                                <th className="text-right">{t('leads.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="font-medium text-gray-900">{lead.name}</td>
                                    <td>
                                        <span className={`badge ${lead.status === 'New' ? 'badge-info' : 'badge-success'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="text-gray-500">{lead.source}</td>
                                    <td className="text-right">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="h-5 w-5" />
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

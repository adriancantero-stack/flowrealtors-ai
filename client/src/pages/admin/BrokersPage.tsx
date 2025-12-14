import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, XCircle, Mail, Phone, MapPin } from 'lucide-react';

interface Broker {
    id: number;
    name: string;
    email: string;
    phone: string;
    city: string;
    state?: string;
    status: string;
    role: string;
    _count?: { leads: number };
}

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function BrokersPage() {
    const [brokers, setBrokers] = useState<Broker[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBroker, setEditingBroker] = useState<Broker | null>(null);

    // Form Stats
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', city: '', state: '', status: 'active', default_lang: 'pt'
    });

    // FIXED: Use the same fallback URL logic as GeminiSettingsPage
    let ENV_API = import.meta.env.VITE_API_URL;
    if (ENV_API && !ENV_API.startsWith('http')) {
        ENV_API = `https://${ENV_API}`;
    }
    const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

    useEffect(() => {
        fetchBrokers();
    }, []);

    const fetchBrokers = async () => {
        try {
            // Use API_BASE
            const res = await fetch(`${API_BASE}/api/admin/brokers`);
            if (res.ok) {
                const data = await res.json();
                setBrokers(data);
            }
        } catch (error) {
            console.error('Error fetching brokers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingBroker ? `/api/admin/brokers/${editingBroker.id}` : '/api/admin/brokers';
        const method = editingBroker ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingBroker(null);
                setFormData({ name: '', email: '', phone: '', city: '', state: '', status: 'active', default_lang: 'pt' });
                fetchBrokers();
            } else {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    alert(data.error || 'Erro ao salvar corretor');
                } catch (e) {
                    console.error('Non-JSON response:', text);
                    alert(`Erro no servidor (${res.status} ${res.statusText}): ${text.substring(0, 100)}...`);
                }
            }
        } catch (error: any) {
            console.error('Failed to save broker', error);
            alert('Erro de conexão: ' + (error.message || 'Falha ao contatar servidor'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this broker?')) return;
        try {
            await fetch(`/api/admin/brokers/${id}`, { method: 'DELETE' });
            fetchBrokers();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const openEdit = (broker: Broker) => {
        setEditingBroker(broker);
        setFormData({
            name: broker.name,
            email: broker.email,
            phone: broker.phone || '',
            city: broker.city || '',
            state: broker.state || '',
            status: broker.status,
            default_lang: 'pt' // Assuming default or fetch from correct type if extended
        });
        setIsModalOpen(true);
    };

    const openNew = () => {
        setEditingBroker(null);
        setFormData({ name: '', email: '', phone: '', city: '', state: '', status: 'active', default_lang: 'pt' });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Corretores</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie sua equipe de vendas.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (!confirm('Reparar banco de dados? (Isso pode levar alguns segundos)')) return;

                            // Aligning with the working TESTAR button strategy
                            const TARGET_URL = 'https://flowrealtors-ai-production.up.railway.app/_system/fix-db';

                            try {
                                const res = await fetch(TARGET_URL, {
                                    method: 'POST', // Semantic correctness
                                    mode: 'cors',   // Explicit CORS
                                    headers: { 'Accept': 'application/json' }
                                });

                                if (res.ok) {
                                    const data = await res.json();
                                    alert(data.success ? 'Reparo concluído com sucesso!' : 'Falha no reparo: ' + data.error);
                                } else {
                                    const text = await res.text();
                                    alert(`Erro no reparo (${res.status}): ${text}`);
                                }
                            } catch (e: any) {
                                alert('Erro de rede: ' + e.message);
                            }
                        }}
                        className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition shadow-sm font-medium text-sm"
                    >
                        Reparar Banco
                    </button>
                    <button
                        onClick={async () => {
                            const TARGET_URL = 'https://flowrealtors-ai-production.up.railway.app/api/version';
                            const startTime = Date.now();
                            try {
                                alert(`Tentando conectar em:\n${TARGET_URL}\n\nAguarde...`);
                                const res = await fetch(TARGET_URL, {
                                    method: 'GET',
                                    mode: 'cors',
                                    headers: { 'Accept': 'application/json' }
                                });

                                const duration = Date.now() - startTime;

                                if (res.ok) {
                                    const data = await res.json();
                                    alert(`SUCESSO (${duration}ms)!\nVersão: ${data.version}\nType: ${data.type}`);
                                } else {
                                    const text = await res.text();
                                    alert(`FALHA HTTP ${res.status} (${duration}ms):\n${text.substring(0, 100)}`);
                                }
                            } catch (e: any) {
                                const duration = Date.now() - startTime;
                                alert(`ERRO DE REDE (${duration}ms):\n${e.message}\n\nPossíveis causas:\n1. Site bloqueado (AdBlock/VPN)\n2. Servidor fora do ar\n3. Erro de SSL`);
                            }
                        }}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm font-medium text-sm"
                    >
                        TESTAR (v2.34)
                    </button>
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium text-sm"
                    >
                        <Plus size={18} />
                        Novo Corretor
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">Nome</th>
                            <th className="px-6 py-4 font-medium">Contato</th>
                            <th className="px-6 py-4 font-medium">Localização</th>
                            <th className="px-6 py-4 font-medium text-center">Leads</th>
                            <th className="px-6 py-4 font-medium text-center">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : brokers.map((broker) => (
                            <tr key={broker.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {broker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{broker.name}</div>
                                            <div className="text-xs text-gray-500">ID: {broker.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-gray-400" /> {broker.email}
                                        </div>
                                        {broker.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400" /> {broker.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {broker.city && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" /> {broker.city}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {broker._count?.leads || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {broker.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(broker)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-blue-600 transition">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(broker.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && brokers.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Nenhum corretor encontrado. Adicione o primeiro!
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900">{editingBroker ? 'Editar Corretor' : 'Novo Corretor'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Nome Completo</label>
                                <input
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required placeholder="Ex: Ana Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required placeholder="ana@flowrealtors.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Telefone</label>
                                    <input
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+55 11..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Cidade</label>
                                    <input
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Ocala"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Estado</label>
                                    <select
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    >
                                        <option value="">UF</option>
                                        {US_STATES.map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Status</label>
                                <select
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                    value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition">Cancelar</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition shadow-sm">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}

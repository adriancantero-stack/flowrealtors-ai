import { useState, useEffect } from 'react';
import { Save, Bot, MessageCircle, Layout } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);

    // Should be split into specialized components in real app, but monolithic for speed as requested
    const [aiSettings, setAiSettings] = useState({ system_prompt: '' });
    const [whatsappSettings, setWhatsappSettings] = useState({
        api_token: '', phone_number_id: '', business_account_id: '', webhook_url: ''
    });
    const [saasSettings, setSaasSettings] = useState({
        platform_name: 'FlowRealtors', base_domain: '', logo_url: '', active_languages: ['pt']
    });

    useEffect(() => {
        // Load all settings
        fetch('/api/admin/settings').then(res => res.json()).then(setSaasSettings).catch(console.error);
        fetch('/api/ai/settings').then(res => res.json()).then(data => setAiSettings({ system_prompt: data.system_prompt || '' })).catch(console.error);
        fetch('/api/whatsapp/settings').then(res => res.json()).then(setWhatsappSettings).catch(console.error);
    }, []);

    const saveAI = async () => {
        setLoading(true);
        // Assuming we have an endpoint for partial update or reusing full settings endpoint
        await fetch('/api/ai/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aiSettings)
        });
        setLoading(false);
        alert('IA Configurações Salvas');
    };

    const saveWhatsApp = async () => {
        setLoading(true);
        await fetch('/api/whatsapp/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(whatsappSettings) });
        setLoading(false);
        alert('WhatsApp Configurações Salvas');
    };

    const saveSaaS = async () => {
        setLoading(true);
        await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saasSettings) });
        setLoading(false);
        alert('SaaS Configurações Salvas');
    };

    const testAI = async () => {
        const res = await fetch('/api/ai/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Teste rápido de IA' }) });
        const data = await res.json();
        alert(`Resposta: ${data.response}`);
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Configurações Globais</h1>
                <p className="text-sm text-gray-500 mt-1">Gerencie a inteligência e identidade da plataforma.</p>
            </div>

            {/* Block A: IA Global */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white">
                    <Bot className="text-blue-600" size={20} />
                    <h2 className="font-semibold text-gray-900">IA Global (Cérebro)</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prompt do Sistema (Personalidade)</label>
                        <textarea
                            className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition"
                            value={aiSettings.system_prompt}
                            onChange={(e) => setAiSettings({ ...aiSettings, system_prompt: e.target.value })}
                            placeholder="Defina como a IA deve se comportar..."
                        />
                        <p className="text-xs text-gray-400 mt-1">Este prompt controla todas as interações do robô no WhatsApp.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={saveAI} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm">
                            <Save size={16} /> Salvar IA
                        </button>
                        <button onClick={testAI} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                            <Bot size={16} /> Testar Resposta
                        </button>
                    </div>
                </div>
            </section>

            {/* Block B: WhatsApp */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-green-50 to-white">
                    <MessageCircle className="text-green-600" size={20} />
                    <h2 className="font-semibold text-gray-900">WhatsApp Business API</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Token de Acesso (Meta)</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                            value={whatsappSettings.api_token || ''}
                            onChange={(e) => setWhatsappSettings({ ...whatsappSettings, api_token: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                        <input
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                            value={whatsappSettings.phone_number_id || ''}
                            onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phone_number_id: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Account ID</label>
                        <input
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                            value={whatsappSettings.business_account_id || ''}
                            onChange={(e) => setWhatsappSettings({ ...whatsappSettings, business_account_id: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL (Read Only)</label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-gray-100 px-4 py-2 rounded border border-gray-200 text-gray-600 font-mono text-sm overflow-x-auto">
                                https://flowrealtors-ai-production.up.railway.app/api/whatsapp/webhooks/inbound
                            </code>
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-start">
                        <button onClick={saveWhatsApp} disabled={loading} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm">
                            <Save size={16} /> Salvar Credenciais
                        </button>
                    </div>
                </div>
            </section>

            {/* Block C: SaaS Settings */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-purple-50 to-white">
                    <Layout className="text-purple-600" size={20} />
                    <h2 className="font-semibold text-gray-900">Identidade do SaaS</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Plataforma</label>
                        <input
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                            value={saasSettings.platform_name || ''}
                            onChange={(e) => setSaasSettings({ ...saasSettings, platform_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domínio Base</label>
                        <input
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                            value={saasSettings.base_domain || ''}
                            onChange={(e) => setSaasSettings({ ...saasSettings, base_domain: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Idiomas Ativos</label>
                        <div className="flex gap-4">
                            {['en', 'pt', 'es'].map(lang => (
                                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={(saasSettings.active_languages || []).includes(lang)}
                                        onChange={(e) => {
                                            const langs = saasSettings.active_languages || [];
                                            const newLangs = e.target.checked ? [...langs, lang] : langs.filter(l => l !== lang);
                                            setSaasSettings({ ...saasSettings, active_languages: newLangs });
                                        }}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium uppercase">{lang}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-start">
                        <button onClick={saveSaaS} disabled={loading} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-sm">
                            <Save size={16} /> Salvar Identidade
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

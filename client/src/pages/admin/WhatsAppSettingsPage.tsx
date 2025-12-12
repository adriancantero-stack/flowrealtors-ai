import { useState, useEffect } from 'react';
import { Save, MessageSquare, RefreshCw, Send, Lock, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface WhatsAppSettings {
    provider: 'cloud-api' | '360dialog';
    api_token: string;
    phone_number_id: string;
    business_account_id: string;
    verify_token: string;
    webhook_url: string;
    enabled: boolean;
}

// Ensure we fallback to production if VITE_API_URL is missing OR empty string
const ENV_API = import.meta.env.VITE_API_URL;
const API_BASE = `${(ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app'}/api/whatsapp`;

export default function WhatsAppSettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<WhatsAppSettings>({
        provider: 'cloud-api',
        api_token: '',
        phone_number_id: '',
        business_account_id: '',
        verify_token: '',
        webhook_url: '',
        enabled: false
    });
    const [testPhone, setTestPhone] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'testing'>('idle');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/settings`);
            if (res.ok) setSettings(await res.json());
        } catch (e) { console.error('Failed to fetch settings'); }
    };

    const saveSettings = async () => {
        setStatus('saving');
        try {
            const res = await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to save (${res.status}): ${text}`);
            }

            alert(t('admin.whatsapp.saved'));
        } catch (e: any) {
            alert('Error saving settings: ' + e.message);
        } finally {
            setStatus('idle');
        }
    };

    const sendTestMessage = async () => {
        setStatus('testing');
        try {
            // Using /debug-test to avoid adblockers/filters on 'test'
            const res = await fetch(`${API_BASE}/debug-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: testPhone, message: 'FlowRealtors WhatsApp Test: Connection verified! 🚀' })
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('JSON Parse Error:', text);
                throw new Error(`Invalid Server Response (${res.status} ${res.statusText}): ${text.substring(0, 500)}...`);
            }

            if (res.ok) {
                alert('Test message sent successfully!');
            } else {
                alert('Failed to send: ' + (data.error || text));
            }
        } catch (e: any) {
            alert('Error sending test message: ' + (e.message || e));
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('admin.whatsapp.title')}</h2>
                    <p className="text-gray-500">{t('admin.whatsapp.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={saveSettings}
                        disabled={status === 'saving'}
                        className="flex items-center gap-2 bg-[#1786ff] text-white px-4 py-2 rounded-lg hover:bg-[#0070e0] transition"
                    >
                        <Save className="w-4 h-4" />
                        {status === 'saving' ? t('admin.common.saving') : t('admin.common.save')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Globe className="w-5 h-5 text-gray-600" />
                                {t('admin.whatsapp.provider_settings')}
                            </h3>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">{t('admin.whatsapp.enable_module')}</label>
                                <button
                                    onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.whatsapp.provider')}</label>
                                <select
                                    value={settings.provider}
                                    onChange={e => setSettings({ ...settings, provider: e.target.value as any })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1786ff]"
                                >
                                    <option value="cloud-api">WhatsApp Cloud API (Meta) - Recommended for Dev</option>
                                    <option value="360dialog">360dialog (Partner) - Production</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Token / Access Token</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={settings.api_token}
                                        onChange={e => setSettings({ ...settings, api_token: e.target.value })}
                                        className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#1786ff]"
                                        placeholder="Auth Token..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                                    <input
                                        type="text"
                                        value={settings.phone_number_id}
                                        onChange={e => setSettings({ ...settings, phone_number_id: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1786ff]"
                                        placeholder="e.g. 100609..."
                                    />
                                </div>
                                {settings.provider === 'cloud-api' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Account ID</label>
                                        <input
                                            type="text"
                                            value={settings.business_account_id}
                                            onChange={e => setSettings({ ...settings, business_account_id: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1786ff]"
                                            placeholder="e.g. 100778..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-gray-600" />
                            {t('admin.whatsapp.webhook_config')}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {t('admin.whatsapp.webhook_desc')}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Callback URL</label>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        type="text"
                                        value="https://your-server-url/api/whatsapp/webhooks/inbound"
                                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-500 select-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token</label>
                                <input
                                    type="text"
                                    value={settings.verify_token}
                                    onChange={e => setSettings({ ...settings, verify_token: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Panel */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            {t('admin.whatsapp.test_integration')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.whatsapp.test_number')}</label>
                                <input
                                    type="text"
                                    value={testPhone}
                                    onChange={e => setTestPhone(e.target.value)}
                                    placeholder="e.g. 15551234567"
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">{t('admin.whatsapp.test_note')}</p>
                            </div>
                            <button
                                onClick={sendTestMessage}
                                disabled={status === 'testing' || !settings.enabled}
                                className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {t('admin.whatsapp.send_test')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Debug Info */}
            <div className="text-xs text-gray-300 font-mono text-center mt-8">
                Backend: {API_BASE}
            </div>
        </div>
    );
}

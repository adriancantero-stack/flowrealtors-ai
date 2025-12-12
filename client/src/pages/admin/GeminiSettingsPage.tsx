import { useState, useEffect } from 'react';
import { Save, Play, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface AISettings {
    api_key: string;
    default_model: string;
    strong_model: string;
    temperature: number;
    max_tokens: number;
    system_prompt: string;
}

interface AILog {
    model: string;
    prompt_preview: string;
    response_preview: string;
    created_at: string;
}

const API_BASE = 'http://localhost:5001/api/ai'; // Adjust if environment var needed

export default function GeminiSettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<AISettings>({
        api_key: '',
        default_model: 'gemini-flash-latest',
        strong_model: 'gemini-pro-latest',
        temperature: 0.2,
        max_tokens: 600,
        system_prompt: ''
    });
    const [logs, setLogs] = useState<AILog[]>([]);
    const [testPrompt, setTestPrompt] = useState('');
    const [testResult, setTestResult] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'testing'>('idle');

    useEffect(() => {
        fetchSettings();
        fetchLogs();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/settings`);
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (e) {
            console.error('Failed to fetch settings');
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_BASE}/logs`);
            if (res.ok) setLogs(await res.json());
        } catch (e) { console.error('Failed to fetch logs'); }
    };

    const saveSettings = async () => {
        setStatus('saving');
        try {
            await fetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert(t('admin.gemini.save'));
        } catch (e) {
            alert('Error saving settings');
        } finally {
            setStatus('idle');
        }
    };

    const runTest = async () => {
        setStatus('testing');
        setTestResult('');
        try {
            const promptToSend = testPrompt.trim() || t('admin.gemini.test_prompt_placeholder_text');
            const res = await fetch(`${API_BASE}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptToSend, model: settings.default_model })
            });
            const data = await res.json();
            setTestResult(data.response || data.error);
            fetchLogs(); // Update logs
        } catch (e) {
            setTestResult('Error running test');
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('admin.gemini.title')}</h2>
                    <p className="text-gray-500">{t('admin.gemini.subtitle')}</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={status === 'saving'}
                    className="flex items-center gap-2 bg-[#1786ff] text-white px-4 py-2 rounded-lg hover:bg-[#0070e0] transition"
                >
                    <Save className="w-4 h-4" />
                    {status === 'saving' ? t('admin.gemini.saving') : t('admin.gemini.save')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            {t('admin.gemini.provider_config')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gemini.api_key')}</label>
                                <input
                                    type="password"
                                    value={settings.api_key}
                                    onChange={e => setSettings({ ...settings, api_key: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1786ff] font-mono"
                                    placeholder="AIzaSy..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gemini.default_model')}</label>
                                    <input
                                        type="text"
                                        value={settings.default_model}
                                        onChange={e => setSettings({ ...settings, default_model: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">{t('admin.gemini.model_desc_fast')}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gemini.strong_model')}</label>
                                    <input
                                        type="text"
                                        value={settings.strong_model}
                                        onChange={e => setSettings({ ...settings, strong_model: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">{t('admin.gemini.model_desc_strong')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gemini.temperature')}</label>
                                    <input
                                        type="number" step="0.1" min="0" max="1"
                                        value={settings.temperature}
                                        onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gemini.max_tokens')}</label>
                                    <input
                                        type="number"
                                        value={settings.max_tokens}
                                        onChange={e => setSettings({ ...settings, max_tokens: parseInt(e.target.value) })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gemini.system_prompt')}</label>
                                <textarea
                                    value={settings.system_prompt}
                                    onChange={e => setSettings({ ...settings, system_prompt: e.target.value })}
                                    rows={6}
                                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            Activity Logs (Last 20)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Time</th>
                                        <th className="px-4 py-2 text-left">Model</th>
                                        <th className="px-4 py-2 text-left">Prompt Preview</th>
                                        <th className="px-4 py-2 text-left">Response</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {logs.map((log, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </td>
                                            <td className="px-4 py-2 text-gray-500">{log.model}</td>
                                            <td className="px-4 py-2 truncate max-w-xs" title={log.prompt_preview}>{log.prompt_preview}</td>
                                            <td className="px-4 py-2 truncate max-w-xs text-gray-500" title={log.response_preview}>{log.response_preview}</td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">No logs found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Testing */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Play className="w-5 h-5 text-blue-600" />
                            {t('admin.gemini.test_connection')}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.gemini.test_prompt')}</label>
                                <textarea
                                    value={testPrompt}
                                    onChange={e => setTestPrompt(e.target.value)}
                                    placeholder={t('admin.gemini.test_prompt_placeholder_text')}
                                    rows={4}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <button
                                onClick={runTest}
                                disabled={status === 'testing' || !settings.api_key}
                                className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {t('admin.gemini.send_test')}
                            </button>

                            {testResult && (
                                <div className={`p-4 rounded-lg text-sm ${testResult.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>
                                    <strong>{t('admin.gemini.result_label')}</strong>
                                    <p className="mt-1 whitespace-pre-wrap">{testResult}</p>
                                </div>
                            )}

                            {!settings.api_key && (
                                <div className="flex items-start gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                                    <span>{t('admin.gemini.api_warning')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Phone, Mail, MessageSquare,
    Send, Sparkles, ArrowLeft, Save
} from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function LeadDetailsPage() {
    const { t } = useTranslation();
    const { slug, id, lang } = useParams();

    // State
    const [lead, setLead] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!slug || !id) return;
        fetchLeadData();
    }, [slug, id]);

    const fetchLeadData = async () => {
        try {
            setLoading(true);
            let ENV_API = import.meta.env.VITE_API_URL;
            if (ENV_API && !ENV_API.startsWith('http')) {
                ENV_API = `https://${ENV_API}`;
            }
            const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

            const [leadRes, msgsRes] = await Promise.all([
                fetch(`${API_BASE}/api/realtors/${slug}/leads/${id}`),
                fetch(`${API_BASE}/api/realtors/${slug}/leads/${id}/messages`)
            ]);

            if (leadRes.ok) {
                const leadData = await leadRes.json();
                setLead(leadData);
                setNotes(leadData.notes || '');
                setStatus(leadData.status || 'New');
            } else {
                const errText = await leadRes.text();
                setErrorMsg(`Failed to load lead: ${leadRes.status} ${leadRes.statusText} - ${errText}`);
            }

            if (msgsRes.ok) {
                const msgsData = await msgsRes.json();
                setMessages(msgsData);
            }

        } catch (error) {
            console.error('Error fetching lead details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!lead) return;
        setSaving(true);
        try {
            let ENV_API = import.meta.env.VITE_API_URL;
            if (ENV_API && !ENV_API.startsWith('http')) {
                ENV_API = `https://${ENV_API}`;
            }
            const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

            const res = await fetch(`${API_BASE}/api/realtors/${slug}/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notes,
                    status
                })
            });

            if (res.ok) {
                const updated = await res.json();
                setLead(updated);
                // Simple feedback (could use toast in future)
                alert(t('lead_details.saved'));
            }
        } catch (error) {
            console.error('Error saving lead:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-8 text-center text-gray-500">
                <h2 className="text-xl font-bold mb-2">Oops!</h2>
                <p className="text-red-500 font-mono mb-4">{errorMsg || 'Lead not found (Unknown Error)'}</p>
                <Link to={`/${lang}/${slug}/leads`} className="text-blue-500 underline">
                    Back to Leads
                </Link>
            </div>
        );
    }

    // Attempt to parse AI insights from intent or notes if structured
    // For now, we use placeholders if data is missing, until AI service populates real fields
    const aiData = {
        intent: lead.intent || 'Unknown',
        budget: lead.budget || '-',
        timeline: lead.timeline || '-', // Schema field pending? Actually only budget/city in schema.
        city: lead.desired_city || '-',
        urgency: 'medium' // Calculated field in future
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
            {/* LEFT COLUMN: Lead Profile */}
            <div className="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto">
                {/* Back Link */}
                <Link to={`/${lang}/${slug}/leads`} className="flex items-center text-gray-500 hover:text-gray-900 text-sm mb-[-1rem]">
                    <ArrowLeft className="h-4 w-4 mr-1" /> {t('lead_details.back')}
                </Link>

                {/* Profile Card */}
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mr-4 border border-blue-200">
                                {lead.name ? lead.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '?'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{lead.name || 'Unknown'}</h2>
                                <select
                                    className="mt-1 block w-full pl-2 pr-8 py-1 text-xs border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-gray-50"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="New">New</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Hot">Hot</option>
                                    <option value="In Qualification">In Qualification</option>
                                    <option value="Not Interested">Not Interested</option>
                                </select>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600" onClick={handleSave}>
                            {saving ? <span className="text-xs">{t('lead_details.saving')}</span> : <Save className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-3" />
                            <span className="text-sm">{lead.email || '-'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-3" />
                            <span className="text-sm">{lead.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MessageSquare className="h-4 w-4 mr-3" />
                            <span className="text-sm">{lead.source}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{t('lead_details.qualification_score')}</span>
                            <span className="text-sm font-bold text-gray-900">{lead.score || 0}/100</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${lead.score > 80 ? 'bg-green-500' : lead.score > 50 ? 'bg-yellow-500' : 'bg-gray-400'}`}
                                style={{ width: `${lead.score || 0}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('lead_details.notes')}</label>
                        <textarea
                            className="w-full shadow-sm text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary p-2 bg-gray-50"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <button
                            onClick={handleSave}
                            className="mt-2 w-full btn btn-secondary text-xs"
                            disabled={saving}
                        >
                            {saving ? t('lead_details.saving') : t('lead_details.save_notes')}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Timeline & AI (60%) */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">

                {/* AI Insights Panel (Placeholder logic for now) */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-100 p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{t('lead_details.ai_summary')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('lead_details.intent')}</p>
                            <p className="font-medium text-gray-900 mt-1">{aiData.intent}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('lead_details.budget')}</p>
                            <p className="font-medium text-gray-900 mt-1">{aiData.budget}</p>
                        </div>
                        <div className="bg-white/60 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</p>
                            <p className="font-medium text-gray-900 mt-1">{aiData.city}</p>
                        </div>

                        {/* Placeholder for Next Action */}
                        <div className="bg-white/60 p-3 rounded-lg border-l-4 border-blue-500">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('lead_details.recommended_action')}</p>
                            <p className="font-medium text-blue-900 mt-1">Review notes and contact.</p>
                        </div>
                    </div>
                </div>

                {/* Conversation Timeline */}
                <div className="flex-1 bg-white rounded-xl border shadow-sm flex flex-col min-h-[400px] overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">{t('lead_details.chat_history')}</h3>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 mt-10">
                                {t('lead_details.empty_chat')}
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
                                    : 'bg-primary text-white rounded-tr-sm'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <div className={`mt-2 flex items-center text-xs ${msg.role === 'user' ? 'text-gray-400' : 'text-blue-100'}`}>
                                        <span className="capitalize mr-2">{msg.role === 'user' ? 'Lead' : 'AI Agent'}</span>
                                        <span>• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Box (Placeholder) */}
                    <div className="p-4 border-t bg-white">
                        <div className="relative opacity-50 pointer-events-none mb-2">
                            <input
                                type="text"
                                disabled
                                placeholder="Reply coming soon..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-400 text-white rounded-lg">
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        {/* Dev Tool */}
                        <div className="text-center">
                            <button
                                onClick={async () => {
                                    const text = prompt('Dev: Enter mock incoming message (simulates WhatsApp):');
                                    if (!text) return;
                                    try {
                                        let ENV_API = import.meta.env.VITE_API_URL;
                                        if (ENV_API && !ENV_API.startsWith('http')) ENV_API = `https://${ENV_API}`;
                                        const API_BASE = (ENV_API && ENV_API !== '') ? ENV_API : 'https://flowrealtors-ai-production.up.railway.app';

                                        await fetch(`${API_BASE}/api/dev/leads/${id}/mock-message`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ text, sender: 'lead', direction: 'inbound' })
                                        });
                                        // Refresh
                                        fetchLeadData();
                                    } catch (e) { alert('Err: ' + e); }
                                }}
                                className="text-xs text-gray-300 hover:text-red-500 underline"
                            >
                                [Dev] Simulate WhatsApp Message
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

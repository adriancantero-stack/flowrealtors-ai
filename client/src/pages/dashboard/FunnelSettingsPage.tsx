import { useState, useEffect } from 'react';
import { Save, Eye, Video, Type, Layout, ExternalLink } from 'lucide-react';

let API_BASE = import.meta.env.VITE_API_URL || 'https://flowrealtors-ai-production.up.railway.app';
if (API_BASE && !API_BASE.startsWith('http')) {
    API_BASE = `https://${API_BASE}`;
}

export default function FunnelSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null); // To get slug
    const [settings, setSettings] = useState({
        hero_headline: '',
        hero_subheadline: '',
        vsl_url: '',
        cta_text: 'Agendar Sesión',
        primary_color: '#0A84FF',
        calendly_url: '',
        show_reviews: false
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Get User Profile for ID and Slug
            const profileRes = await fetch(`${API_BASE}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('flow_realtor_token')}` }
            });
            const profile = await profileRes.json();
            setUser(profile);

            // Get Funnel Settings
            const settingsRes = await fetch(`${API_BASE}/api/funnel/settings/${profile.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('flow_realtor_token')}` }
            });
            const settingsData = await settingsRes.json();
            if (settingsData && !settingsData.error) {
                setSettings(prev => ({ ...prev, ...settingsData }));
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await fetch(`${API_BASE}/api/funnel/settings/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('flow_realtor_token')}`
                },
                body: JSON.stringify(settings)
            });
            alert('Settings Saved!');
        } catch (error) {
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    const publicUrl = user ? `${window.location.origin}/${user.default_lang || 'en'}/${user.slug}` : '#';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Landing Page Builder</h1>
                    <p className="text-gray-500">Customize your public VSL page to convert leads.</p>
                </div>
                <div className="flex gap-2">
                    <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn-outline flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Preview Live
                    </a>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT COLUMN - EDITOR */}
                <div className="md:col-span-2 space-y-6">

                    {/* HERO SECTION */}
                    <div className="card space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Type className="w-5 h-5 text-blue-500" /> Hero Section
                        </h2>
                        <div>
                            <label className="label">Headline</label>
                            <input name="hero_headline" value={settings.hero_headline} onChange={handleChange} className="input font-bold text-lg" placeholder="e.g. Compra tu casa en Florida" />
                        </div>
                        <div>
                            <label className="label">Subheadline</label>
                            <textarea name="hero_subheadline" value={settings.hero_subheadline} onChange={handleChange} className="textarea h-20" placeholder="e.g. Asesoría experta para latinos..." />
                        </div>
                        <div>
                            <label className="label">CTA Button Text</label>
                            <input name="cta_text" value={settings.cta_text} onChange={handleChange} className="input" placeholder="e.g. Agendar Sesión" />
                        </div>
                    </div>

                    {/* VSL SECTION */}
                    <div className="card space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Video className="w-5 h-5 text-red-500" /> VSL (Video Sales Letter)
                        </h2>
                        <div>
                            <label className="label">Video URL (YouTube / Vimeo)</label>
                            <input name="vsl_url" value={settings.vsl_url || ''} onChange={handleChange} className="input" placeholder="https://www.youtube.com/watch?v=..." />
                            <p className="text-xs text-gray-500 mt-1">Paste the full URL. We will handle the embedding.</p>
                        </div>
                        {settings.vsl_url && (
                            <div className="bg-black aspect-video rounded-lg overflow-hidden">
                                <iframe
                                    src={settings.vsl_url.replace('watch?v=', 'embed/')}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>

                    {/* SETTINGS */}
                    <div className="card space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Layout className="w-5 h-5 text-gray-500" /> Page Settings
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Primary Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" name="primary_color" value={settings.primary_color} onChange={handleChange} className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer" />
                                    <input name="primary_color" value={settings.primary_color} onChange={handleChange} className="input flex-1" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Calendly URL Override</label>
                                <input name="calendly_url" value={settings.calendly_url || ''} onChange={handleChange} className="input" placeholder="Optional" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - TIPS */}
                <div className="space-y-6">
                    {/* STATUS CARD */}
                    <div className="card bg-blue-50 border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">Your Public Link</h3>
                        <div className="bg-white p-3 rounded border border-blue-200 text-sm overflow-hidden text-ellipsis whitespace-nowrap text-gray-600 mb-2">
                            {publicUrl}
                        </div>
                        <a href={publicUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                            Test Link in new tab <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="card">
                        <h3 className="font-bold mb-4">Tips for High Conversion</h3>
                        <ul className="space-y-3 text-sm text-gray-600 list-disc pl-4">
                            <li>Keep your <b>Headline</b> clear and benefit-driven.</li>
                            <li>Your <b>VSL</b> should be 3-10 minutes long, explaining your process.</li>
                            <li>Use a high-quality <b>photo</b> in your profile settings.</li>
                            <li>Test your link on <b>mobile</b> before running ads.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Save, Eye, Video, Type, Layout, FileText, Globe } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';

let API_BASE = import.meta.env.VITE_API_URL || 'https://flowrealtors-ai-production.up.railway.app';
if (API_BASE && !API_BASE.startsWith('http')) {
    API_BASE = `https://${API_BASE}`;
}

export default function FunnelSettingsPage() {
    const { t } = useTranslation();
    const { lang } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'landing' | 'form'>('landing');

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
            const profileRes = await fetch(`${API_BASE}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('flow_realtor_token')}` }
            });
            const profile = await profileRes.json();
            setUser(profile);

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
            alert(t('settings.save') + '!'); // Reusing generic save or simple alert
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

    // Use current route language, fallback to user default, then to 'en'
    const currentLang = lang || user?.default_lang || 'en';
    const publicUrl = user ? `${window.location.origin}/${currentLang}/${user.slug}` : '#';

    return (
        <div className="max-w-6xl mx-auto space-y-6 mb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('funnel_builder.title')}</h1>
                    <p className="text-gray-500">{t('funnel_builder.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn-outline flex items-center gap-2">
                        <Eye className="w-4 h-4" /> {t('funnel_builder.preview')}
                    </a>
                    <button onClick={handleSave} disabled={saving} className="btn btn-primary flex items-center gap-2">
                        <Save className="w-4 h-4" /> {saving ? t('funnel_builder.saving') : t('funnel_builder.save')}
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('landing')}
                        className={`${activeTab === 'landing'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <Layout className="w-4 h-4" />
                        {t('funnel_builder.tab.landing')}
                    </button>
                    <button
                        onClick={() => setActiveTab('form')}
                        className={`${activeTab === 'form'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <FileText className="w-4 h-4" />
                        {t('funnel_builder.tab.form')}
                    </button>
                </nav>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT COLUMN - MAIN EDITOR */}
                <div className="md:col-span-2 space-y-6">

                    {activeTab === 'landing' ? (
                        <>
                            {/* HERO SECTION */}
                            <div className="card space-y-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Type className="w-5 h-5 text-blue-500" /> {t('funnel_builder.section.hero')}
                                </h2>
                                <div>
                                    <label className="label">{t('funnel_builder.field.headline')}</label>
                                    <input name="hero_headline" value={settings.hero_headline} onChange={handleChange} className="input font-bold text-lg" placeholder={t('funnel_builder.example.headline')} />
                                </div>
                                <div>
                                    <label className="label">{t('funnel_builder.field.subheadline')}</label>
                                    <textarea name="hero_subheadline" value={settings.hero_subheadline} onChange={handleChange} className="textarea h-20" placeholder={t('funnel_builder.example.subheadline')} />
                                </div>
                                <div>
                                    <label className="label">{t('funnel_builder.field.cta')}</label>
                                    <input name="cta_text" value={settings.cta_text} onChange={handleChange} className="input" placeholder={t('funnel_builder.example.cta')} />
                                </div>
                            </div>

                            {/* VSL SECTION */}
                            <div className="card space-y-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Video className="w-5 h-5 text-red-500" /> {t('funnel_builder.section.vsl')}
                                </h2>
                                <div>
                                    <label className="label">{t('funnel_builder.field.video_url')}</label>
                                    <input name="vsl_url" value={settings.vsl_url || ''} onChange={handleChange} className="input" placeholder="https://www.youtube.com/watch?v=..." />
                                    <p className="text-xs text-gray-500 mt-1">{t('funnel_builder.field.video_help')}</p>
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
                                    <Layout className="w-5 h-5 text-gray-500" /> {t('funnel_builder.section.settings')}
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">{t('funnel_builder.field.primary_color')}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" name="primary_color" value={settings.primary_color} onChange={handleChange} className="h-10 w-10 p-0 border-0 rounded overflow-hidden cursor-pointer" />
                                            <input name="primary_color" value={settings.primary_color} onChange={handleChange} className="input flex-1" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">{t('funnel_builder.field.calendly_override')}</label>
                                        <input name="calendly_url" value={settings.calendly_url || ''} onChange={handleChange} className="input" placeholder={t('funnel_builder.placeholder.optional')} />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // FORM BUILDER PLACEHOLDER
                        <div className="card py-12 text-center space-y-4 border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{t('funnel_builder.placeholder.form_title')}</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">
                                    {t('funnel_builder.placeholder.form_desc')}
                                </p>
                            </div>
                            <div className="pt-4">
                                <p className="text-sm font-medium text-gray-400">{t('funnel_builder.placeholder.waiting')}</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT COLUMN - PREVIEW/TIPS */}
                <div className="space-y-6">
                    {/* PUBLIC LINKS */}
                    <div className="card bg-blue-50 border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> {t('funnel_builder.sidebar.public_links')}
                        </h3>
                        <div className="space-y-2">
                            {['en', 'es', 'pt'].map(langOption => (
                                <div key={langOption} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-blue-200">
                                    <span className="font-mono text-gray-500 uppercase w-6">{langOption}</span>
                                    <a href={`${window.location.origin}/${langOption}/${user?.slug}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate flex-1 ml-2">
                                        .../{langOption}/{user?.slug}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FORM LINK SPECFIC (Only show on Form Tab) */}
                    {activeTab === 'form' && (
                        <div className="card bg-purple-50 border-purple-100">
                            <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> {t('funnel_builder.sidebar.form_link')}
                            </h3>
                            <div className="flex justify-between items-center text-xs bg-white p-2 rounded border border-purple-200">
                                <span className="font-mono text-gray-500 uppercase w-6">URL</span>
                                <a href={`${window.location.origin}/${currentLang}/${user?.slug}/apply`} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline truncate flex-1 ml-2">
                                    .../{currentLang}/{user?.slug}/apply
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <h3 className="font-bold mb-4">{t('funnel_builder.sidebar.tips_title')}</h3>
                        <ul className="space-y-3 text-sm text-gray-600 list-disc pl-4">
                            <li>{t('funnel_builder.sidebar.tip1')}</li>
                            <li>{t('funnel_builder.sidebar.tip2')}</li>
                            <li>{t('funnel_builder.sidebar.tip3')}</li>
                            <li>{t('funnel_builder.sidebar.tip4')}</li>
                            {activeTab === 'form' && (
                                <li>{t('funnel_builder.sidebar.tip5')}</li>
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

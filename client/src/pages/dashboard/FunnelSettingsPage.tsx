import { useState, useEffect } from 'react';
import { Save, ExternalLink } from 'lucide-react';

export default function FunnelSettingsPage() {
    const userId = "user_123"; // Mock User ID
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:3000/api/funnel/settings/${userId}`)
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            });
    }, []);

    const handleChange = (field: string, value: any) => {
        setSettings({ ...settings, [field]: value });
    };

    const handleSave = async () => {
        setSaving(true);
        await fetch(`http://localhost:3000/api/funnel/settings/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        setSaving(false);
        alert("Funnel settings saved!");
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lead Funnel Builder</h1>
                    <p className="text-gray-500">Customize your public landing page to capture more leads.</p>
                </div>
                <div className="flex gap-2">
                    <a
                        href={`/f/${settings.funnel_slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <ExternalLink className="w-4 h-4" /> View Live Funnel
                    </a>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Branding Section */}
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Branding & Profile</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline (Who are you?)</label>
                        <input
                            className="w-full p-2 border rounded-md text-sm"
                            value={settings.realtor_headline}
                            onChange={(e) => handleChange('realtor_headline', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                        <textarea
                            className="w-full p-2 border rounded-md text-sm h-20"
                            value={settings.realtor_bio_short}
                            onChange={(e) => handleChange('realtor_bio_short', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color (Hex)</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                className="h-9 w-9 p-0 border rounded-md overflow-hidden cursor-pointer"
                                value={settings.brand_color}
                                onChange={(e) => handleChange('brand_color', e.target.value)}
                            />
                            <input
                                className="flex-1 p-2 border rounded-md text-sm uppercase"
                                value={settings.brand_color}
                                onChange={(e) => handleChange('brand_color', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
                        <input
                            className="w-full p-2 border rounded-md text-sm"
                            value={settings.profile_photo_url || ''}
                            onChange={(e) => handleChange('profile_photo_url', e.target.value)}
                        />
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Landing Page Hero</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                        <input
                            className="w-full p-2 border rounded-md text-sm font-bold"
                            value={settings.hero_title}
                            onChange={(e) => handleChange('hero_title', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                        <textarea
                            className="w-full p-2 border rounded-md text-sm h-20"
                            value={settings.hero_subtitle}
                            onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Area</label>
                        <input
                            className="w-full p-2 border rounded-md text-sm"
                            value={settings.target_area}
                            onChange={(e) => handleChange('target_area', e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">E.g., "Miami, Fort Lauderdale, Brickell"</p>
                    </div>
                </div>

                {/* Logistics */}
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Funnel Logistics</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Funnel Slug (URL)</label>
                        <div className="flex items-center">
                            <span className="text-gray-400 text-sm mr-1">flowrealtor.ai/f/</span>
                            <input
                                className="flex-1 p-2 border rounded-md text-sm font-mono text-gray-600"
                                value={settings.funnel_slug}
                                onChange={(e) => handleChange('funnel_slug', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Calendly Link</label>
                        <input
                            className="w-full p-2 border rounded-md text-sm"
                            value={settings.calendly_url}
                            onChange={(e) => handleChange('calendly_url', e.target.value)}
                            placeholder="https://calendly.com/your-link"
                        />
                        <p className="text-xs text-gray-400 mt-1">Where leads will be redirected after submitting the form.</p>
                    </div>
                </div>

                {/* Preview Card */}
                <div className="bg-gray-50 rounded-xl border p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-white p-4 shadow-sm rounded-full">
                        <img
                            src={settings.profile_photo_url || "https://via.placeholder.com/150"}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">{settings.realtor_headline}</h4>
                        <p className="text-sm text-gray-500 mt-1">{settings.target_area}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Save, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { Language } from '../../i18n/locales';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
    const { t, language, setLanguage } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        id: 0,
        name: '', email: '', phone: '', city: '', state: '',
        slug: '', photo_url: ''
    });

    useEffect(() => {
        console.log('Fetching profile...');
        fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('flow_realtor_token')}` }
        })
            .then(res => res.json())
            .then(data => {
                console.log('Profile fetched:', data);
                if (data && !data.error) {
                    setProfile(prev => ({ ...prev, ...data }));
                } else {
                    console.error('Profile fetch error:', data);
                }
            })
            .catch(err => console.error('Fetch failed:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: any) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        console.log('Saving profile:', profile);
        try {
            const res = await fetch(`${API_BASE}/api/auth/profile/${profile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('flow_realtor_token')}`
                },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            console.log('Save response:', data);

            if (res.ok) {
                alert('Settings Saved');
            } else {
                alert('Error saving: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Save exception:', error);
            alert('Error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-500 mb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : t('settings.save')}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* Profile Settings (NEW) */}
                <div className="card">
                    <Section title="Profile Information" description="Update your personal details for your public page.">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <img src={profile.photo_url ? (profile.photo_url.startsWith('http') ? profile.photo_url : API_BASE + profile.photo_url) : 'https://via.placeholder.com/100'} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const formData = new FormData();
                                                formData.append('file', file);

                                                try {
                                                    const res = await fetch(`${API_BASE}/api/upload`, {
                                                        method: 'POST',
                                                        body: formData
                                                    });
                                                    const data = await res.json();
                                                    if (data.url) {
                                                        setProfile(prev => ({ ...prev, photo_url: data.url }));
                                                    }
                                                } catch (err) {
                                                    console.error('Upload failed', err);
                                                    alert('Failed to upload image');
                                                }
                                            }}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Current: {profile.photo_url || 'None'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} />
                                <Input label="Email" value={profile.email} disabled className="bg-gray-100" />
                                <Input label="Phone (WhatsApp)" name="phone" value={profile.phone || ''} onChange={handleChange} placeholder="+1 ..." />
                                <Input label="Slug (URL Identifier)" name="slug" value={profile.slug || ''} onChange={handleChange} placeholder="adrian-realtor" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="City" name="city" value={profile.city || ''} onChange={handleChange} />
                                <Input label="State" name="state" value={profile.state || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Language Settings */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-500" />
                        {t('settings.language')}
                    </h2>
                    <div className="max-w-sm">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="select"
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="pt">Português (Brasil)</option>
                        </select>
                    </div>
                </div>

                <div className="card">
                    <Section title={t('settings.integrations')} description={t('settings.integrations_desc')}>
                        <form className="space-y-4">
                            <Input label="WhatsApp API Key (360dialog/Gupshup)" placeholder="wa_..." />
                            <Input label="Meta Access Token" type="password" placeholder="EAA..." />
                        </form>
                    </Section>
                </div>
            </div >
        </div >
    );
}

function Section({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            {children}
        </div>
    );
}

function Input({ label, className, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="label">{label}</label>
            <input
                className={`input ${className || ''}`}
                {...props}
            />
        </div>
    );
}

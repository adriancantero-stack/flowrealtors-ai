import { useState } from 'react';
import { Save, Globe } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { Language } from '../../i18n/locales';

export default function SettingsPage() {
    const { t, language, setLanguage } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
                <button
                    onClick={handleSave} // Simplified for this context, normally form submit
                    disabled={isSaving}
                    className="btn btn-primary"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : t('settings.save')}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">

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
                    <Section title="Integrations" description="Connect your external platforms.">
                        <form onSubmit={handleSave} className="space-y-4">
                            <Input label="WhatsApp API Key (360dialog/Gupshup)" placeholder="wa_..." />
                            <Input label="Meta Access Token (Facebook/Instagram)" type="password" placeholder="EAA..." />
                            <Input label="TikTok Access Token" type="password" placeholder="tk_..." />
                        </form>
                    </Section>
                </div>

                <div className="card">
                    <Section title="AI Configuration" description="Customize your AI agent persona.">
                        <div className="space-y-4">
                            <div>
                                <label className="label">Agent Tone</label>
                                <select className="select">
                                    <option>Professional & Formal</option>
                                    <option>Friendly & Casual</option>
                                    <option>Aggressive Sales</option>
                                </select>
                            </div>
                            <Input label="Business Name for AI" placeholder="e.g. Dream Homes Realty" />
                        </div>
                    </Section>
                </div>

                <div className="card">
                    <Section title="Profile & Billing" description="Manage your subscription.">
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
                                <div>
                                    <p className="font-bold text-blue-900">Pro Plan</p>
                                    <p className="text-sm text-blue-700">$99/month</p>
                                </div>
                                <button className="text-sm font-medium text-blue-700 hover:text-blue-900 underline">Manage</button>
                            </div>
                            <Input label="Account Email" defaultValue="realtor@example.com" disabled />
                        </div>
                    </Section>
                </div>

                <div className="card">
                    <Section title="Onboarding & Setup" description="Configure your initial settings.">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Setup Wizard</p>
                                <p className="text-sm text-gray-500">Run the initial setup to configure your profile and funnels.</p>
                            </div>
                            <a
                                href="/onboarding"
                                className="btn btn-secondary"
                            >
                                {t('settings.restart_onboarding')}
                            </a>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
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

import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';
import confetti from 'canvas-confetti';
import { useTranslation } from '../../../i18n';

export default function StepAutomations({ onFinish, onBack }: { onFinish: () => void, onBack: () => void }) {
    const { t } = useTranslation();
    const userId = "user_123";
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [funnelSlug, setFunnelSlug] = useState('');

    useEffect(() => {
        // Load Automation Settings
        fetch(`http://localhost:3000/api/automation/settings/${userId}`)
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            });

        // Get slug
        fetch(`http://localhost:3000/api/funnel/settings/${userId}`)
            .then(res => res.json())
            .then(data => setFunnelSlug(data.funnel_slug));
    }, []);

    const toggle = (key: string) => {
        setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFinish = async () => {
        // Save automations
        await fetch(`http://localhost:3000/api/automation/settings/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            onFinish();
        }, 1000);
    };

    const copyLink = () => {
        const url = `https://flowrealtor.ai/f/${funnelSlug}`;
        navigator.clipboard.writeText(url);
        alert('Copied to clipboard!');
    };

    if (loading) return <div>Loading...</div>;

    const automations = [
        { key: 'welcome_enabled', label: t('onboarding.automations.welcome.label'), desc: t('onboarding.automations.welcome.desc') },
        { key: 'pre_call_enabled', label: t('onboarding.automations.pre_call.label'), desc: t('onboarding.automations.pre_call.desc') },
        { key: 'reminder_enabled', label: t('onboarding.automations.reminder.label'), desc: t('onboarding.automations.reminder.desc') },
        { key: 'reactivation_enabled', label: t('onboarding.automations.reactivation.label'), desc: t('onboarding.automations.reactivation.desc') }
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 font-sans">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">{t('onboarding.step3.title')}</h2>
                <p className="text-gray-500 mt-2">{t('onboarding.step3.subtitle')}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 divide-y checkbox-group">
                {automations.map((item) => (
                    <div key={item.key} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div>
                            <h4 className="font-medium text-gray-900">{item.label}</h4>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => toggle(item.key)}
                            className={cn(
                                "w-11 h-6 rounded-full transition-colors relative",
                                settings[item.key] ? "bg-green-500" : "bg-gray-200"
                            )}
                        >
                            <span className={cn(
                                "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                                settings[item.key] ? "translate-x-5" : "translate-x-0"
                            )} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-center">
                <h3 className="font-semibold text-blue-900">{t('onboarding.step3.ready_title')}</h3>
                <div className="mt-3 flex items-center justify-center gap-2">
                    <code className="bg-white px-3 py-2 rounded-lg border text-sm text-gray-600">
                        flowrealtor.ai/f/{funnelSlug}
                    </code>
                    <button onClick={copyLink} className="p-2 hover:bg-blue-100 rounded-lg text-blue-700">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    onClick={onBack}
                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                    {t('onboarding.back')}
                </button>
                <button
                    onClick={handleFinish}
                    className="flex-[2] py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg transform hover:scale-[1.02]"
                >
                    {t('onboarding.finish')}
                </button>
            </div>
        </div>
    );
}

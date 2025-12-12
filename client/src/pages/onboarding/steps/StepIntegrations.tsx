import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function StepIntegrations({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
    const { t } = useTranslation();
    const [calendlyUrl, setCalendlyUrl] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    const userId = "user_123";

    useEffect(() => {
        fetch(`http://localhost:3000/api/funnel/settings/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.calendly_url) setCalendlyUrl(data.calendly_url);
            });
    }, []);

    const handleSave = async () => {
        if (!calendlyUrl) {
            alert("Please enter a calendar URL (it's important for conversion!)");
            return;
        }

        // Save Calendar
        await fetch(`http://localhost:3000/api/funnel/settings/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ calendly_url: calendlyUrl })
        });

        // Mock save whatsapp
        console.log("Saved WhatsApp:", whatsappNumber);

        onNext();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 font-sans">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">{t('onboarding.step2.title')}</h2>
                <p className="text-gray-500 mt-2">{t('onboarding.step2.subtitle')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{t('onboarding.step2.calendar_title')}</h3>
                        <p className="text-sm text-gray-500 mb-3">{t('onboarding.step2.calendar_desc')}</p>
                        <input
                            placeholder="https://calendly.com/your-name/strategy"
                            className="w-full p-3 border rounded-lg text-sm"
                            value={calendlyUrl}
                            onChange={e => setCalendlyUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">Works with Calendly, Google Calendar, or any booking link.</p>
                    </div>
                </div>

                <div className="border-t pt-6 flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{t('onboarding.step2.whatsapp_title')}</h3>
                        <p className="text-sm text-gray-500 mb-3">{t('onboarding.step2.whatsapp_desc')}</p>
                        <input
                            placeholder="+1 555 000 0000"
                            className="w-full p-3 border rounded-lg text-sm"
                            value={whatsappNumber}
                            onChange={e => setWhatsappNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Later you can connect the official WhatsApp Business API for automated blasting.
                        </p>
                    </div>
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
                    onClick={handleSave}
                    className="flex-[2] py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    {t('onboarding.next')} <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

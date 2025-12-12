import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Calendar } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { Language } from '../../i18n/locales';

export default function FunnelThankYouPage() {
    const { slug } = useParams();
    const { t, setLanguage } = useTranslation();
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch(`http://localhost:3000/api/funnel/public/${slug}`)
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                if (data.primary_language) {
                    setLanguage(data.primary_language as Language);
                }
            });
    }, [slug, setLanguage]);

    if (!settings) return null;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500 font-sans">
            <div className="text-center max-w-2xl space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
                    {t('funnel.thankyou.title')}
                </h1>

                <p className="text-xl text-gray-500">
                    {t('funnel.thankyou.subtitle', { realtor_name: settings.realtor_headline })}
                </p>

                <div className="mt-12 bg-gray-50 border rounded-2xl p-8">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Calendar className="w-6 h-6 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t('funnel.thankyou.button_schedule')}
                        </h2>
                    </div>

                    {settings.calendly_url ? (
                        <div className="space-y-6">
                            <a
                                href={settings.calendly_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ backgroundColor: settings.brand_color }}
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-xl shadow-lg hover:opacity-90 transition-all w-full md:w-auto"
                            >
                                {t('funnel.thankyou.button_schedule')}
                            </a>
                            <p className="text-sm text-gray-400">Calendar will open in a new tab.</p>
                        </div>
                    ) : (
                        <p className="text-red-500">Error: No Calendar URL configured per Realtor.</p>
                    )}
                </div>

                <p className="text-sm text-gray-400 mt-12">
                    {t('funnel.form.secure_msg')}
                </p>
            </div>
        </div>
    );
}

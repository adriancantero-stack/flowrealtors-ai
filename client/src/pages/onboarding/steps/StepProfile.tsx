import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useTranslation } from '../../../i18n';

export default function StepProfile({ onNext }: { onNext: () => void }) {
    const { t } = useTranslation();
    const userId = "user_123";
    const [formData, setFormData] = useState({
        realtor_headline: '',
        realtor_bio_short: '',
        target_area: '',
        hero_title: 'Compra inteligente de casa en Florida, con ayuda de un Realtor experto.',
        hero_subtitle: 'Te ayudamos a encontrar la casa ideal.',
        brand_color: '#0A84FF',
        profile_photo_url: '',
        funnel_slug: ''
    });

    useEffect(() => {
        // Load existing settings if any
        fetch(`http://localhost:3000/api/funnel/settings/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.id) setFormData(data);
            });
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        await fetch(`http://localhost:3000/api/funnel/settings/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        onNext();
    };

    return (
        <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Form Side */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{t('onboarding.step1.title')}</h2>
                    <p className="text-gray-500 mt-2">This info will be used on your public lead funnel.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border overflow-hidden">
                            {formData.profile_photo_url ? (
                                <img src={formData.profile_photo_url} className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <input
                            placeholder={t('onboarding.form.photo_url')}
                            className="flex-1 p-2 border rounded-md text-sm"
                            value={formData.profile_photo_url}
                            onChange={e => handleChange('profile_photo_url', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.form.headline')}</label>
                        <input
                            className="w-full p-3 border rounded-lg text-sm"
                            placeholder="e.g. Expert Realtor in Miami..."
                            value={formData.realtor_headline}
                            onChange={e => handleChange('realtor_headline', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.form.bio')}</label>
                        <textarea
                            className="w-full p-3 border rounded-lg text-sm h-24"
                            placeholder="Tell leads about your experience..."
                            value={formData.realtor_bio_short}
                            onChange={e => handleChange('realtor_bio_short', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.form.area')}</label>
                            <input
                                className="w-full p-3 border rounded-lg text-sm"
                                placeholder="e.g. Orlando, Tampa"
                                value={formData.target_area}
                                onChange={e => handleChange('target_area', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.form.color')}</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="h-11 w-12 p-0 border rounded-lg cursor-pointer"
                                    value={formData.brand_color}
                                    onChange={e => handleChange('brand_color', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.form.slug')}</label>
                        <div className="flex items-center">
                            <span className="bg-gray-50 border border-r-0 rounded-l-lg px-3 py-3 text-sm text-gray-500">flowrealtor.ai/f/</span>
                            <input
                                className="flex-1 p-3 border rounded-r-lg text-sm"
                                placeholder="your-name"
                                value={formData.funnel_slug}
                                onChange={e => handleChange('funnel_slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        {t('onboarding.save_continue')}
                    </button>
                </div>
            </div>

            {/* Preview Side */}
            <div className="hidden md:block">
                <div className="sticky top-24 bg-gray-50 rounded-2xl border p-2 h-[600px] overflow-hidden shadow-sm">
                    <div className="p-2 text-center text-xs text-gray-400 font-medium uppercase tracking-wider">{t('onboarding.preview.title')}</div>
                    <div className="bg-white h-full rounded-xl overflow-y-auto border">
                        {/* Mini Landing Page Preview */}
                        <div className="p-6 text-center space-y-4">
                            <div className="inline-flex items-center text-xs bg-gray-100 rounded-full px-2 py-1">{t('funnel.badge.licensed')}</div>
                            <h3 className="text-xl font-bold leading-tight">{formData.hero_title || "Your Hero Title Here"}</h3>
                            <p className="text-xs text-gray-500">{formData.hero_subtitle}</p>
                            <button
                                style={{ backgroundColor: formData.brand_color }}
                                className="px-4 py-2 text-white text-xs rounded-full font-bold"
                            >
                                {t('funnel.form.submit')}
                            </button>

                            <div className="mt-8 pt-8 border-t">
                                <img
                                    src={formData.profile_photo_url || "https://via.placeholder.com/100"}
                                    className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white shadow-md"
                                />
                                <h4 className="font-bold text-sm mt-2">{formData.realtor_headline || "Your Name"}</h4>
                                <p className="text-xs text-gray-400 mt-1">{formData.target_area}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

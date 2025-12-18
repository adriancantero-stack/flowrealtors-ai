import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import type { Language } from '../../i18n/locales';
import { ArrowRight, Check, Lock, ChevronLeft, CreditCard, Calendar, Home, DollarSign } from 'lucide-react';

// Define API_BASE
let API_BASE = import.meta.env.VITE_API_URL || 'https://flowrealtors-ai-production.up.railway.app';
if (API_BASE && !API_BASE.startsWith('http')) {
    API_BASE = `https://${API_BASE}`;
}

export default function ApplyPage() {
    const { slug } = useParams();
    const { t, setLanguage, language } = useTranslation();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1
        motivation: '',
        timeline: '',
        budget: '',
        financing: '',
        preapproval: '',
        // Step 2
        name: '',
        email: '',
        phone: '',
        concern: '',
        goal: '',
        termsAccepted: false
    });

    useEffect(() => {
        fetch(`${API_BASE}/api/funnel/public/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error("Not Found");
                return res.json();
            })
            .then(data => {
                setSettings(data);
                if (data.primary_language) {
                    setLanguage(data.primary_language as Language);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug, setLanguage]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        return formData.motivation && formData.timeline && formData.budget && formData.financing;
    };

    const validateStep2 = () => {
        return formData.name && formData.email && formData.phone && formData.termsAccepted;
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${API_BASE}/api/funnel/public/${slug}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, language })
            });
            const data = await res.json();
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        } catch (err) {
            alert(t('common.error') || 'Error submitting form');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    if (!settings) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Realtor not found</div>;

    const brandColor = settings.page?.primary_color || '#000000';

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* PROGRESS BAR */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                        width: step === 1 ? '50%' : '100%',
                        backgroundColor: brandColor
                    }}
                />
            </div>

            <div className="max-w-xl mx-auto min-h-screen flex flex-col p-6">

                {/* HEADER */}
                <div className="pt-8 pb-6 text-center">
                    {settings.realtor?.photo_url && (
                        <img
                            src={settings.realtor.photo_url}
                            alt="Realtor"
                            className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-2 border-white shadow-md"
                        />
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">
                        {step === 1 ? t('apply.step1.title') : t('apply.step2.title')}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 1 ? t('apply.step1.subtitle') : t('apply.step2.subtitle')}
                    </p>
                </div>

                {/* FORM CONTENT */}
                <div className="flex-1 space-y-6">

                    {step === 1 ? (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            {/* MOTIVATION */}
                            <QuestionGroup
                                label={t('apply.q.motivation')}
                                icon={<Home className="w-4 h-4" />}
                                options={[
                                    { value: 'investment', label: t('apply.opt.investment') },
                                    { value: 'living', label: t('apply.opt.living') },
                                    { value: 'relocation', label: t('apply.opt.relocation') }
                                ]}
                                value={formData.motivation}
                                onChange={(v: any) => handleChange('motivation', v)}
                                activeColor={brandColor}
                            />

                            {/* TIMELINE */}
                            <QuestionGroup
                                label={t('apply.q.timeline')}
                                icon={<Calendar className="w-4 h-4" />}
                                options={[
                                    { value: 'asap', label: t('apply.opt.asap') },
                                    { value: '1-3_months', label: '1 - 3 Months' },
                                    { value: '3-6_months', label: '3 - 6 Months' },
                                    { value: 'browsing', label: t('apply.opt.browsing') }
                                ]}
                                value={formData.timeline}
                                onChange={(v: any) => handleChange('timeline', v)}
                                activeColor={brandColor}
                            />

                            {/* BUDGET */}
                            <QuestionGroup
                                label={t('apply.q.budget')}
                                icon={<DollarSign className="w-4 h-4" />}
                                options={[
                                    { value: 'under_300k', label: '< $300k' },
                                    { value: '300k-500k', label: '$300k - $500k' },
                                    { value: '500k-800k', label: '$500k - $800k' },
                                    { value: '800k_plus', label: '$800k+' }
                                ]}
                                value={formData.budget}
                                onChange={(v: any) => handleChange('budget', v)}
                                activeColor={brandColor}
                            />

                            {/* FINANCING */}
                            <QuestionGroup
                                label={t('apply.q.financing')}
                                icon={<CreditCard className="w-4 h-4" />}
                                options={[
                                    { value: 'cash', label: t('apply.opt.cash') },
                                    { value: 'mortgage', label: t('apply.opt.mortgage') },
                                    { value: 'needs_help', label: t('apply.opt.needs_help') }
                                ]}
                                value={formData.financing}
                                onChange={(v: any) => handleChange('financing', v)}
                                activeColor={brandColor}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in slide-in-from-right duration-500">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apply.form.name')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apply.form.email')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apply.form.phone')}</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apply.form.concern')}</label>
                                <textarea
                                    value={formData.concern}
                                    onChange={(e) => handleChange('concern', e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none h-24"
                                    placeholder={t('apply.form.concern_placeholder')}
                                />
                            </div>

                            {/* CONSENT */}
                            <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={formData.termsAccepted}
                                    onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor="terms" className="text-xs text-gray-500 leading-snug">
                                    {t('apply.consent.text')} <a href="#" className="underline">{t('apply.consent.privacy')}</a>.
                                </label>
                            </div>
                        </div>
                    )}

                </div>

                {/* FOOTER ACTIONS */}
                <div className="pt-8 mt-auto sticky bottom-0 bg-gray-50/95 backdrop-blur-sm pb-6 border-t border-gray-100">
                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            disabled={!validateStep1()}
                            style={{ backgroundColor: validateStep1() ? brandColor : '#ccc' }}
                            className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {t('apply.next')} <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-4 text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !validateStep2()}
                                style={{ backgroundColor: validateStep2() ? brandColor : '#ccc' }}
                                className="flex-1 py-4 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <span>Processing...</span>
                                ) : (
                                    <>
                                        {t('apply.submit')} <Lock className="w-4 h-4 opacity-70" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="text-center mt-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Secure by FlowRealtors
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

// SUB-COMPONENT FOR OPTIONS
function QuestionGroup({ label, icon, options, value, onChange, activeColor }: any) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-gray-100 rounded-md text-gray-500">{icon}</span>
                {label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((opt: any) => {
                    const isSelected = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            className={`p-3 rounded-lg text-sm font-medium transition-all text-left border-2 relative
                                ${isSelected ? 'border-current bg-opacity-5' : 'border-transparent bg-white hover:bg-gray-100/80 text-gray-600'}
                            `}
                            style={{
                                borderColor: isSelected ? activeColor : undefined,
                                color: isSelected ? activeColor : undefined,
                                backgroundColor: isSelected ? `${activeColor}10` : undefined
                            }}
                        >
                            {opt.label}
                            {isSelected && <Check className="w-4 h-4 absolute right-3 top-3" />}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}

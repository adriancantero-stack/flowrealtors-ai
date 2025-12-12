import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { Language } from '../../i18n/locales';

export default function FunnelLandingPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t, setLanguage } = useTranslation();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        budget: '',
        timeline: '3-6 meses',
        preapproved: 'No',
        concern: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch public funnel settings
        fetch(`http://localhost:3000/api/funnel/public/${slug}`)
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
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [slug, setLanguage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`http://localhost:3000/api/funnel/public/${slug}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.redirect) {
                navigate('thank-you');
            }
        } catch (err) {
            alert('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="h-screen flex items-center justify-center">Realtor page not found.</div>;

    const bgBrandStyle = { backgroundColor: settings.brand_color };

    return (
        <div className="animate-in fade-in duration-700 font-sans">
            {/* SECTION 1: HERO */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                                <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                                {t('funnel.badge.licensed')} &bull; {settings.target_area}
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                                {settings.hero_title}
                            </h1>
                            <p className="text-xl text-gray-500 leading-relaxed">
                                {settings.hero_subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="#apply"
                                    style={bgBrandStyle}
                                    className="inline-flex justify-center items-center px-8 py-4 text-base font-medium text-white rounded-full hover:opacity-90 transition-opacity shadow-lg"
                                >
                                    {t('funnel.form.submit')}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Right Col: Profile */}
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative z-10 text-center space-y-4">
                                <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                                    <img
                                        src={settings.profile_photo_url || "https://via.placeholder.com/300"}
                                        alt={settings.realtor_headline}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm mx-auto border border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-lg">{settings.realtor_headline}</h3>
                                    <p className="text-gray-500 text-sm mt-2">{settings.realtor_bio_short}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: BENEFITS */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">{t('funnel.benefits.title')}</h2>
                        <p className="text-gray-500 mt-4 text-lg">{t('funnel.benefits.subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            t('funnel.benefit.1'),
                            t('funnel.benefit.2', { area: settings.target_area }),
                            t('funnel.benefit.3'),
                            t('funnel.benefit.4')
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="mt-1">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="text-lg text-gray-700">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: FORM */}
            <section id="apply" className="py-24">
                <div className="max-w-xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-8 pb-0 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">{t('funnel.form.title')}</h2>
                            <p className="text-gray-500 mt-2">{t('funnel.benefits.subtitle')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('funnel.form.name')}</label>
                                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('funnel.form.email')}</label>
                                    <input required type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('funnel.form.phone')}</label>
                                    <input required type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City of Interest</label>
                                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                    value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Ej. Orlando, Kissimmee..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                        value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                        placeholder="$300k - $400k"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                                    <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                                        value={formData.timeline} onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                                    >
                                        <option>0-3 meses</option>
                                        <option>3-6 meses</option>
                                        <option>6-12 meses</option>
                                        <option>Solo investigando</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('funnel.form.duda_label')}</label>
                                <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none h-24"
                                    value={formData.concern} onChange={e => setFormData({ ...formData, concern: e.target.value })}
                                    placeholder={t('funnel.form.duda_placeholder')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={bgBrandStyle}
                                className="w-full py-4 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Enviando...' : t('funnel.form.submit')}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                {t('funnel.form.secure_msg')}
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

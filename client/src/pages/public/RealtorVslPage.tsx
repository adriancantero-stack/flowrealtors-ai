import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, XCircle, PlayCircle, ShieldCheck, MessageSquare } from 'lucide-react';
import { useTranslation } from '../../i18n';

// Constants
let API_BASE = import.meta.env.VITE_API_URL || 'https://flowrealtors-ai-production.up.railway.app';
if (API_BASE && !API_BASE.startsWith('http')) {
    API_BASE = `https://${API_BASE}`;
}

export default function RealtorVslPage() {
    const { slug, lang } = useParams();
    const { t } = useTranslation(); // Note: This might default to browser lang, need to ensure it respects URL param 'lang' if we have a provider.
    // Ideally, we rely on the parent RouteAwareLanguageProvider to set the language context.

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/public/realtors/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setData(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-white">Realtor not found</div>;

    const { realtor, page } = data;
    const heroBg = page.primary_color || '#0A84FF';
    const displayName = realtor.display_name || realtor.name;
    const region = realtor.region || `${realtor.city || ''}, ${realtor.state || ''}`;
    const market = realtor.primary_market || "Florida";

    // Determine language label for badges
    const langLabel = lang === 'pt' ? 'Português' : lang === 'es' ? 'Español' : 'English';

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
            {/* 1. Navbar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
                        <span style={{ color: heroBg }}>Flow</span>Realtors <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-medium tracking-wide">VERIFIED</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block leading-tight">
                            <div className="text-sm font-bold text-gray-900">{displayName}</div>
                            <div className="text-xs text-gray-500">{region}</div>
                        </div>
                        <img src={realtor.photo_url ? (realtor.photo_url.startsWith('http') ? realtor.photo_url : API_BASE + realtor.photo_url) : 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-10">

                {/* 2. Headline Section */}
                <div className="text-center space-y-6">
                    {/* Micro Badges */}
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm font-medium text-gray-600">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <ShieldCheck className="w-4 h-4 text-green-600" /> {t('vsl.badge.licensed') || 'Licensed Realtor'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <MessageSquare className="w-4 h-4 text-blue-600" /> {t('vsl.badge.language_support')?.replace('{language}', langLabel) || `Support in ${langLabel}`}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                        {page.hero_headline && page.hero_headline !== "Compra tu casa soñada en Florida"
                            ? page.hero_headline
                            : t('vsl.headline.template')?.replace('{market}', market)}
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {page.hero_subheadline && page.hero_subheadline !== "Asesoría experta para compradores internacionales."
                            ? page.hero_subheadline
                            : t('vsl.subheadline.template')?.replace('{language}', langLabel)}
                    </p>
                </div>

                {/* 3. VSL (Video) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-600 bg-red-50 py-2 px-4 rounded-lg inline-block mx-auto w-fit">
                        {t('vsl.video.warning')}
                    </div>
                    {page.vsl_url ? (
                        <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative group ring-4 ring-gray-100">
                            <iframe
                                src={page.vsl_url.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                title="VSL"
                            />
                        </div>
                    ) : (
                        <div className="aspect-video w-full bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                            <p>Video not configured</p>
                        </div>
                    )}
                </div>

                {/* 4. Primary CTA */}
                <div className="text-center space-y-6 pt-4">
                    <button
                        onClick={() => window.location.href = `/${lang || 'en'}/${slug}/apply`}
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full text-white font-bold text-xl md:text-2xl hover:scale-[1.02] transition-all shadow-xl hover:shadow-2xl w-full md:w-auto min-w-[320px]"
                        style={{ backgroundColor: heroBg, boxShadow: `0 10px 30px -10px ${heroBg}66` }}
                    >
                        {page.cta_text || t('vsl.cta.default')}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-sm text-gray-500 font-medium space-y-1">
                        <p>{t('vsl.cta.subtext')}</p>
                    </div>
                </div>

                {/* 5. For You / Not For You */}
                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            {t('vsl.section.for_you.title')}
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            {[1, 2, 3].map(i => (
                                <li key={i} className="flex gap-2">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                    {t(`vsl.section.for_you.${i}` as any)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4 opacity-75">
                        <h3 className="font-bold text-gray-500 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-gray-400" />
                            {t('vsl.section.not_for_you.title')}
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-500">
                            {[1, 2, 3].map(i => (
                                <li key={i} className="flex gap-2">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                    {t(`vsl.section.not_for_you.${i}` as any)}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </main>

            {/* 6. Trust Footer */}
            <footer className="border-t border-gray-100 py-8 mt-12 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                    <p className="text-sm text-gray-500 font-medium">
                        {t('vsl.footer.trust')}
                    </p>
                    <div className="text-xs text-gray-400">
                        Powered by FlowRealtors™ • © {new Date().getFullYear()}
                    </div>
                </div>
            </footer>
        </div>
    );
}

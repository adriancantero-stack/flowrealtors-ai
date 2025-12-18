import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Constants
let API_BASE = import.meta.env.VITE_API_URL || 'https://flowrealtors-ai-production.up.railway.app';
if (API_BASE && !API_BASE.startsWith('http')) {
    API_BASE = `https://${API_BASE}`;
}

export default function RealtorVslPage() {
    const { slug, lang } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Realtor Data using Spec Endpoint
        fetch(`${API_BASE}/api/public/realtors/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setData(data);
            })
            .catch(err => {
                console.error(err);
                // navigate('/404'); // Optional
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center">Realtor not found</div>;

    const { realtor, page } = data;
    const heroBg = page.primary_color || '#0A84FF';
    const displayName = realtor.display_name || realtor.name;
    const region = realtor.region || `${realtor.city || ''}, ${realtor.state || ''}`;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* 1. Hero Section */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight text-gray-900">FlowRealtors Verified</div>
                    <div className="flex items-center gap-2">
                        <img src={realtor.photo_url ? (realtor.photo_url.startsWith('http') ? realtor.photo_url : API_BASE + realtor.photo_url) : 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium">{displayName}</span>
                            {region && <span className="text-xs text-gray-500">{region}</span>}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-12">

                {/* HEADLINE */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        {page.hero_headline}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {page.hero_subheadline}
                    </p>
                </div>

                {/* VSL (Video) */}
                {page.vsl_url && (
                    <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                        {/* Simple Embed logic (Youtube/Vimeo) */}
                        <iframe
                            src={page.vsl_url.replace('watch?v=', 'embed/')}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* CTA 1 */}
                <div className="text-center">
                    <button
                        onClick={() => window.location.href = `/${lang || 'pt'}/${slug}/apply`}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg"
                        style={{ backgroundColor: heroBg }}
                    >
                        {page.cta_text} <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="mt-4 text-gray-500 text-sm">
                        👇 Haz clic arriba para ver si calificas
                    </p>
                </div>
            </main>

            <footer className="text-center py-8 text-gray-400 text-sm">
                Powered by FlowRealtors logic
            </footer>
        </div>
    );
}

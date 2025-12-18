import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Check, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Ensure this exists or use context
// Constants
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function RealtorLandingPage() {
    const { locale, slug } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', city: '',
        budget: '', timeline: '', preapproved: 'No', concern: ''
    });

    useEffect(() => {
        // Fetch Realtor Data
        fetch(`${API_BASE}/api/funnel/public/${slug}`)
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

    const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/funnel/public/${slug}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const result = await res.json();
            if (result.success && result.redirectUrl) {
                window.location.href = result.redirectUrl;
            } else {
                alert('Thank you! We will contact you shortly.');
            }
        } catch (err) {
            alert('Error submitting form.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center">Realtor not found</div>;

    const { realtor, page } = data;
    const heroBg = page.primary_color || '#0A84FF';

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* 1. Hero Section */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight text-gray-900">FlowRealtors Verified</div>
                    <div className="flex items-center gap-2">
                        <img src={realtor.photo_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium">{realtor.name}</span>
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
                    <a href="#apply" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg" style={{ backgroundColor: heroBg }}>
                        {page.cta_text} <ArrowRight className="w-5 h-5" />
                    </a>
                </div>

                {/* QUALIFICATION FORM */}
                <div id="apply" className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">Aplica a una Sesión Estratégica</h2>
                        <p className="text-gray-500">Completa tus datos para ver disponibilidad.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <input name="name" required placeholder="Tu Nombre Completo" className="input" onChange={handleChange} />
                            <input name="email" required type="email" placeholder="Tu Mejor Email" className="input" onChange={handleChange} />
                            <input name="phone" required type="tel" placeholder="WhatsApp (con código país)" className="input" onChange={handleChange} />
                            <input name="city" required placeholder="Ciudad de Interés" className="input" onChange={handleChange} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <select name="budget" className="select" onChange={handleChange}>
                                <option value="">Rango de Presupuesto</option>
                                <option>$300k - $400k</option>
                                <option>$400k - $600k</option>
                                <option>$600k - $1M</option>
                                <option>$1M+</option>
                            </select>
                            <select name="timeline" className="select" onChange={handleChange}>
                                <option value="">Cuándo planeas comprar?</option>
                                <option>Lo antes posible</option>
                                <option>3-6 meses</option>
                                <option>6-12 meses</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">¿Tienes carta de pre-aprobación o efectivo?</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="preapproved" value="Yes" onChange={handleChange} /> Sí, lista
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="preapproved" value="No" onChange={handleChange} /> No / Necesito Ayuda
                                </label>
                            </div>
                        </div>

                        <textarea name="concern" placeholder="¿Cuál es tu mayor duda o obstáculo hoy?" className="textarea h-24" onChange={handleChange}></textarea>

                        <button type="submit" className="w-full btn btn-lg text-white font-bold h-14 text-lg" style={{ backgroundColor: heroBg }}>
                            {loading ? 'Procesando...' : 'Ver Disponibilidad de Agenda'}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            Tus datos están seguros. Al enviar, aceptas ser contactado por {realtor.name}.
                        </p>
                    </form>
                </div>
            </main>

            <footer className="text-center py-8 text-gray-400 text-sm">
                Powered by FlowRealtors logic
            </footer>
        </div>
    );
}

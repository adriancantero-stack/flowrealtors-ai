import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, BarChart3, Zap, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function LandingPage() {
    const { t, language } = useTranslation();
    const [isLangOpen, setIsLangOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'pt', label: 'Português' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-light">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="FlowRealtors Logo" className="h-12 w-auto" />
                        </div>
                        <div className="flex items-center space-x-6">

                            {/* Language Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsLangOpen(!isLangOpen)}
                                    className="flex items-center space-x-2 text-sm font-medium text-muted hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-gray-50 bg-transparent border-0 cursor-pointer"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span className="uppercase">{language}</span>
                                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isLangOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsLangOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-light py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                            {languages.map((lang) => (
                                                <a
                                                    key={lang.code}
                                                    href={`/${lang.code}`}
                                                    className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${language === lang.code ? 'text-primary font-medium bg-blue-50/50' : 'text-gray-600'}`}
                                                >
                                                    {lang.label}
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link to={`/${language}/login`} className="text-sm font-medium text-muted hover:text-primary transition-colors">
                                {t('nav.login')}
                            </Link>
                            <Link to={`/${language}/register`} className="btn btn-primary px-6">
                                {t('nav.get_started')}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 pt-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
                    <div className="text-center max-w-4xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-700">
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]">
                            {t('landing.hero.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">{t('landing.hero.title_highlight')}</span>
                        </h1>
                        <p className="mt-6 text-xl lg:text-2xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
                            {t('landing.hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                            <Link to={`/${language}/register`} className="btn btn-primary px-8 py-4 text-lg h-auto hover:scale-105 transition-transform duration-200">
                                {t('landing.hero.cta_primary')} <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link to={`/${language}/demo`} className="btn btn-secondary px-8 py-4 text-lg h-auto">
                                {t('landing.hero.cta_secondary')}
                            </Link>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="mt-16 pt-8 border-t border-light">
                            <p className="text-sm font-medium text-muted uppercase tracking-widest mb-6">{t('landing.trusted_by')}</p>
                            <div className="flex justify-center gap-8 opacity-40 grayscale">
                                {/* Placeholders for logos (abstract shapes for now to look premium) */}
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="bg-gray-50/50 py-32 border-t border-light">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl text-center">{t('landing.section.everything_title')}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<MessageCircle className="h-6 w-6 text-white" />}
                                iconBg="bg-blue-500"
                                title={t('landing.feature.inbox_title')}
                                description={t('landing.feature.inbox_desc')}
                            />
                            <FeatureCard
                                icon={<Zap className="h-6 w-6 text-white" />}
                                iconBg="bg-orange-500"
                                title={t('landing.feature.ai_title')}
                                description={t('landing.feature.ai_desc')}
                            />
                            <FeatureCard
                                icon={<BarChart3 className="h-6 w-6 text-white" />}
                                iconBg="bg-purple-500"
                                title={t('landing.feature.analytics_title')}
                                description={t('landing.feature.analytics_desc')}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-light py-12">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm text-muted flex-wrap gap-4">
                    <p>{t('landing.footer.rights')}</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">{t('landing.footer.privacy')}</a>
                        <a href="#" className="hover:text-primary transition-colors">{t('landing.footer.terms')}</a>
                        <a href="#" className="hover:text-primary transition-colors">{t('landing.footer.contact')}</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, iconBg, title, description }: { icon: React.ReactNode, iconBg: string, title: string, description: string }) {
    return (
        <div className="card hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className={`${iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-muted leading-relaxed">{description}</p>
        </div>
    );
}

import { useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import type { Language } from '../i18n/locales';

export default function RouteAwareLanguageProvider() {
    const { lang } = useParams<{ lang: string }>();
    const { setLanguage, language } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        if (lang && ['en', 'es', 'pt'].includes(lang)) {
            if (lang !== language) {
                setLanguage(lang as Language);
            }
        } else if (lang) {
            // Invalid language in URL, redirect to default (or 404, but sticking to en for safety)
            navigate(`/en`, { replace: true });
        }
    }, [lang, language, setLanguage, navigate]);

    return <Outlet />;
}

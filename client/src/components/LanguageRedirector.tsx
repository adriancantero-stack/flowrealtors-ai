import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LanguageRedirector() {
    const navigate = useNavigate();

    useEffect(() => {
        const browserLang = navigator.language.slice(0, 2);
        const targetLang = ['pt', 'es'].includes(browserLang) ? browserLang : 'en';
        navigate(`/${targetLang}`, { replace: true });
    }, [navigate]);

    return null; // Or a loading spinner
}

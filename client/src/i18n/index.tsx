import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { translations } from './locales';
import type { Language } from './locales';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
    initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage = 'en' }: LanguageProviderProps) {
    const [language, setLanguage] = useState<Language>(() => {
        if (initialLanguage) return initialLanguage;
        // Auto-detect browser language
        const browserLang = navigator.language.slice(0, 2);
        if (browserLang === 'pt') return 'pt';
        if (browserLang === 'es') return 'es';
        return 'en';
    });

    useEffect(() => {
        // In a real app, we might persist this to localStorage as well
        // localStorage.setItem('preferred_language', language);
    }, [language]);

    const t = (key: string, params?: Record<string, string>): string => {
        // @ts-ignore
        const text = translations[language][key] || translations['en'][key] || `[missing: ${key}]`;

        if (params) {
            return Object.entries(params).reduce((acc, [key, value]) => {
                return acc.replace(new RegExp(`{${key}}`, 'g'), value);
            }, text);
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}

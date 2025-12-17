import { Navigate, useLocation, useParams } from 'react-router-dom';
import React from 'react';

export default function RequireAuth({ children, role }: { children: React.ReactNode, role?: 'admin' | 'broker' }) {
    const location = useLocation();
    const { lang } = useParams();
    const currentLang = lang || 'en';

    const token = localStorage.getItem('flow_realtor_token');

    if (!token) {
        // Redirect to login, saving the current location
        return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
    }

    // Role Check
    const userRole = localStorage.getItem('flow_realtor_role');

    if (role && role === 'admin' && userRole !== 'admin') {
        // Logged in but not admin -> Redirect to their dashboard or home
        // Could also show an Unauthorized page, but redirect is safer for now
        const userSlug = localStorage.getItem('flow_realtor_slug');
        if (userSlug) {
            return <Navigate to={`/${currentLang}/${userSlug}/dashboard`} replace />;
        }
        return <Navigate to={`/${currentLang}/`} replace />;
    }

    return children;
}

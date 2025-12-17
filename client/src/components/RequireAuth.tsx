import { Navigate, useLocation, useParams } from 'react-router-dom';

export default function RequireAuth({ children, role }: { children: JSX.Element, role?: 'admin' | 'broker' }) {
    const location = useLocation();
    const { lang } = useParams();
    const currentLang = lang || 'en';

    const token = localStorage.getItem('flow_realtor_token');

    if (!token) {
        // Redirect to login, saving the current location
        return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
    }

    // Role check could go here if we decoded the JWT or stored user role in localStorage
    // For now, we trust the token existence for basic access, backend will verify role

    return children;
}


import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/*
  LegacyDashboardRedirector:
  Handles users accessing the old /:lang/dashboard URL.
  It should detect the logged-in user (from Context/LocalStorage)
  and redirect them to their correct slug: /:lang/:realtorSlug/dashboard.
*/

export default function LegacyDashboardRedirector() {
    const navigate = useNavigate();
    const { lang } = useParams();

    useEffect(() => {
        // Temporary Logic: Fetch from localStorage or assume 'patricia-chahin' for dev
        // In production, this should read from AuthContext
        const userSlug = localStorage.getItem('flow_realtor_slug') || 'patricia-chahin';

        // Redirect
        if (userSlug) {
            navigate(`/${lang}/${userSlug}/dashboard`, { replace: true });
        } else {
            // Fallback for unauthenticated or unknown slug
            navigate(`/${lang}/login`);
        }
    }, [lang, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}

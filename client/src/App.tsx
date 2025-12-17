import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import LeadsPage from './pages/dashboard/LeadsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

import LeadDetailsPage from './pages/dashboard/LeadDetailsPage.tsx';

import AutomationsPage from './pages/dashboard/AutomationsPage.tsx';
import IntegrationsPage from './pages/dashboard/IntegrationsPage.tsx';
import FunnelSettingsPage from './pages/dashboard/FunnelSettingsPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';

// Admin Pages
// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBrokersPage from './pages/admin/BrokersPage';
import AdminLeadsPage from './pages/admin/LeadsPage';
import AdminLogsPage from './pages/admin/LogsPage';
import AdminGeminiPage from './pages/admin/GeminiSettingsPage';
import AdminWhatsAppPage from './pages/admin/WhatsAppSettingsPage';

// Funnel Pages
import PublicFunnelLayout from './layouts/PublicFunnelLayout';
import FunnelLandingPage from './pages/funnel/FunnelLandingPage';
import FunnelThankYouPage from './pages/funnel/FunnelThankYouPage';

import { LanguageProvider } from './i18n';
import LanguageRedirector from './components/LanguageRedirector';
import RouteAwareLanguageProvider from './layouts/RouteAwareLanguageProvider';
import LegacyDashboardRedirector from './components/LegacyDashboardRedirector';

import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Root redirector: / -> /en, /es, or /pt */}
          <Route path="/" element={<LanguageRedirector />} />

          {/* All routes wrapped in /:lang */}
          <Route path="/:lang" element={<RouteAwareLanguageProvider />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />

            {/* Legacy Dashboard Redirect (/:lang/dashboard -> /:lang/:slug/dashboard) */}
            <Route path="dashboard" element={<LegacyDashboardRedirector />} />

            {/* ... */}

            <Route path="admin" element={
              <RequireAuth role="admin">
                <AdminLayout />
              </RequireAuth>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="brokers" element={<AdminBrokersPage />} />
              <Route path="leads" element={<AdminLeadsPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
              <Route path="gemini" element={<AdminGeminiPage />} />
              <Route path="whatsapp" element={<AdminWhatsAppPage />} />

              {/* Legacy Redirects */}
              <Route path="users" element={<Navigate to="brokers" replace />} />
              <Route path="monitoring" element={<Navigate to="logs" replace />} />
              <Route path="settings" element={<Navigate to="gemini" replace />} />
            </Route>

            {/* Realtor Spaces: /:lang/:slug/... */}
            {/* Placed AFTER admin to avoid catching "admin" as a slug */}
            <Route path=":slug" element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="leads/:id" element={<LeadDetailsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="funnel" element={<FunnelSettingsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Public Funnel Routes (Global, outside /:lang) */}
          <Route path="/f/:slug" element={<PublicFunnelLayout />}>
            <Route index element={<FunnelLandingPage />} />
            <Route path="thank-you" element={<FunnelThankYouPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;

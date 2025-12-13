import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
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
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminLogsPage from './pages/admin/LogsPage';

// Funnel Pages
import PublicFunnelLayout from './layouts/PublicFunnelLayout';
import FunnelLandingPage from './pages/funnel/FunnelLandingPage';
import FunnelThankYouPage from './pages/funnel/FunnelThankYouPage';

import { LanguageProvider } from './i18n';
import LanguageRedirector from './components/LanguageRedirector';
import RouteAwareLanguageProvider from './layouts/RouteAwareLanguageProvider';

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
            <Route path="onboarding" element={<OnboardingPage />} />

            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="leads/:id" element={<LeadDetailsPage />} />
              <Route path="intergrations" element={<IntegrationsPage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="funnel" element={<FunnelSettingsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="brokers" element={<AdminBrokersPage />} />
              <Route path="leads" element={<AdminLeadsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="logs" element={<AdminLogsPage />} />

              {/* Legacy Redirects */}
              <Route path="users" element={<Navigate to="brokers" replace />} />
              <Route path="monitoring" element={<Navigate to="logs" replace />} />
              <Route path="gemini" element={<Navigate to="settings" replace />} />
              <Route path="whatsapp" element={<Navigate to="settings" replace />} />
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

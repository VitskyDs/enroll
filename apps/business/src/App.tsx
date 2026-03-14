import { Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import BasicsPage from '@/pages/onboarding/BasicsPage'
import PreferencesPage from '@/pages/onboarding/PreferencesPage'
import RecommendationPage from '@/pages/onboarding/RecommendationPage'
import GeneratingPage from '@/pages/onboarding/GeneratingPage'
import ProgramPreviewPage from '@/pages/onboarding/ProgramPreviewPage'
import TncPage from '@/pages/onboarding/TncPage'
import DashboardPage from '@/pages/DashboardPage'
import ProgramPage from '@/pages/ProgramPage'
import ProgramFeaturePage from '@/pages/ProgramFeaturePage'
import ServicesPage from '@/pages/ServicesPage'
import ServiceFormPage from '@/pages/ServiceFormPage'
import CustomersPage from '@/pages/CustomersPage'
import CustomerPage from '@/pages/CustomerPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Onboarding */}
      <Route path="/onboarding" element={<BasicsPage />} />
      <Route path="/onboarding/preferences" element={<PreferencesPage />} />
      <Route path="/onboarding/recommendation" element={<RecommendationPage />} />
      <Route path="/onboarding/generating" element={<GeneratingPage />} />
      <Route path="/onboarding/preview" element={<ProgramPreviewPage />} />
      <Route path="/onboarding/tnc" element={<TncPage />} />
      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/program" element={<ProgramPage />} />
      <Route path="/program/:feature" element={<ProgramFeaturePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:id" element={<ServiceFormPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/customers/:id" element={<CustomerPage />} />
    </Routes>
  )
}

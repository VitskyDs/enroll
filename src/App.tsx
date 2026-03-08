import { Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import BasicsPage from '@/pages/onboarding/BasicsPage'
import OnboardingProgramPage from '@/pages/onboarding/ProgramPage'
import ConfirmPage from '@/pages/onboarding/ConfirmPage'
import DashboardPage from '@/pages/DashboardPage'
import ProgramPage from '@/pages/ProgramPage'
import ProgramFeaturePage from '@/pages/ProgramFeaturePage'
import ServicesPage from '@/pages/ServicesPage'
import ServiceFormPage from '@/pages/ServiceFormPage'
import CustomersPage from '@/pages/CustomersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<BasicsPage />} />
      <Route path="/onboarding/program" element={<OnboardingProgramPage />} />
      <Route path="/onboarding/confirm" element={<ConfirmPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/program" element={<ProgramPage />} />
      <Route path="/program/:feature" element={<ProgramFeaturePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:id" element={<ServiceFormPage />} />
      <Route path="/customers" element={<CustomersPage />} />
    </Routes>
  )
}

import { Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import BasicsPage from '@/pages/onboarding/BasicsPage'
import ProgramPage from '@/pages/onboarding/ProgramPage'
import ConfirmPage from '@/pages/onboarding/ConfirmPage'
import DashboardPage from '@/pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<BasicsPage />} />
      <Route path="/onboarding/program" element={<ProgramPage />} />
      <Route path="/onboarding/confirm" element={<ConfirmPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

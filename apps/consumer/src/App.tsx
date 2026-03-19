import { Routes, Route, Navigate } from 'react-router-dom'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import ServiceDrawerPage from '@/pages/ServiceDrawerPage'
import CheckoutPage from '@/pages/CheckoutPage'
import PurchaseConfirmationPage from '@/pages/PurchaseConfirmationPage'
import ReferPage from '@/pages/ReferPage'
import TrackReferralsPage from '@/pages/TrackReferralsPage'
import LoyaltyProgramPage from '@/pages/LoyaltyProgramPage'
import ProfilePage from '@/pages/ProfilePage'
import JoinPage from '@/pages/JoinPage'

export default function App() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route path="service/:id" element={<ServiceDrawerPage />} />
      </Route>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/confirmation" element={<PurchaseConfirmationPage />} />
      <Route path="/refer" element={<ReferPage />} />
      <Route path="/refer/track" element={<TrackReferralsPage />} />
      <Route path="/loyalty" element={<LoyaltyProgramPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/join/:slug" element={<JoinPage />} />
    </Routes>
  )
}

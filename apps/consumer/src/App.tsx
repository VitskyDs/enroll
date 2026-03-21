import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import BottomNav from '@/components/BottomNav'
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
import AuthCallbackPage from '@/pages/AuthCallbackPage'

function AppLayout() {
  const { isEnrolled } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Routes>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
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
      </div>
      {isEnrolled && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}

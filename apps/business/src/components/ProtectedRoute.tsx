import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Dev-only: allow demo flow through without auth
  const isDemoMode = import.meta.env.DEV && (
    (location.state as { demo?: boolean } | null)?.demo === true ||
    sessionStorage.getItem('enroll_demo_mode') === 'true'
  )
  if (isDemoMode) return <Outlet />

  if (loading) return null

  if (!user) return <Navigate to="/" replace />

  return <Outlet />
}

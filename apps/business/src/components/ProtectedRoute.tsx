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

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
    </div>
  )

  if (!user) return <Navigate to="/" replace />

  return <Outlet />
}

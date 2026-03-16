import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // After Google OAuth redirect, user will be set — run post-login logic
  useEffect(() => {
    if (loading || !user) return

    setChecking(true)
    setError(null)

    async function handlePostLogin() {
      // Check allowlist
      const { data: allowed } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', user!.email)
        .maybeSingle()

      if (!allowed) {
        await supabase.auth.signOut()
        setError("You're not on the access list yet. Reach out to get access.")
        setChecking(false)
        return
      }

      // Check if user already has a business
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user!.id)
        .maybeSingle()

      if (business) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    }

    handlePostLogin()
  }, [user, loading, navigate])

  function signInWithGoogle() {
    setError(null)
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  function goToDemo() {
    navigate('/onboarding', { state: { demo: true } })
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Logo — vertically centered in top half */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="flex items-center gap-1">
          <img src="/logo-mark.svg" alt="" className="size-8" />
          <img src="/logo-wordmark.svg" alt="Enroll" className="h-[23px] w-[75px]" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 px-4 pt-4 pb-16 w-full max-w-[393px] mx-auto shrink-0">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.5px] text-[#0a0a0a]">
            Loyalty made easy
          </h1>
          <p className="text-base text-[#404040] leading-6">
            Enroll grows your business through smarter loyalty and subscriptions
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={signInWithGoogle}
              disabled={checking || loading}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-[#d4d4d4] bg-white text-sm font-medium text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          {import.meta.env.DEV && (
            <button
              onClick={goToDemo}
              className="text-xs text-zinc-400 underline underline-offset-2 text-center mt-1"
            >
              dev: demo flow
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

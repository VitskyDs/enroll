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
    <div className="flex flex-col min-h-screen bg-white items-center">
      {/* Logo — fixed-height section, vertically centered */}
      <div className="flex h-[344px] items-center justify-center px-6 w-full">
        <div className="flex items-center gap-1">
          <img src="/logo-mark.svg" alt="" className="size-8" />
          <img src="/logo-wordmark.svg" alt="Enroll" className="h-[23px] w-[75px]" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 px-4 pt-4 pb-16 w-full max-w-[393px] shrink-0">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#0a0a0a]">
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
              className="flex items-center justify-center w-full min-h-10 px-6 py-[10px] rounded-lg border border-[#d4d4d4] bg-[rgba(255,255,255,0.1)] text-sm font-medium text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0)] disabled:opacity-50"
            >
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

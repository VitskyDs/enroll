import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(
    (location.state as { error?: string } | null)?.error ?? null
  )

  function signInWithGoogle() {
    setError(null)
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  function goToDemo() {
    navigate('/onboarding', { state: { demo: true } })
  }

  function jumpToDashboard() {
    navigate('/dashboard', { state: { demo: true } })
  }

  return (
    <div className="flex flex-col min-h-screen bg-white items-center">
      {/* Logo */}
      <div className="flex items-center justify-center pt-[128px] pb-[32px] px-6 w-full">
        <div className="flex items-center gap-2">
          <img src="/logo-mark.svg" alt="" className="size-12" />
          <img src="/logo-wordmark.svg" alt="Enroll" className="h-[40px] w-[93px]" />
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
              className="flex items-center justify-center gap-2 w-full min-h-10 px-6 py-[10px] rounded-lg border border-[#d4d4d4] bg-[rgba(255,255,255,0.1)] text-sm font-medium text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0)] disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15.68 8.18182C15.68 7.61455 15.6291 7.06909 15.5345 6.54545H8V9.64364H12.3055C12.1164 10.64 11.5491 11.4836 10.6982 12.0509V14.0655H13.2945C14.8073 12.6691 15.68 10.6182 15.68 8.18182Z" fill="#4285F4"/>
                <path d="M8 16C10.16 16 11.9709 15.2873 13.2945 14.0655L10.6982 12.0509C9.98545 12.5309 9.07636 12.8218 8 12.8218C5.92 12.8218 4.15273 11.4109 3.52 9.52H0.858182V11.5927C2.17455 14.2073 4.87273 16 8 16Z" fill="#34A853"/>
                <path d="M3.52 9.52C3.36 9.04 3.27273 8.53091 3.27273 8C3.27273 7.46909 3.36 6.96 3.52 6.48V4.40727H0.858182C0.312727 5.49091 0 6.70909 0 8C0 9.29091 0.312727 10.5091 0.858182 11.5927L3.52 9.52Z" fill="#FBBC05"/>
                <path d="M8 3.17818C9.17455 3.17818 10.2255 3.58545 11.0545 4.37818L13.3527 2.08C11.9673 0.792727 10.1564 0 8 0C4.87273 0 2.17455 1.79273 0.858182 4.40727L3.52 6.48C4.15273 4.58909 5.92 3.17818 8 3.17818Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          {import.meta.env.DEV && (
            <div className="flex flex-col items-center gap-2 mt-1">
              <button
                onClick={goToDemo}
                className="text-xs text-zinc-400 underline underline-offset-2 text-center"
              >
                dev: demo flow
              </button>
              <button
                onClick={jumpToDashboard}
                className="text-xs text-zinc-400 underline underline-offset-2 text-center"
              >
                dev: jump to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

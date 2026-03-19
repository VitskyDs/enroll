import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { generateProgram } from '@/services/generateProgram'
import { DEMO_PROGRAM } from '@/data/demoData'
import type { BusinessOnboardingData, ProgramRecommendation } from '@/types'

const MESSAGES = [
  'Analyzing your business…',
  'Selecting program structure…',
  'Crafting your earn rules…',
  'Building tier logic…',
  'Writing brand voice…',
  'Finalizing your program…',
]

// Total demo animation duration in ms — matches the message cycle
const DEMO_DURATION_MS = MESSAGES.length * 1800

export default function GeneratingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { onboardingData, recommendation, demo } = location.state as {
    onboardingData: BusinessOnboardingData
    recommendation: ProgramRecommendation
    demo?: boolean
  }

  const [messageIndex, setMessageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Cycle through progress messages in both real and demo mode
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  // Demo mode: auto-navigate with dummy program after animation completes
  useEffect(() => {
    if (!demo) return
    const timeout = setTimeout(() => {
      navigate('/onboarding/preview', {
        state: { onboardingData, recommendation, program: DEMO_PROGRAM, demo: true },
      })
    }, DEMO_DURATION_MS)
    return () => clearTimeout(timeout)
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Real mode: call the API
  useEffect(() => {
    if (demo) return
    generateProgram(onboardingData, recommendation)
      .then((program) => {
        navigate('/onboarding/preview', {
          state: { onboardingData, recommendation, program },
        })
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Something went wrong. Please try again.')
      })
  // Run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 gap-6">
        <p className="text-base text-zinc-900 text-center font-medium">Something went wrong</p>
        <p className="text-sm text-zinc-500 text-center">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="h-10 px-6 rounded-lg bg-zinc-900 text-white text-sm font-medium"
        >
          Go back and retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 gap-8">
      <Spinner />
      <div className="flex flex-col items-center gap-2">
        <p className="text-base font-semibold text-zinc-900">Building your loyalty program</p>
        <p className="text-sm text-zinc-500 transition-opacity duration-300 min-h-5">
          {MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-zinc-900 animate-spin" />
    </div>
  )
}

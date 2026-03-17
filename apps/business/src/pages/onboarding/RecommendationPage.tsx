import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { recommendProgram, PROGRAM_TYPE_LABELS, PROGRAM_TYPE_DESCRIPTIONS } from '@/services/recommendProgram'
import type { BusinessOnboardingData, ProgramRecommendation } from '@/types'
import type { OnCompleteData as Phase1Data } from '@/hooks/useBasicsOnboarding'
import type { PreferencesCompleteData } from '@/hooks/usePreferencesOnboarding'

type AllOnboardingData = Phase1Data & PreferencesCompleteData

export default function RecommendationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const allData = location.state as AllOnboardingData & { demo?: boolean }
  const demoMode = allData?.demo === true

  const onboardingData: BusinessOnboardingData = {
    business_name: allData.businessName,
    website: allData.websiteUrl || undefined,
    services_and_products: allData.services_and_products,
    offering_type: allData.offering_type,
    industry: allData.industry,
    brand_personality: allData.brand_personality,
    primary_goal: allData.primary_goal,
    visit_frequency: allData.visit_frequency,
    spend_variance: allData.spend_variance,
  }

  const recommendation: ProgramRecommendation = useMemo(
    () => recommendProgram(onboardingData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  function handleAccept() {
    navigate('/onboarding/generating', {
      state: { onboardingData: { ...onboardingData, services: allData.services ?? [] }, recommendation, demo: demoMode },
    })
  }

  return (
    <div className="flex flex-col h-screen bg-white items-center">
    <div className="flex flex-col flex-1 w-full max-w-lg overflow-hidden">
      <header className="flex flex-col gap-4 px-4 pt-safe pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/onboarding/preferences', { state: allData })}
            className="flex items-center justify-center w-10 h-10 rounded bg-zinc-100 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full bg-zinc-900 rounded-full transition-all duration-300" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-semibold leading-8">Your program</p>
          <p className="text-base text-zinc-500 leading-6">Here's what we recommend based on your answers.</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-4">
          {/* Recommendation card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Recommended</p>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {PROGRAM_TYPE_LABELS[recommendation.program_type]}
                </h2>
              </div>
              <ConfidenceBadge confidence={recommendation.confidence} />
            </div>

            <p className="text-sm text-zinc-600 leading-5">
              {PROGRAM_TYPE_DESCRIPTIONS[recommendation.program_type]}
            </p>

            <div className="pt-1 border-t border-zinc-100">
              <p className="text-sm font-medium text-zinc-500 mb-1.5">Why this fits {allData.businessName}</p>
              <p className="text-sm text-zinc-700 leading-5">{recommendation.rationale}</p>
            </div>
          </div>

          {/* Business summary pills */}
          <div className="flex flex-wrap gap-2">
            <Pill label={allData.industry} />
            <Pill label={GOAL_LABELS[allData.primary_goal]} />
            <Pill label={FREQUENCY_LABELS[allData.visit_frequency]} />
            <Pill label={VARIANCE_LABELS[allData.spend_variance]} />
          </div>
        </div>
      </div>

      <div className="px-4 pb-safe pb-6 flex flex-col gap-3 border-t border-zinc-100 pt-4">
        <button
          onClick={handleAccept}
          className="w-full h-12 rounded-xl bg-zinc-900 text-white text-base font-medium"
        >
          Build my program
        </button>
        <button
          onClick={() => navigate('/onboarding/preferences', { state: allData })}
          className="w-full h-10 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-medium"
        >
          Change my answers
        </button>
      </div>
    </div>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: ProgramRecommendation['confidence'] }) {
  const config = {
    high: { label: 'Strong match', className: 'bg-emerald-50 text-emerald-700' },
    medium: { label: 'Good match', className: 'bg-blue-50 text-blue-700' },
    low: { label: 'Possible match', className: 'bg-amber-50 text-amber-700' },
  }[confidence]

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.className}`}>
      {config.label}
    </span>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full capitalize">
      {label}
    </span>
  )
}

const GOAL_LABELS: Record<string, string> = {
  acquire: 'Gain new members',
  retain: 'Retain customers',
  revenue: 'Grow revenue',
}

const FREQUENCY_LABELS: Record<string, string> = {
  high: 'High frequency',
  medium: 'Medium frequency',
  low: 'Low frequency',
}

const VARIANCE_LABELS: Record<string, string> = {
  consistent: 'Consistent spend',
  varied: 'Varied spend',
}

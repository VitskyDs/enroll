import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'
import { useDemoMode } from '@/hooks/useDemoMode'
import { DEMO_PROGRAM } from '@/data/demoData'
import type { LoyaltyProgram } from '@/types'

type FeatureKey = 'earn-rules' | 'reward-tiers' | 'bonus-rules' | 'referral' | 'brand-voice'

function shortDescription(program: LoyaltyProgram, key: FeatureKey): string {
  switch (key) {
    case 'earn-rules': {
      const pts = program.earn_rules?.dollar_spend?.points_per_dollar
      const pct = program.earn_rules?.dollar_spend?.cashback_percent
      if (pts != null) return `${pts} ${program.currency_name} per $1 spent`
      if (pct != null) return `${pct}% cash back on every dollar`
      return 'View earn rules'
    }
    case 'reward-tiers':
      return Array.isArray(program.reward_tiers) && program.reward_tiers.length > 0
        ? `${program.reward_tiers.length} tiers`
        : 'No tiers'
    case 'bonus-rules': {
      const rule = program.bonus_rule
      if (!rule) return 'View bonus rule'
      const trigger = (rule.trigger as string | undefined) ?? ''
      const label = trigger.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return label || 'View bonus rule'
    }
    case 'referral': {
      const ref = program.referral_rules as Record<string, unknown> | undefined
      const r = ref?.referrer_reward
      const e = ref?.referee_reward
      if (r != null && e != null) return `+${r} / +${e} ${program.currency_name}`
      return 'View referral program'
    }
    case 'brand-voice':
      return program.brand_voice_summary
        ? program.brand_voice_summary.slice(0, 60) + '…'
        : 'View brand voice'
  }
}

const ROWS: { key: FeatureKey; label: string }[] = [
  { key: 'earn-rules', label: 'Earn rules' },
  { key: 'reward-tiers', label: 'Reward tiers' },
  { key: 'bonus-rules', label: 'Bonus rules' },
  { key: 'referral', label: 'Referral program' },
  { key: 'brand-voice', label: 'Brand voice' },
]

export default function ProgramPage() {
  const demoMode = useDemoMode()
  const [program, setProgram] = useState<LoyaltyProgram | null>(demoMode ? DEMO_PROGRAM : null)
  const [isLoading, setIsLoading] = useState(!demoMode)
  const navigate = useNavigate()

  useEffect(() => {
    if (demoMode) return
    supabase
      .from('loyalty_programs')
      .select('*')
      .order('created_at', { ascending: false })
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProgram(data as LoyaltyProgram)
        setIsLoading(false)
      })
  }, [demoMode])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto pb-28 lg:pb-6">
      <div className="flex flex-col gap-6 px-4 lg:px-6 pt-safe w-full max-w-4xl mx-auto">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !program && (
          <div className="flex flex-col items-center gap-4 px-4 py-16">
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zinc-600" />
            </div>
            <div className="flex flex-col gap-1 items-center text-center">
              <p className="text-sm font-medium text-zinc-900 leading-5">No program yet</p>
              <p className="text-sm text-zinc-500 leading-5">Complete onboarding to generate your loyalty program</p>
            </div>
            <button
              className="w-full h-9 bg-zinc-900 text-white text-sm font-medium rounded-lg"
              onClick={() => navigate('/onboarding')}
            >
              Start onboarding
            </button>
          </div>
        )}

        {/* Program loaded */}
        {!isLoading && program && (
          <>
            {/* Heading */}
            <div className="flex flex-col gap-2">
              <p className="text-[30px] font-semibold text-black leading-tight tracking-[-0.5px]">
                {program.program_name}
              </p>
              <p className="text-base text-zinc-500 leading-6">
                {program.currency_name}
              </p>
            </div>

            {/* Feature list */}
            <div className="border border-zinc-200 rounded-lg overflow-hidden">
              {ROWS.map(({ key, label }, i) => (
                <button
                  key={key}
                  className={`w-full flex items-start gap-2 p-4 bg-white text-left ${
                    i < ROWS.length - 1 ? 'border-b border-zinc-200' : ''
                  }`}
                  onClick={() => navigate(`/program/${key}`, { state: { program } })}
                >
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <p className="text-base font-semibold text-[#404040] leading-6">{label}</p>
                    <p className="text-sm text-zinc-500 leading-5">{shortDescription(program, key)}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      </div>

      <BottomNav active="program" />
    </div>
  )
}

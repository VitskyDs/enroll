import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'
import type { LoyaltyProgram } from '@/types'

type FeatureKey = 'currency' | 'earn-rules' | 'reward-tiers' | 'bonus-rules' | 'brand-voice'

function shortDescription(program: LoyaltyProgram, key: FeatureKey): string {
  switch (key) {
    case 'currency':
      return 'Your loyalty currency'
    case 'earn-rules': {
      const first = program.earn_rules[0]
      return first?.label ?? `${program.earn_rules.length} earn rules`
    }
    case 'reward-tiers': {
      const first = program.reward_tiers[0]
      return first?.name ?? `${program.reward_tiers.length} reward tiers`
    }
    case 'bonus-rules': {
      const first = program.bonus_rules[0]
      return first?.label ?? `${program.bonus_rules.length} bonus rules`
    }
    case 'brand-voice':
      return program.brand_voice_summary.length > 60
        ? program.brand_voice_summary.slice(0, 60) + '…'
        : program.brand_voice_summary
  }
}

const ROWS: { key: FeatureKey; label: (p: LoyaltyProgram) => string }[] = [
  { key: 'currency', label: (p) => p.currency_name },
  { key: 'earn-rules', label: () => 'Earn rules' },
  { key: 'reward-tiers', label: () => 'Reward tiers' },
  { key: 'bonus-rules', label: () => 'Bonus rules' },
  { key: 'brand-voice', label: () => 'Brand voice' },
]

export default function ProgramPage() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('loyalty_programs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setProgram(data as LoyaltyProgram)
      })
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 px-4 pt-16 pb-28">

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <p className="text-[30px] font-semibold text-black leading-tight tracking-[-0.5px]">
            {program?.program_name ?? '—'}
          </p>
          <p className="text-base text-zinc-500 leading-6">
            This is your loyalty program, built to {program?.referral_description ?? '…'}
          </p>
        </div>

        {/* Feature list */}
        {program && (
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
                  <p className="text-base font-semibold text-[#404040] leading-6">{label(program)}</p>
                  <p className="text-sm text-zinc-500 leading-5">{shortDescription(program, key)}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="program" />
    </div>
  )
}

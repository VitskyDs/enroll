import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'
import type { LoyaltyProgram } from '@/types'

type FeatureKey = 'earn-rules' | 'reward-tiers' | 'bonus-rules' | 'referral' | 'brand-voice'

function shortDescription(program: LoyaltyProgram, key: FeatureKey): string {
  switch (key) {
    case 'earn-rules':
      return program.earn_rules?.base_rate ?? 'View earn rules'
    case 'reward-tiers':
      return Array.isArray(program.reward_tiers) && program.reward_tiers.length > 0
        ? `${program.reward_tiers.length} tiers`
        : 'No tiers'
    case 'bonus-rules':
      return Array.isArray(program.bonus_rules)
        ? `${program.bonus_rules.length} bonus rules`
        : 'View bonus rules'
    case 'referral':
      return program.referral_description
        ? program.referral_description.slice(0, 60) + '…'
        : 'View referral program'
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
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 px-4 pt-safe pb-28">

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <p className="text-[30px] font-semibold text-black leading-tight tracking-[-0.5px]">
            {program?.program_name ?? '—'}
          </p>
          <p className="text-base text-zinc-500 leading-6">
            {program?.currency_name ?? '…'}
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
                  <p className="text-base font-semibold text-[#404040] leading-6">{label}</p>
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

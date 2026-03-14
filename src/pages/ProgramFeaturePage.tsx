import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { LoyaltyProgram } from '@/types'
import { BottomNav } from '@/components/BottomNav'

type FeatureKey = 'earn-rules' | 'reward-tiers' | 'bonus-rules' | 'referral' | 'brand-voice'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-100 rounded-lg p-4">
      <p className="text-base text-zinc-900 leading-6 whitespace-pre-line">{children}</p>
    </div>
  )
}

function featureTitle(key: FeatureKey): string {
  switch (key) {
    case 'earn-rules': return 'Earn rules'
    case 'reward-tiers': return 'Reward tiers'
    case 'bonus-rules': return 'Bonus rules'
    case 'referral': return 'Referral program'
    case 'brand-voice': return 'Brand voice'
  }
}

function FeatureCards({ featureKey, program }: { featureKey: FeatureKey; program: LoyaltyProgram }) {
  switch (featureKey) {
    case 'earn-rules': {
      const rules = program.earn_rules
      return (
        <>
          {rules.dollar_spend?.explanation && (
            <Card>{String(rules.dollar_spend.explanation)}</Card>
          )}
          {rules.rebook_on_spot?.explanation && (
            <Card>{String(rules.rebook_on_spot.explanation)}</Card>
          )}
        </>
      )
    }
    case 'reward-tiers':
      return Array.isArray(program.reward_tiers) && program.reward_tiers.length > 0 ? (
        <>
          {program.reward_tiers.map((tier: Record<string, unknown>, i: number) => (
            <Card key={i}>
              {[
                String(tier.tier_name ?? `Tier ${i + 1}`),
                tier.qualification_threshold ? `Threshold: ${tier.qualification_threshold}` : null,
                Array.isArray(tier.perks) ? (tier.perks as string[]).join('\n') : null,
              ].filter(Boolean).join('\n')}
            </Card>
          ))}
        </>
      ) : <Card>No reward tiers configured</Card>
    case 'bonus-rules':
      return program.bonus_rule?.explanation ? (
        <Card>{String(program.bonus_rule.explanation)}</Card>
      ) : <Card>No bonus rule configured</Card>
    case 'referral':
      return <Card>{(program.referral_rules?.explanation as string) || 'No referral program configured'}</Card>
    case 'brand-voice':
      return (
        <>
          <Card>{program.brand_voice_summary}</Card>
        </>
      )
  }
}

export default function ProgramFeaturePage() {
  const { feature } = useParams<{ feature: string }>()
  const { state } = useLocation()
  const navigate = useNavigate()

  const program = state?.program as LoyaltyProgram | undefined
  const featureKey = feature as FeatureKey

  if (!program) {
    navigate('/program', { replace: true })
    return null
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 px-4 pt-safe pb-32">

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <button
            className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg shrink-0"
            onClick={() => navigate('/program')}
          >
            <ArrowLeft className="w-4 h-4 text-zinc-700" />
          </button>
          <p className="text-[30px] font-semibold text-black leading-tight tracking-[-0.5px]">
            {featureTitle(featureKey)}
          </p>
        </div>

        {/* Content cards */}
        <div className="flex flex-col gap-3">
          <FeatureCards featureKey={featureKey} program={program} />
        </div>
      </div>
      <BottomNav active="program" />
    </div>
  )
}

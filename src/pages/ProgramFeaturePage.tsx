import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { LoyaltyProgram, EarnRule, RewardTier, BonusRule } from '@/types'
import { BottomNav } from '@/components/BottomNav'

type FeatureKey = 'currency' | 'earn-rules' | 'reward-tiers' | 'bonus-rules' | 'brand-voice'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-100 rounded-lg p-4">
      <p className="text-base text-zinc-900 leading-6 whitespace-pre-line">{children}</p>
    </div>
  )
}

function featureTitle(key: FeatureKey): string {
  switch (key) {
    case 'currency': return 'Program currency'
    case 'earn-rules': return 'Earn rules'
    case 'reward-tiers': return 'Reward tiers'
    case 'bonus-rules': return 'Bonus rules'
    case 'brand-voice': return 'Brand voice'
  }
}

function FeatureCards({ featureKey, program }: { featureKey: FeatureKey; program: LoyaltyProgram }) {
  switch (featureKey) {
    case 'currency':
      return (
        <>
          <Card>{program.currency_name}</Card>
          <Card>{`Customers earn ${program.currency_name} for every qualifying visit or purchase.`}</Card>
        </>
      )
    case 'earn-rules':
      return (
        <>
          {program.earn_rules.map((rule: EarnRule) => (
            <Card key={rule.label}>
              {[
                rule.label,
                rule.description,
                rule.points_per_dollar != null
                  ? `${rule.points_per_dollar} point${rule.points_per_dollar !== 1 ? 's' : ''} per $1 spent`
                  : null,
                rule.points_per_visit != null
                  ? `${rule.points_per_visit} point${rule.points_per_visit !== 1 ? 's' : ''} per visit`
                  : null,
              ]
                .filter(Boolean)
                .join('\n')}
            </Card>
          ))}
        </>
      )
    case 'reward-tiers':
      return (
        <>
          {program.reward_tiers.map((tier: RewardTier) => (
            <Card key={tier.name}>
              {`${tier.name}\n${tier.points_required} points required\n${tier.reward_description}`}
            </Card>
          ))}
        </>
      )
    case 'bonus-rules':
      return (
        <>
          {program.bonus_rules.map((rule: BonusRule) => (
            <Card key={rule.label}>
              {[
                rule.label,
                rule.description,
                rule.multiplier != null ? `${rule.multiplier}× multiplier` : null,
              ]
                .filter(Boolean)
                .join('\n')}
            </Card>
          ))}
        </>
      )
    case 'brand-voice':
      return (
        <>
          <Card>{program.brand_voice_summary}</Card>
          {program.referral_description ? <Card>{program.referral_description}</Card> : null}
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

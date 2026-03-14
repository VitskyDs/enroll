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
      const ds = program.earn_rules?.dollar_spend as Record<string, unknown> | undefined
      const rb = program.earn_rules?.rebook_on_spot as Record<string, unknown> | undefined
      const cur = program.currency_name
      const dsText = ds?.points_per_dollar != null
        ? `Earn ${ds.points_per_dollar} ${cur} for every dollar you spend.`
        : ds?.cashback_percent != null
          ? `Earn ${ds.cashback_percent}% back on every dollar you spend.`
          : ds?.spend_tracked
            ? 'Every dollar you spend counts toward your membership tier.'
            : null
      const rbText = rb?.bonus_points != null
        ? `Book your next appointment before leaving and earn ${rb.bonus_points} bonus ${cur}.`
        : rb?.bonus_credit_cents != null
          ? `Book your next appointment before leaving and earn $${(Number(rb.bonus_credit_cents) / 100).toFixed(0)} in bonus credit.`
          : rb?.spend_credit_multiplier != null
            ? `Book your next appointment before leaving — your spend counts at ${rb.spend_credit_multiplier}× toward your tier.`
            : null
      return (
        <>
          {dsText && <Card>{dsText}</Card>}
          {rbText && <Card>{rbText}</Card>}
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
    case 'bonus-rules': {
      const rule = program.bonus_rule as Record<string, unknown> | undefined
      if (!rule) return <Card>No bonus rule configured</Card>
      const cur = program.currency_name
      const trigger = (rule.trigger as string | undefined) ?? ''
      const label = trigger.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).toLowerCase()
      let text = ''
      if (rule.unit === 'multiplier') text = `Earn ${rule.value ?? 2}× ${cur} during your ${label}.`
      else if (rule.unit === 'flat_credit') text = `Get $${(Number(rule.bonus_credit_cents ?? 0) / 100).toFixed(0)} in bonus credit on your ${label}.`
      else if (rule.unit === 'percent_off_next_purchase') text = `Get ${rule.value}% off on your ${label}.`
      else text = `Get ${rule.value} bonus ${cur} on your ${label}.`
      return <Card>{text}</Card>
    }
    case 'referral': {
      const ref = program.referral_rules as Record<string, unknown> | undefined
      if (!ref) return <Card>No referral program configured</Card>
      const cur = program.currency_name
      const r = ref.referrer_reward
      const e = ref.referee_reward
      const text = r != null && e != null
        ? `Refer a friend — you earn ${r} ${cur}, they earn ${e}.`
        : ref.referrer_reward_credit_cents != null
          ? `Refer a friend and earn $${(Number(ref.referrer_reward_credit_cents) / 100).toFixed(0)} in store credit.`
          : 'Both you and your friend get rewarded.'
      return <Card>{text}</Card>
    }
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

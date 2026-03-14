import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Volume2, Award, Zap, DollarSign, CalendarCheck, Gift, Clock,
  Star, UserPlus, TrendingUp, ChevronDown, ChevronUp,
} from 'lucide-react'
import { saveToSupabase } from '@/services/saveToSupabase'
import { PROGRAM_TYPE_LABELS } from '@/services/recommendProgram'
import type { BusinessOnboardingData, LoyaltyProgram, ProgramRecommendation, ProgramType, Service } from '@/types'

// ---------------------------------------------------------------------------
// Location state
// ---------------------------------------------------------------------------

interface LocationState {
  onboardingData: BusinessOnboardingData & { services: Service[] }
  recommendation: ProgramRecommendation
  program: LoyaltyProgram
}

// ---------------------------------------------------------------------------
// Typed sub-structures for the new schema
// ---------------------------------------------------------------------------

interface EarnRules {
  dollar_spend: { points_per_dollar?: number; cashback_percent?: number; spend_tracked?: boolean; explanation: string }
  rebook_on_spot: { bonus_points?: number; bonus_credit_cents?: number; spend_credit_multiplier?: number; explanation: string }
}

interface BonusRule {
  trigger: string
  value?: number
  unit?: string
  bonus_credit_cents?: number
  reward_description?: string
  explanation: string
}

interface ReferralRules {
  referrer_reward?: number
  referrer_reward_credit_cents?: number
  referee_reward?: number
  referee_reward_credit_cents?: number
  trigger: string
  explanation: string
}

interface RedemptionRules {
  redemption_value?: string
  mechanism?: string
  minimum_to_redeem?: number
  partial_redemption_allowed?: boolean
  explanation: string
}

interface PointsExpiryRules {
  expiry_policy?: string
  expires_after_inactivity_days?: number
  explanation?: string
}

interface TierItem {
  tier_name: string
  tier_rank: number
  qualification_threshold: string
  perks: string[]
  explanation?: string
}

interface TierProgression {
  starting_tier?: string
  upgrade_timing?: string
  downgrade_policy?: string
  downgrade_warning?: string
  qualification_period?: string
  explanation?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a bonus_rule trigger key into a readable label */
function formatTrigger(trigger: string): string {
  const map: Record<string, string> = {
    birthday_month: 'Birthday month',
    first_purchase: 'First visit',
    first_visit: 'First visit',
    spend_threshold: 'Spend milestone',
    spend_threshold_monthly: 'Monthly spend milestone',
    tier_upgrade: 'Tier upgrade',
    double_points_day: 'Double points day',
    anniversary_of_enrollment: 'Membership anniversary',
    visit_milestone: 'Visit milestone',
  }
  return map[trigger] ?? trigger.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Format a bonus_rule value into a concise badge label */
function formatBonusValue(rule: BonusRule): string {
  if (!rule.unit) return rule.value != null ? `+${rule.value}` : ''
  if (rule.unit === 'multiplier') return `${rule.value ?? 2}×`
  if (rule.unit === 'bonus_points') return `+${rule.value} pts`
  if (rule.unit === 'flat_credit') {
    const cents = rule.bonus_credit_cents ?? (rule.value != null ? rule.value * 100 : 0)
    return `+$${(cents / 100).toFixed(0)}`
  }
  if (rule.unit === 'percent_off_next_purchase') return `${rule.value}% off`
  return rule.value != null ? String(rule.value) : ''
}

/** Hero gradient per program type */
const PROGRAM_GRADIENTS: Record<ProgramType | 'default', string> = {
  points: 'from-amber-50 to-orange-100',
  tiered: 'from-blue-50 to-indigo-100',
  cashback: 'from-emerald-50 to-teal-100',
  punch_card: 'from-rose-50 to-pink-100',
  coalition: 'from-purple-50 to-violet-100',
  points_tiers: 'from-sky-50 to-cyan-100',
  default: 'from-zinc-100 to-zinc-200',
}

/** Large icon per program type for the hero */
const PROGRAM_HERO_ICONS: Partial<Record<ProgramType, React.ReactNode>> = {
  points: <Zap className="w-8 h-8 text-amber-500" />,
  tiered: <TrendingUp className="w-8 h-8 text-indigo-500" />,
  cashback: <DollarSign className="w-8 h-8 text-emerald-500" />,
  punch_card: <Star className="w-8 h-8 text-rose-500" />,
  coalition: <UserPlus className="w-8 h-8 text-violet-500" />,
  points_tiers: <Award className="w-8 h-8 text-sky-500" />,
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-12 h-12 rounded-[2px] bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-500">
      {children}
    </div>
  )
}

function CardItem({
  icon,
  label,
  description,
  badge,
  alignItems = 'center',
}: {
  icon: React.ReactNode
  label: React.ReactNode
  description: string
  badge?: React.ReactNode
  alignItems?: 'center' | 'start'
}) {
  return (
    <div className={`bg-white border border-zinc-200 rounded-lg flex gap-4 items-${alignItems} p-4`}>
      <IconBox>{icon}</IconBox>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="text-[15px] font-medium text-zinc-900 leading-6 flex-1">{label}</p>
          {badge}
        </div>
        <p className="text-sm font-medium text-zinc-500 leading-5">{description}</p>
      </div>
    </div>
  )
}

function TierBadge({ rank, label }: { rank: number; label: string }) {
  const styles = [
    'bg-zinc-100 text-zinc-700',
    'bg-blue-50 text-blue-900',
    'bg-green-50 text-green-900',
  ]
  const cls = styles[rank - 1] ?? styles[0]
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0 ${cls}`}>{label}</span>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[20px] font-semibold text-black leading-6 tracking-[0]">{title}</h2>
      {subtitle && <p className="text-base text-zinc-600 leading-6">{subtitle}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProgramPreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const savedRef = useRef(false)
  const [tncOpen, setTncOpen] = useState(false)

  useEffect(() => {
    if (!state || savedRef.current) return
    savedRef.current = true
    const { onboardingData, program } = state
    saveToSupabase(onboardingData, onboardingData.services ?? [], program).catch(() => {})
  }, [state])

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-zinc-500">No program data found.</p>
      </div>
    )
  }

  const { program } = state

  // Typed data access
  const earnRules = program.earn_rules as EarnRules
  const bonusRule = program.bonus_rule as BonusRule
  const referralRules = program.referral_rules as ReferralRules
  const redemptionRules = program.redemption_rules as RedemptionRules
  const pointsExpiry = program.points_expiry_rules as PointsExpiryRules
  const rewardTiers = Array.isArray(program.reward_tiers) ? (program.reward_tiers as TierItem[]) : []
  const tierProgression = program.tier_progression_rules as TierProgression | null
  const isTiered = rewardTiers.length > 0

  const heroGradient = PROGRAM_GRADIENTS[program.program_type] ?? PROGRAM_GRADIENTS.default
  const heroIcon = PROGRAM_HERO_ICONS[program.program_type] ?? <Award className="w-8 h-8 text-zinc-400" />

  // Earn rule earn-rate label
  const dollarSpendLabel = earnRules?.dollar_spend?.points_per_dollar != null
    ? `${earnRules.dollar_spend.points_per_dollar} ${program.currency_name} per $1`
    : earnRules?.dollar_spend?.cashback_percent != null
      ? `${earnRules.dollar_spend.cashback_percent}% cash back`
      : 'Spend tracking'

  // Bonus badge
  const bonusBadge = bonusRule ? formatBonusValue(bonusRule) : null

  // Referral reward text
  const referrerAmt = referralRules?.referrer_reward
  const refereeAmt = referralRules?.referee_reward
  const referralRewardText = referrerAmt != null && refereeAmt != null
    ? `You earn ${referrerAmt} ${program.currency_name} · friend earns ${refereeAmt}`
    : referralRules?.referrer_reward_credit_cents != null
      ? `You earn $${(referralRules.referrer_reward_credit_cents / 100).toFixed(0)}`
      : 'Both parties rewarded'

  // Expiry is relevant for non-tiered, non-"not applicable" policies
  const showExpiry =
    pointsExpiry?.expires_after_inactivity_days != null &&
    pointsExpiry.expiry_policy !== 'not applicable'

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="bg-white flex h-[76px] items-end justify-center px-4 pb-4 pt-10">
          <p className="flex-1 text-[30px] font-semibold text-zinc-950 leading-[30px] tracking-[-1px]">
            Your loyalty program
          </p>
        </div>

        <div className="flex flex-col gap-6 px-4 pb-6">

          {/* ── Section 1: Program overview ── */}
          <div className="flex flex-col gap-6">

            {/* Hero banner */}
            <div className={`w-full h-[136px] rounded-sm bg-gradient-to-br ${heroGradient} flex items-center justify-center relative overflow-hidden`}>
              {/* Subtle dot grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, #71717a 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                }}
              />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  {heroIcon}
                </div>
              </div>
            </div>

            {/* Program name + purpose */}
            <div className="flex flex-col gap-1">
              <p className="text-[20px] font-semibold text-black leading-6">
                {program.program_name}
              </p>
              {program.program_name_explanation && (
                <p className="text-xs text-zinc-400 leading-5">{program.program_name_explanation}</p>
              )}
              <p className="text-base text-zinc-600 leading-6 mt-1">
                {program.program_purpose}
              </p>
            </div>

            {/* Overview cards */}
            <div className="flex flex-col gap-4">

              {/* Brand voice */}
              <CardItem
                icon={<Volume2 className="w-5 h-5" />}
                label="Brand voice"
                description={program.brand_voice_summary}
                alignItems="start"
              />

              {/* Program type */}
              <CardItem
                icon={<Award className="w-5 h-5" />}
                label={PROGRAM_TYPE_LABELS[program.program_type]}
                description={program.program_type_reason}
                alignItems="start"
              />

              {/* Currency */}
              <CardItem
                icon={<Zap className="w-5 h-5" />}
                label={program.currency_name}
                description={program.currency_name_explanation}
                alignItems="start"
              />

              {/* Earn: dollar spend */}
              <CardItem
                icon={<DollarSign className="w-5 h-5" />}
                label={dollarSpendLabel}
                description={earnRules?.dollar_spend?.explanation ?? ''}
              />

              {/* Earn: rebook on spot */}
              <CardItem
                icon={<CalendarCheck className="w-5 h-5" />}
                label="Rebook on the spot"
                description={earnRules?.rebook_on_spot?.explanation ?? ''}
              />

              {/* Redemption */}
              {redemptionRules?.explanation && (
                <CardItem
                  icon={<Gift className="w-5 h-5" />}
                  label={redemptionRules.redemption_value ?? 'Redemption'}
                  description={redemptionRules.explanation}
                  alignItems="start"
                />
              )}

              {/* Points expiry */}
              {showExpiry && (
                <CardItem
                  icon={<Clock className="w-5 h-5" />}
                  label={`${pointsExpiry.expires_after_inactivity_days}-day activity window`}
                  description={pointsExpiry.explanation ?? `${program.currency_name} expire after ${pointsExpiry.expires_after_inactivity_days} days of inactivity.`}
                />
              )}

            </div>
          </div>

          {/* ── Section 2: Reward tiers (tiered programs only) ── */}
          {isTiered && (
            <div className="flex flex-col gap-4">
              <SectionHeading
                title={`${rewardTiers.length} membership tiers`}
                subtitle={tierProgression?.explanation ?? [
                  tierProgression?.starting_tier,
                  tierProgression?.upgrade_timing,
                ].filter(Boolean).join(' · ')}
              />

              <div className="flex flex-col gap-4">
                {rewardTiers.map((tier) => (
                  <div
                    key={tier.tier_rank}
                    className="bg-white border border-zinc-200 rounded-lg flex gap-4 items-start p-4"
                  >
                    <IconBox>
                      <TrendingUp className="w-5 h-5" />
                    </IconBox>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 w-full">
                        <p className="text-[15px] font-medium text-zinc-900 leading-6 flex-1">{tier.tier_name}</p>
                        <TierBadge rank={tier.tier_rank} label={tier.qualification_threshold} />
                      </div>
                      {(tier.explanation || tier.perks?.length > 0) && (
                        <p className="text-sm font-medium text-zinc-500 leading-5">
                          {tier.explanation ?? tier.perks.slice(0, 2).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {tierProgression?.downgrade_warning && (
                <p className="text-base text-zinc-600 leading-6">{tierProgression.downgrade_warning}</p>
              )}
            </div>
          )}

          {/* ── Section 3: Bonus rewards ── */}
          {bonusRule && (
            <div className="flex flex-col gap-4">
              <SectionHeading
                title="Bonus rewards"
                subtitle={bonusRule.explanation}
              />
              <div className="flex flex-col gap-4">
                <CardItem
                  icon={<Star className="w-5 h-5" />}
                  label={formatTrigger(bonusRule.trigger)}
                  description={bonusRule.explanation}
                  badge={
                    bonusBadge ? (
                      <span className="bg-zinc-100 text-zinc-700 text-xs font-semibold px-2 py-0.5 rounded-lg shrink-0">
                        {bonusBadge}
                      </span>
                    ) : undefined
                  }
                />
              </div>
            </div>
          )}

          {/* ── Section 4: Referral program ── */}
          {referralRules && (
            <div className="flex flex-col gap-4">
              <SectionHeading
                title="Referral program"
                subtitle={referralRules.explanation}
              />
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-zinc-200 rounded-lg flex flex-col items-center gap-4 p-4">
                  {/* Overlapping avatar illustration */}
                  <div className="flex items-center pr-4">
                    <div className="w-[68px] h-[68px] rounded-full bg-zinc-200 flex items-center justify-center z-10 ring-2 ring-white">
                      <UserPlus className="w-7 h-7 text-zinc-500" />
                    </div>
                    <div className="w-[68px] h-[68px] rounded-full bg-zinc-100 flex items-center justify-center -ml-4 ring-2 ring-white">
                      <UserPlus className="w-7 h-7 text-zinc-400" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-center w-full">
                    <p className="text-[15px] font-medium text-zinc-900 leading-6 text-center">Refer a friend</p>
                    <p className="text-sm font-medium text-zinc-500 leading-5 text-center">{referralRewardText}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── T&C link / expandable ── */}
          <div className="flex flex-col">
            <button
              onClick={() => setTncOpen(v => !v)}
              className="flex items-center gap-1 text-sm font-medium text-zinc-900 py-2"
            >
              Read program T&C
              {tncOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {tncOpen && program.terms_and_conditions && (
              <div className="mt-2 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                <p className="text-xs text-zinc-500 leading-5 whitespace-pre-wrap font-mono">
                  {program.terms_and_conditions}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Pinned action footer ── */}
      <div className="bg-white px-4 pt-4 pb-6 flex flex-col gap-2 shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full h-10 rounded-lg bg-zinc-900 text-white text-sm font-medium"
        >
          Done
        </button>
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full h-10 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium"
        >
          Start over
        </button>
      </div>
    </div>
  )
}

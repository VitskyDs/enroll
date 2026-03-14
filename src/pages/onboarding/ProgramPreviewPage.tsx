import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Megaphone, Settings2, Coins, ClipboardCheck, CalendarCheck, TicketCheck,
  Gift, Flag, Trophy, Crown, Users, ChevronDown, ChevronUp,
} from 'lucide-react'
import { saveToSupabase } from '@/services/saveToSupabase'
import { PROGRAM_TYPE_LABELS } from '@/services/recommendProgram'
import type { BusinessOnboardingData, LoyaltyProgram, ProgramRecommendation, Service } from '@/types'
import { DEMO_PROGRAM, DEMO_ONBOARDING_DATA, DEMO_RECOMMENDATION } from '@/data/demoData'

// ---------------------------------------------------------------------------
// Location state
// ---------------------------------------------------------------------------

interface LocationState {
  onboardingData: BusinessOnboardingData & { services: Service[] }
  recommendation: ProgramRecommendation
  program: LoyaltyProgram
}

// ---------------------------------------------------------------------------
// Typed sub-structures
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

function formatBonusValue(rule: BonusRule): string {
  if (!rule.unit) return rule.value != null ? `+${rule.value}` : ''
  if (rule.unit === 'multiplier') return `${rule.value ?? 2}×`
  if (rule.unit === 'bonus_points') return `+${rule.value}`
  if (rule.unit === 'flat_credit') {
    const cents = rule.bonus_credit_cents ?? (rule.value != null ? rule.value * 100 : 0)
    return `+$${(cents / 100).toFixed(0)}`
  }
  if (rule.unit === 'percent_off_next_purchase') return `${rule.value}% off`
  return rule.value != null ? String(rule.value) : ''
}

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** 48×48 icon box matching the Figma spec */
function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-100 rounded-[2px] shrink-0 size-12 relative overflow-hidden">
      <div className="absolute left-3 top-3 size-6 text-zinc-600 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

/** Standard row card: icon box + title (+ optional badge) + description */
function RowCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode
  title: React.ReactNode
  description?: string
  badge?: React.ReactNode
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg flex items-start gap-3 p-3">
      <IconBox>{icon}</IconBox>
      <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
        <div className="flex items-center gap-2">
          <p className="flex-1 text-[15px] font-medium text-zinc-900 leading-6 min-w-0">{title}</p>
          {badge}
        </div>
        {description && (
          <p className="text-sm font-medium text-zinc-500 leading-5">{description}</p>
        )}
      </div>
    </div>
  )
}

/** Section heading with optional subtitle */
function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-[20px] font-semibold text-zinc-900 leading-[26px]">{title}</h2>
      {subtitle && <p className="text-base text-zinc-600 leading-6">{subtitle}</p>}
    </div>
  )
}

/** Tier badge with rank-based colour */
function TierBadge({ rank, label }: { rank: number; label: string }) {
  const colours = [
    'bg-zinc-100 text-zinc-700',
    'bg-blue-50 text-blue-800',
    'bg-green-50 text-green-800',
  ]
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${colours[(rank - 1) % colours.length]}`}>
      {label}
    </span>
  )
}

const TIER_ICONS = [
  <Flag className="size-5" />,
  <Trophy className="size-5" />,
  <Crown className="size-5" />,
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProgramPreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = location.state as LocationState | null
  // Dev-only fallback so the page can be inspected at /onboarding/preview without routing state
  const state: LocationState | null = routeState ?? (
    import.meta.env.DEV
      ? { onboardingData: { ...DEMO_ONBOARDING_DATA }, recommendation: DEMO_RECOMMENDATION, program: DEMO_PROGRAM }
      : null
  )
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

  const earnRules = program.earn_rules as EarnRules
  const bonusRule = program.bonus_rule as BonusRule
  const referralRules = program.referral_rules as ReferralRules
  const redemptionRules = program.redemption_rules as RedemptionRules
  const pointsExpiry = program.points_expiry_rules as PointsExpiryRules
  const rewardTiers = Array.isArray(program.reward_tiers) ? (program.reward_tiers as TierItem[]) : []
  const tierProgression = program.tier_progression_rules as TierProgression | null
  const isTiered = rewardTiers.length > 0

  // Earn rule title label (dollar spend card)
  const dollarSpendTitle =
    earnRules?.dollar_spend?.points_per_dollar != null
      ? `${earnRules.dollar_spend.points_per_dollar} ${program.currency_name} per $1`
      : earnRules?.dollar_spend?.cashback_percent != null
        ? `${earnRules.dollar_spend.cashback_percent}% cash back per $1`
        : 'Earn on every dollar'

  // Referral reward text
  const referrerAmt = referralRules?.referrer_reward
  const refereeAmt = referralRules?.referee_reward
  const referralRewardText =
    referrerAmt != null && refereeAmt != null
      ? `You earn ${referrerAmt} ${program.currency_name} · friend earns ${refereeAmt}`
      : referralRules?.referrer_reward_credit_cents != null
        ? `You earn $${(referralRules.referrer_reward_credit_cents / 100).toFixed(0)} credit`
        : 'Both parties rewarded'

  const showExpiry =
    pointsExpiry?.expires_after_inactivity_days != null &&
    pointsExpiry.expiry_policy !== 'not applicable' &&
    !!pointsExpiry.explanation

  const bonusValueLabel = bonusRule ? formatBonusValue(bonusRule) : null

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* ── Fixed header ── */}
      <div className="bg-white flex h-[120px] items-end justify-center overflow-hidden pb-4 pt-[var(--safe-area-inset-top,0px)]">
        <div className="flex flex-1 h-9 items-center gap-4 px-4">
          <p className="flex-1 text-[30px] font-semibold text-zinc-950 leading-[34px] tracking-[-0.5px]">
            Your loyalty program
          </p>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 px-4 pb-6">

          {/* ── Section 1: Overview ── */}
          <div className="flex flex-col gap-6">

            {/* Hero image placeholder */}
            <div className="bg-zinc-100 h-[136px] rounded-sm shrink-0 w-full" />

            {/* Program name + purpose */}
            <div className="flex flex-col gap-1">
              <p className="text-[20px] font-semibold text-zinc-900 leading-[26px]">
                {program.program_name}
              </p>
              <p className="text-base text-zinc-600 leading-6">
                {program.program_purpose}
              </p>
            </div>

            {/* Overview cards */}
            <div className="flex flex-col gap-4">

              {/* Brand voice */}
              <RowCard
                icon={<Megaphone className="size-5" />}
                title="Brand voice"
                description={program.brand_voice_summary}
              />

              {/* Program type */}
              <RowCard
                icon={<Settings2 className="size-5" />}
                title={PROGRAM_TYPE_LABELS[program.program_type]}
                description={program.program_type_reason}
              />

              {/* Currency */}
              <RowCard
                icon={<Coins className="size-5" />}
                title={program.currency_name}
                description={program.currency_name_explanation}
              />

              {/* Earn: dollar spend */}
              <RowCard
                icon={<ClipboardCheck className="size-5" />}
                title={dollarSpendTitle}
                description={earnRules?.dollar_spend?.explanation}
              />

              {/* Earn: rebook on spot */}
              {earnRules?.rebook_on_spot?.explanation && (
                <RowCard
                  icon={<CalendarCheck className="size-5" />}
                  title="Rebook on the spot"
                  description={earnRules.rebook_on_spot.explanation}
                />
              )}

              {/* Redemption */}
              {redemptionRules?.explanation && (
                <RowCard
                  icon={<TicketCheck className="size-5" />}
                  title={redemptionRules.redemption_value ?? 'Redemption'}
                  description={redemptionRules.explanation}
                />
              )}

            </div>
          </div>

          {/* ── Section 2: Reward tiers (tiered programs only) ── */}
          {isTiered && (
            <div className="flex flex-col gap-4">
              <SectionHeading
                title={`${rewardTiers.length} membership tiers`}
                subtitle={
                  tierProgression?.explanation ??
                  [tierProgression?.starting_tier, tierProgression?.upgrade_timing]
                    .filter(Boolean)
                    .join(' · ')
                }
              />

              <div className="flex flex-col gap-4">
                {rewardTiers.map((tier, i) => (
                  <RowCard
                    key={tier.tier_rank}
                    icon={TIER_ICONS[i % TIER_ICONS.length]}
                    title={tier.tier_name}
                    description={tier.explanation ?? tier.perks?.slice(0, 2).join(' · ')}
                    badge={<TierBadge rank={tier.tier_rank} label={tier.qualification_threshold} />}
                  />
                ))}
              </div>

              {(tierProgression?.qualification_period || tierProgression?.downgrade_warning) && (
                <p className="text-base text-zinc-600 leading-6">
                  {[tierProgression.qualification_period, tierProgression.downgrade_warning]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
          )}

          {/* ── Section 3: Bonus rewards ── */}
          {bonusRule && (
            <div className="flex flex-col gap-4">
              <SectionHeading title="Bonus rewards" subtitle={bonusRule.explanation} />
              <div className="flex flex-col gap-4">
                <RowCard
                  icon={<Gift className="size-5" />}
                  title={formatTrigger(bonusRule.trigger)}
                  description={bonusRule.explanation}
                  badge={
                    bonusValueLabel ? (
                      <span className="bg-zinc-100 text-zinc-700 text-xs font-semibold px-2 py-0.5 rounded shrink-0">
                        {bonusValueLabel}
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
              <SectionHeading title="Referral program" subtitle={referralRules.explanation} />
              <div className="bg-white border border-zinc-200 rounded-lg flex items-start gap-3 p-3">
                {/* Overlapping avatar circles */}
                <div className="flex items-center pr-2 shrink-0">
                  <div className="size-[52px] rounded-full bg-zinc-200 flex items-center justify-center z-10 ring-2 ring-white">
                    <Users className="size-5 text-zinc-500" />
                  </div>
                  <div className="size-[52px] rounded-full bg-zinc-300 flex items-center justify-center -ml-3 ring-2 ring-white">
                    <Users className="size-5 text-zinc-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
                  <p className="text-[15px] font-medium text-zinc-900 leading-6">Refer a friend</p>
                  <p className="text-sm font-medium text-zinc-500 leading-5">{referralRewardText}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Points expiry compact section ── */}
          {showExpiry && (
            <div className="flex flex-col gap-1">
              <p className="text-[20px] font-semibold text-zinc-900 leading-[26px]">Points expiry</p>
              <p className="text-sm font-medium text-zinc-500 leading-5">{pointsExpiry.explanation}</p>
            </div>
          )}

          {/* ── T&C ── */}
          <div className="flex flex-col">
            <button
              onClick={() => setTncOpen(v => !v)}
              className="flex items-center gap-1 px-0 py-2 text-sm font-medium text-zinc-900 min-h-9"
            >
              Read program T&C
              {tncOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {tncOpen && program.terms_and_conditions && (
              <div className="mt-1 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                <p className="text-xs text-zinc-500 leading-5 whitespace-pre-wrap font-mono">
                  {program.terms_and_conditions}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Pinned footer ── */}
      <div className="bg-white px-4 pt-3 pb-6 flex flex-col gap-2 shrink-0">
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

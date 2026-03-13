import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { saveToSupabase } from '@/services/saveToSupabase'
import type { BusinessOnboardingData, LoyaltyProgram, ProgramRecommendation, Service } from '@/types'
import { PROGRAM_TYPE_LABELS } from '@/services/recommendProgram'

interface LocationState {
  onboardingData: BusinessOnboardingData & { services: Service[] }
  recommendation: ProgramRecommendation
  program: LoyaltyProgram
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full">{children}</span>
  )
}

// Safely converts an unknown value to a string; returns null if absent
function s(v: unknown): string | null {
  return v != null ? String(v) : null
}

export default function ProgramPreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const savedRef = useRef(false)

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

  const { program, recommendation } = state

  const earnRules = program.earn_rules as Record<string, unknown>
  const qualifyingActions = Array.isArray(earnRules.qualifying_actions)
    ? (earnRules.qualifying_actions as Record<string, unknown>[])
    : []
  const rewardTiers = Array.isArray(program.reward_tiers)
    ? (program.reward_tiers as Record<string, unknown>[])
    : []
  const bonusRules = Array.isArray(program.bonus_rules)
    ? (program.bonus_rules as Record<string, unknown>[])
    : []
  const redemptionRules = program.redemption_rules as Record<string, unknown>
  const expiryRules = program.points_expiry_rules as Record<string, unknown> | null

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Scrollable content — header + program details */}
      <div className="flex-1 overflow-y-auto px-4 pt-safe pb-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1 pt-6 pb-2">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Your program</p>
          <h1 className="text-2xl font-semibold leading-8">{program.program_name}</h1>
          <p className="text-base text-zinc-500">{PROGRAM_TYPE_LABELS[recommendation.program_type]}</p>
        </div>

        {/* Earn rules */}
        <Section title="How customers earn">
          <div className="flex flex-col gap-2">
            {s(earnRules.base_rate) != null && (
              <p className="text-sm font-medium text-zinc-900">{s(earnRules.base_rate)}</p>
            )}
            {qualifyingActions.map((action, i) => (
              <div key={i} className="text-sm text-zinc-600">
                <span className="font-medium capitalize">{String(action.action ?? '').replace(/_/g, ' ')}</span>
                {s(action.rate) != null ? ` — ${s(action.rate)}` : null}
                {action.bonus_sips != null ? ` — +${s(action.bonus_sips)} ${program.currency_name}` : null}
                {action.bonus_credit != null ? ` — +$${s(action.bonus_credit)}` : null}
                {s(action.multiplier) != null ? ` — ${s(action.multiplier)}x` : null}
                {s(action.notes) != null ? <span className="text-zinc-400"> ({s(action.notes)})</span> : null}
              </div>
            ))}
          </div>
        </Section>

        {/* Redemption */}
        <Section title="How customers redeem">
          <div className="flex flex-col gap-1.5 text-sm text-zinc-600">
            {s(redemptionRules.redemption_value) != null && (
              <p className="font-medium text-zinc-900">{s(redemptionRules.redemption_value)}</p>
            )}
            {s(redemptionRules.redemption_rate_display) != null && <p>{s(redemptionRules.redemption_rate_display)}</p>}
            {s(redemptionRules.mechanism) != null && <p>{s(redemptionRules.mechanism)}</p>}
            {redemptionRules.minimum_to_redeem != null && (
              <p>Minimum to redeem: {s(redemptionRules.minimum_to_redeem)} {program.currency_name}</p>
            )}
          </div>
        </Section>

        {/* Reward tiers (if applicable) */}
        {rewardTiers.length > 0 && (
          <Section title="Membership tiers">
            <div className="flex flex-col gap-4">
              {rewardTiers.map((tier, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-zinc-900">{s(tier.tier_name) ?? `Tier ${i + 1}`}</p>
                  {s(tier.qualification_threshold) != null && (
                    <p className="text-xs text-zinc-500 mb-1">{s(tier.qualification_threshold)}</p>
                  )}
                  {Array.isArray(tier.perks) && (
                    <ul className="list-disc list-inside flex flex-col gap-0.5">
                      {(tier.perks as string[]).map((perk, j) => (
                        <li key={j} className="text-sm text-zinc-600">{perk}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Bonus rules */}
        {bonusRules.length > 0 && (
          <Section title="Bonus rewards">
            <div className="flex flex-col gap-2">
              {bonusRules.map((rule, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-zinc-900 capitalize">{String(rule.trigger ?? '').replace(/_/g, ' ')}</span>
                  {s(rule.multiplier) != null ? <span className="text-zinc-600"> — {s(rule.multiplier)}x points</span> : null}
                  {rule.bonus_sips != null ? <span className="text-zinc-600"> — +{s(rule.bonus_sips)} {program.currency_name}</span> : null}
                  {rule.bonus_credit != null ? <span className="text-zinc-600"> — +${s(rule.bonus_credit)}</span> : null}
                  {s(rule.reward) != null ? <span className="text-zinc-600"> — {s(rule.reward)}</span> : null}
                  {s(rule.notes) != null ? <p className="text-zinc-400 text-xs mt-0.5">{s(rule.notes)}</p> : null}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Referral */}
        {program.referral_description && (
          <Section title="Referral program">
            <p className="text-sm text-zinc-600">{program.referral_description}</p>
          </Section>
        )}

        {/* Brand voice */}
        {program.brand_voice_summary && (
          <Section title="Brand voice">
            <p className="text-sm text-zinc-600 italic">"{program.brand_voice_summary}"</p>
          </Section>
        )}

        {/* Metadata pills */}
        <div className="flex flex-wrap gap-2">
          <Pill>Currency: {program.currency_name}</Pill>
          {expiryRules?.expiry_policy != null &&
            s(expiryRules.expiry_policy) !== 'not applicable' &&
            expiryRules.expires_after_inactivity_days != null && (
              <Pill>Points expire after {s(expiryRules.expires_after_inactivity_days)} days inactive</Pill>
          )}
        </div>

      </div>

      {/* CTA — pinned to bottom */}
      <div className="px-4 pb-safe pb-6 pt-4 border-t border-zinc-100 shrink-0">

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 bg-zinc-900 text-white rounded-xl text-base font-semibold"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}

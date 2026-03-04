import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { LoyaltyGoal, LoyaltyProgram, Service } from '@/types'

const GOAL_LABELS: Record<LoyaltyGoal, string> = {
  retention: 'Retain customers',
  frequency: 'Increase recurring revenue',
  referrals: 'Gain new members',
}

const GOAL_PURPOSE: Record<LoyaltyGoal, string> = {
  retention: 'keep your current customers happy and coming back, building long-term loyalty',
  frequency: 'boost predictable income by encouraging repeat purchases and subscriptions',
  referrals: 'attract new customers and expand your community or client base',
}

interface SummaryCardProps {
  title: string
  description: string
}

function SummaryCard({ title, description }: SummaryCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-md px-4 py-4 flex flex-col gap-2">
      <p className="text-base font-semibold text-zinc-900 leading-6">{title}</p>
      <p className="text-sm text-zinc-500 leading-5">{description}</p>
    </div>
  )
}

export default function ConfirmPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { program, businessName, services, goal } = (location.state as {
    program: LoyaltyProgram
    businessName: string
    services: Service[]
    goal: LoyaltyGoal
  }) ?? {}

  if (!program || !businessName) {
    navigate('/onboarding')
    return null
  }

  const primaryEarnRule = program.earn_rules.find((r) => r.points_per_dollar != null)
  const earnDescription = primaryEarnRule
    ? `Customers earn ${primaryEarnRule.points_per_dollar} ${program.currency_name} for every $1 they spend.`
    : program.earn_rules[0]?.description ?? ''

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 pt-14 pb-6 shrink-0">
        <button
          onClick={() => navigate('/onboarding/program')}
          className="flex items-center justify-center w-10 h-10 rounded bg-zinc-100 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-2xl font-semibold leading-8 text-zinc-900">
          Congratulations your loyalty program is ready!
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-6 pb-6">
        {/* Business details */}
        <div className="bg-zinc-50 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-zinc-900 leading-7">Business details</p>
            <p className="text-base text-zinc-500 leading-6">
              This is your loyalty program, built to keep your clients coming back, spending more, and feeling genuinely appreciated.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <SummaryCard
              title={businessName}
              description={program.brand_voice_summary}
            />
            <div className="bg-white border border-zinc-200 rounded-md px-4 py-4 flex flex-col gap-2">
              <p className="text-base font-semibold text-zinc-900 leading-6">Services</p>
              <div className="flex flex-col gap-2">
                {services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <p className="text-sm text-zinc-900">{s.name}</p>
                    {s.price_cents != null && (
                      <p className="text-sm text-zinc-500">${(s.price_cents / 100).toFixed(0)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty plan */}
        <div className="bg-zinc-50 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-zinc-900 leading-7">Loyalty plan</p>
            <p className="text-base text-zinc-500 leading-6">
              This is your loyalty program, built to {goal ? GOAL_PURPOSE[goal] : 'help your business grow'}.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {goal && (
              <SummaryCard
                title={`${GOAL_LABELS[goal]}`}
                description={GOAL_PURPOSE[goal]}
              />
            )}
            <SummaryCard
              title={`${program.program_name}`}
              description={`A tiered points program designed for ${goal ? GOAL_LABELS[goal].toLowerCase() : 'growing your business'}, building long-term loyalty.`}
            />
            <SummaryCard
              title="💰 Earning points"
              description={earnDescription}
            />
            {program.bonus_rules.length > 0 && (
              <SummaryCard
                title="🤝 Referral bonus"
                description={program.bonus_rules[0].description}
              />
            )}
            <div className="bg-white border border-zinc-200 rounded-md px-4 py-4 flex flex-col gap-2">
              <p className="text-base font-semibold text-zinc-900 leading-6">🏅 Tier benefits</p>
              <div className="flex flex-col gap-1.5">
                {program.reward_tiers.map((tier) => (
                  <p key={tier.name} className="text-sm text-zinc-500 leading-5">
                    <span className="font-semibold text-zinc-900">{tier.name} ({tier.points_required.toLocaleString()} pts): </span>
                    {tier.reward_description}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 px-4 py-6 shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full h-12 rounded bg-zinc-900 text-white text-base font-medium"
        >
          Confirm and continue
        </button>
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full h-12 rounded bg-zinc-100 text-zinc-900 text-base font-medium"
        >
          Start over
        </button>
      </div>
    </div>
  )
}

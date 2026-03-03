import type { LoyaltyProgram } from '@/types'

interface Props {
  program: LoyaltyProgram
  businessName: string
  onBack: () => void
}

export function ProgramPreview({ program, businessName, onBack }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          ← Back to chat
        </button>
        <h1 className="text-2xl font-bold">{program.program_name}</h1>
        <p className="text-muted-foreground text-sm mt-1">{businessName}</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Currency
        </h2>
        <p className="text-lg font-medium">{program.currency_name}</p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          How to earn
        </h2>
        <ul className="space-y-2">
          {program.earn_rules.map((rule, i) => (
            <li key={i} className="flex flex-col border border-border rounded-xl px-4 py-3">
              <span className="font-medium text-sm">{rule.label}</span>
              <span className="text-sm text-muted-foreground">{rule.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Reward tiers
        </h2>
        <ul className="space-y-2">
          {program.reward_tiers.map((tier, i) => (
            <li key={i} className="flex items-start justify-between border border-border rounded-xl px-4 py-3 gap-4">
              <div>
                <span className="font-medium text-sm">{tier.name}</span>
                <p className="text-sm text-muted-foreground">{tier.reward_description}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {tier.points_required === 0 ? 'All members' : `${tier.points_required} pts`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Bonus rules
        </h2>
        <ul className="space-y-2">
          {program.bonus_rules.map((rule, i) => (
            <li key={i} className="flex flex-col border border-border rounded-xl px-4 py-3">
              <span className="font-medium text-sm">{rule.label}</span>
              <span className="text-sm text-muted-foreground">{rule.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Referral program
        </h2>
        <p className="text-sm text-muted-foreground border border-border rounded-xl px-4 py-3">
          {program.referral_description}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Brand voice
        </h2>
        <p className="text-sm text-muted-foreground border border-border rounded-xl px-4 py-3">
          {program.brand_voice_summary}
        </p>
      </section>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">Raw draft data</summary>
        <pre className="mt-2 p-3 bg-secondary rounded-lg overflow-auto text-xs">
          {JSON.stringify(program, null, 2)}
        </pre>
      </details>
    </div>
  )
}

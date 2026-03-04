import { Sparkles, Tag, TrendingUp, Crown } from 'lucide-react'
import type { LoyaltyProgram } from '@/types'

type Section = 'overview' | 'name' | 'earn' | 'tiers'

interface Props {
  section: Section
  program: LoyaltyProgram
}

const SECTION_META: Record<Section, { label: string; icon: React.ElementType }> = {
  overview: { label: 'Overview', icon: Sparkles },
  name: { label: 'Program name & type', icon: Tag },
  earn: { label: 'Earning points', icon: TrendingUp },
  tiers: { label: 'Tier benefits', icon: Crown },
}

export function ProgramSectionCard({ section, program }: Props) {
  const { label, icon: Icon } = SECTION_META[section]

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-zinc-900">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 text-white text-xs font-medium mb-3">
        <Icon size={11} />
        {label}
      </span>

      {section === 'overview' && (
        <p className="leading-relaxed">{program.brand_voice_summary}</p>
      )}

      {section === 'name' && (
        <div className="space-y-0.5">
          <p className="font-semibold">{program.program_name}</p>
          <p className="text-muted-foreground text-xs">Points currency: {program.currency_name}</p>
        </div>
      )}

      {section === 'earn' && (
        <div className="space-y-2">
          {program.earn_rules.map((rule, i) => (
            <div key={i}>
              <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                {rule.label}
              </p>
              <p>{rule.description}</p>
            </div>
          ))}
          {program.bonus_rules.length > 0 && (
            <>
              <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mt-3 mb-0.5">
                Bonus rules
              </p>
              {program.bonus_rules.map((rule, i) => (
                <div key={i}>
                  <span className="font-medium">{rule.label}</span>
                  {rule.multiplier != null && (
                    <span className="text-primary ml-1 text-xs">{rule.multiplier}×</span>
                  )}
                  <p className="text-muted-foreground text-xs">{rule.description}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {section === 'tiers' && (
        <div className="space-y-2">
          {program.reward_tiers.map((tier, i) => (
            <div key={i} className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{tier.name}</p>
                <p className="text-muted-foreground text-xs">{tier.reward_description}</p>
              </div>
              <span className="text-xs text-primary font-medium whitespace-nowrap shrink-0">
                {tier.points_required.toLocaleString()} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

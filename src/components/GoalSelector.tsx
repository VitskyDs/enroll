import { cn } from '@/lib/utils'
import type { LoyaltyGoal } from '@/types'

const GOALS: { value: LoyaltyGoal; label: string; description: string }[] = [
  {
    value: 'retention',
    label: 'Keep clients coming back',
    description: 'Reward loyalty and encourage repeat visits',
  },
  {
    value: 'referrals',
    label: 'Grow through referrals',
    description: 'Turn happy clients into advocates who bring friends',
  },
  {
    value: 'frequency',
    label: 'Increase visit frequency',
    description: 'Motivate clients to book more often',
  },
]

interface Props {
  onSelect: (goal: LoyaltyGoal) => void
}

export function GoalSelector({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 mt-2">
      {GOALS.map((goal) => (
        <button
          key={goal.value}
          onClick={() => onSelect(goal.value)}
          className={cn(
            'flex flex-col items-start px-4 py-3 rounded-xl border border-border bg-background hover:border-primary hover:bg-primary/5 transition-colors text-left'
          )}
        >
          <span className="text-sm font-medium">{goal.label}</span>
          <span className="text-xs text-muted-foreground mt-0.5">{goal.description}</span>
        </button>
      ))}
    </div>
  )
}

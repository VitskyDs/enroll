import { cn } from '@/lib/utils'
import type { LoyaltyGoal } from '@/types'

const GOALS: { value: LoyaltyGoal; label: string; description: string }[] = [
  {
    value: 'retention',
    label: 'Retain customers',
    description: 'Focus on keeping your current customers happy and coming back, building long-term loyalty.',
  },
  {
    value: 'frequency',
    label: 'Increase recurring revenue',
    description: 'Boost predictable income by encouraging repeat purchases or subscriptions',
  },
  {
    value: 'referrals',
    label: 'Gain new members',
    description: 'Attract new customers and expand your community or client base',
  },
]

interface Props {
  onSelect: (goal: LoyaltyGoal) => void
  selected?: LoyaltyGoal | null
}

export function GoalSelector({ onSelect, selected = null }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {GOALS.map((goal) => {
        const isSelected = selected === goal.value
        return (
          <button
            key={goal.value}
            onClick={() => onSelect(goal.value)}
            className="flex flex-col gap-2 text-left w-full"
          >
            <div className="flex items-center gap-2.5">
              <div className={cn(
                'shrink-0 w-5 h-5 rounded-full border',
                isSelected
                  ? 'border-[6px] border-zinc-900 bg-white'
                  : 'border border-zinc-200 bg-white'
              )} />
              <span className="text-sm font-semibold text-zinc-900">{goal.label}</span>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="shrink-0 w-5" />
              <p className="text-sm text-zinc-500 leading-5">{goal.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

import { cn } from '@/lib/utils'
import type { LoyaltyGoal } from '@/types'

const GOALS: { value: LoyaltyGoal; label: string; description: string }[] = [
  {
    value: 'referrals',
    label: 'Gain new members',
    description: 'Attract new customers and expand your community or client base',
  },
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
            className={cn(
              'flex gap-3 items-start text-left w-full px-3 py-3 rounded-[10px] border border-zinc-200 bg-white',
              isSelected && 'border-zinc-900',
            )}
          >
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="text-base font-medium text-zinc-700 leading-6">{goal.label}</p>
              <p className="text-sm text-zinc-500 leading-5">{goal.description}</p>
            </div>
            <div className="pt-0.5 shrink-0">
              <div className={cn(
                'w-4 h-4 rounded-full border',
                isSelected
                  ? 'border-[5px] border-zinc-900 bg-white'
                  : 'border border-zinc-300 bg-white',
              )} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

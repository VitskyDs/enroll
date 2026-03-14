import { cn } from '@/lib/utils'
import type { PrimaryGoal, SpendVariance, VisitFrequency } from '@/types'

// ---------------------------------------------------------------------------
// Shared option button
// ---------------------------------------------------------------------------

interface OptionItem<T extends string> {
  value: T
  label: string
  description: string
}

function OptionSelector<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: OptionItem<T>[]
  selected?: T | null
  onSelect: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {options.map((opt) => {
        const isSelected = selected === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={cn(
              'flex gap-3 items-start text-left w-full px-3 py-3 rounded-[10px] border border-zinc-200 bg-white',
              isSelected && 'border-zinc-900',
            )}
          >
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="text-base font-medium text-zinc-700 leading-6">{opt.label}</p>
              <p className="text-sm text-zinc-500 leading-5">{opt.description}</p>
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

// ---------------------------------------------------------------------------
// Primary goal selector
// ---------------------------------------------------------------------------

const PRIMARY_GOAL_OPTIONS: OptionItem<PrimaryGoal>[] = [
  {
    value: 'acquire',
    label: 'Gain new members',
    description: 'Attract new customers and expand your community or client base',
  },
  {
    value: 'retain',
    label: 'Retain existing customers',
    description: 'Keep your current customers happy and coming back for the long term',
  },
  {
    value: 'revenue',
    label: 'Increase recurring revenue',
    description: 'Boost predictable income by encouraging repeat purchases or higher spend',
  },
]

interface PrimaryGoalSelectorProps {
  onSelect: (goal: PrimaryGoal) => void
  selected?: PrimaryGoal | null
}

export function PrimaryGoalSelector({ onSelect, selected }: PrimaryGoalSelectorProps) {
  return <OptionSelector options={PRIMARY_GOAL_OPTIONS} selected={selected} onSelect={onSelect} />
}

// ---------------------------------------------------------------------------
// Visit frequency selector
// ---------------------------------------------------------------------------

const VISIT_FREQUENCY_OPTIONS: OptionItem<VisitFrequency>[] = [
  {
    value: 'high',
    label: 'Weekly or more',
    description: 'Customers visit or buy very regularly — daily coffee, weekly workout, etc.',
  },
  {
    value: 'medium',
    label: '2–3 times a month',
    description: 'Regular but not daily — bi-weekly appointments, monthly grocery runs',
  },
  {
    value: 'low',
    label: 'Once a month or less',
    description: 'Occasional visits — seasonal services, big-ticket purchases',
  },
]

interface VisitFrequencySelectorProps {
  onSelect: (frequency: VisitFrequency) => void
  selected?: VisitFrequency | null
}

export function VisitFrequencySelector({ onSelect, selected }: VisitFrequencySelectorProps) {
  return <OptionSelector options={VISIT_FREQUENCY_OPTIONS} selected={selected} onSelect={onSelect} />
}

// ---------------------------------------------------------------------------
// Spend variance selector
// ---------------------------------------------------------------------------

const SPEND_VARIANCE_OPTIONS: OptionItem<SpendVariance>[] = [
  {
    value: 'consistent',
    label: 'Pretty consistent',
    description: 'Most customers spend about the same amount each visit',
  },
  {
    value: 'varied',
    label: 'Varies a lot',
    description: 'Some customers spend significantly more than others',
  },
]

interface SpendVarianceSelectorProps {
  onSelect: (variance: SpendVariance) => void
  selected?: SpendVariance | null
}

export function SpendVarianceSelector({ onSelect, selected }: SpendVarianceSelectorProps) {
  return <OptionSelector options={SPEND_VARIANCE_OPTIONS} selected={selected} onSelect={onSelect} />
}

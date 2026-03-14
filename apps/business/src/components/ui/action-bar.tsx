import { CircleX } from 'lucide-react'

interface Props {
  visible: boolean
  count: number
  onClear: () => void
  onAction: () => void
  actionLabel?: string
}

export function ActionBar({ visible, count, onClear, onAction, actionLabel = 'Remove' }: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
      <div
        className="px-4 pb-8 pt-2 transition-transform duration-300 ease-in-out pointer-events-auto"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(110%)' }}
      >
        <div className="flex items-center justify-between bg-zinc-950 rounded-xl px-2 py-2">
          <button
            className="flex items-center gap-1.5 bg-[#262626] rounded px-2 py-1.5"
            onClick={onClear}
          >
            <CircleX className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">{count}</span>
          </button>
          <button
            className="px-3 py-1.5 bg-zinc-900 rounded-lg text-sm font-medium text-zinc-50"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

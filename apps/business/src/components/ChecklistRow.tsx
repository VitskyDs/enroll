import { CircleDashed, ChevronRight } from 'lucide-react'

interface Props {
  label: string
  description: string
  isLast?: boolean
}

export function Row({ label, description, isLast }: Props) {
  return (
    <div
      className={`flex items-start gap-2 p-4 bg-white ${
        !isLast ? 'border-b border-zinc-200' : ''
      }`}
    >
      <CircleDashed className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <p className="text-base font-semibold text-zinc-700 leading-6">{label}</p>
        <p className="text-sm text-zinc-500 leading-5">{description}</p>
      </div>
      <ChevronRight className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
    </div>
  )
}

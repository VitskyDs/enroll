import { Loader2 } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex mb-4">
      <div className="border border-zinc-200 rounded-2xl px-3 py-3">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

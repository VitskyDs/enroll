import { Loader2 } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
        E
      </div>
      <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    </div>
  )
}

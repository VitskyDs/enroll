import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Service } from '@/types'

interface Props {
  services: Service[]
  onConfirm: (selectedIds: Set<string>) => void
}

export function ServiceSelector({ services, onConfirm }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(services.map((s) => s.id))
  )

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
      {services.map((service) => {
        const isSelected = selected.has(service.id)
        const price = service.price_cents != null ? `$${(service.price_cents / 100).toFixed(0)}` : null
        const subPrice = service.subscription_price_cents != null ? `$${(service.subscription_price_cents / 100).toFixed(0)}` : null

        return (
          <button
            key={service.id}
            onClick={() => toggle(service.id)}
            className="flex items-start justify-between gap-3 px-4 py-4 rounded-xl border border-zinc-200 bg-white text-left"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-semibold text-zinc-900">{service.name}</span>
              {service.description && (
                <span className="text-sm text-zinc-500">{service.description}</span>
              )}
              {service.duration_minutes != null && (
                <span className="text-sm text-zinc-500">{service.duration_minutes} minutes.</span>
              )}
              {price && (
                <span className="text-sm text-zinc-500">{price} regular price.</span>
              )}
              {subPrice && (
                <span className="text-sm text-zinc-500">{subPrice} subscription price.</span>
              )}
            </div>
            <div className={cn(
              'flex items-center justify-center w-5 h-5 rounded border shrink-0 mt-0.5',
              isSelected ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white'
            )}>
              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </button>
        )
      })}
      <button
        className="w-full h-12 rounded bg-white border border-zinc-200 text-sm font-medium text-zinc-900 mt-1 disabled:opacity-40"
        disabled={services.length > 0 && selected.size === 0}
        onClick={() => onConfirm(selected)}
      >
        Done
      </button>
    </div>
  )
}

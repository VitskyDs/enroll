import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-1 gap-2">
        {services.map((service) => {
          const isSelected = selected.has(service.id)
          return (
            <button
              key={service.id}
              onClick={() => toggle(service.id)}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors text-left',
                isSelected
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              <span className="font-medium">{service.name}</span>
              {service.price_cents != null && (
                <span className="text-xs">
                  ${(service.price_cents / 100).toFixed(0)}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <Button
        className="w-full"
        disabled={selected.size === 0}
        onClick={() => onConfirm(selected)}
      >
        Confirm {selected.size} service{selected.size !== 1 ? 's' : ''}
      </Button>
    </div>
  )
}

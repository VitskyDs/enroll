import { useState } from 'react'
import { Check } from 'lucide-react'
import { DrawerHeader } from '@/components/ui/drawer-header'
import { ServiceDrawerShell } from './ServiceDrawer'

type Status = 'active' | 'draft' | 'inactive'

const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: '#009689' },
  { value: 'draft', label: 'Draft', color: '#a3a3a3' },
  { value: 'inactive', label: 'Inactive', color: '#e5e5e5' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: Status
  onSave: (value: Status) => void
}

export function StatusDrawer({ open, onOpenChange, value, onSave }: Props) {
  const [selected, setSelected] = useState<Status>(value)

  function handleOpen(isOpen: boolean) {
    if (isOpen) setSelected(value)
    onOpenChange(isOpen)
  }

  function handleSelect(s: Status) {
    setSelected(s)
    onSave(s)
    onOpenChange(false)
  }

  return (
    <ServiceDrawerShell
      open={open}
      onOpenChange={handleOpen}
      header={<DrawerHeader title="Status" />}
    >
      <div className="flex flex-col gap-2">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors"
            style={{ backgroundColor: selected === opt.value ? '#e5e5e5' : 'transparent' }}
            onClick={() => handleSelect(opt.value)}
          >
            <span className="w-5 h-5 rounded flex-shrink-0" style={{ backgroundColor: opt.color }} />
            <span className="flex-1 text-sm text-zinc-950 text-left">{opt.label}</span>
            {selected === opt.value && <Check className="w-4 h-4 text-zinc-600 shrink-0" />}
          </button>
        ))}
      </div>
    </ServiceDrawerShell>
  )
}

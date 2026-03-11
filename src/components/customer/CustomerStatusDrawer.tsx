import { Check } from 'lucide-react'
import { DrawerHeader } from '@/components/ui/drawer-header'
import { ServiceDrawerShell } from '@/components/service/ServiceDrawer'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: 'active' | 'inactive'; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: '#009689' },
  { value: 'inactive', label: 'Inactive', color: '#a3a3a3' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  value: 'active' | 'inactive'
  onSave: (value: 'active' | 'inactive') => void
}

export function CustomerStatusDrawer({ open, onOpenChange, customerId, value, onSave }: Props) {
  async function handleSelect(status: 'active' | 'inactive') {
    const { error } = await supabase
      .from('customers')
      .update({ status })
      .eq('id', customerId)

    if (error) {
      toast.error('Failed to update status')
      return
    }

    onSave(status)
    onOpenChange(false)
  }

  return (
    <ServiceDrawerShell
      open={open}
      onOpenChange={onOpenChange}
      header={<DrawerHeader title="Status" />}
    >
      <div className="flex flex-col gap-2">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className="flex items-center gap-3 w-full px-2 py-2.5 rounded-md transition-colors"
            style={{ backgroundColor: value === opt.value ? '#e5e5e5' : 'transparent' }}
            onClick={() => handleSelect(opt.value)}
          >
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
            <span className="flex-1 text-sm text-zinc-950 text-left">{opt.label}</span>
            {value === opt.value && <Check className="w-4 h-4 text-zinc-600 shrink-0" />}
          </button>
        ))}
      </div>
    </ServiceDrawerShell>
  )
}

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { DrawerHeader } from '@/components/ui/drawer-header'
import { ServiceDrawerShell } from './ServiceDrawer'
import { supabase } from '@/lib/supabase'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSave: (value: string) => void
}

export function CategoryDrawer({ open, onOpenChange, value, onSave }: Props) {
  const [selected, setSelected] = useState(value)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    supabase
      .from('categories')
      .select('name')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setCategories(data.map(r => r.name))
      })
  }, [])

  function handleOpen(isOpen: boolean) {
    if (isOpen) setSelected(value)
    onOpenChange(isOpen)
  }

  function handleSelect(cat: string) {
    setSelected(cat)
    onSave(cat)
    onOpenChange(false)
  }

  return (
    <ServiceDrawerShell
      open={open}
      onOpenChange={handleOpen}
      header={<DrawerHeader title="Category" />}
    >
      <div className="flex flex-col gap-1">
        {categories.map(cat => (
          <button
            key={cat}
            className="flex items-center gap-2 w-full px-2 py-2 rounded-md transition-colors"
            style={{ backgroundColor: selected === cat ? '#e5e5e5' : 'transparent' }}
            onClick={() => handleSelect(cat)}
          >
            <span className="flex-1 text-sm text-zinc-950 text-left">{cat}</span>
            {selected === cat && <Check className="w-4 h-4 text-zinc-600 shrink-0" />}
          </button>
        ))}
      </div>
    </ServiceDrawerShell>
  )
}

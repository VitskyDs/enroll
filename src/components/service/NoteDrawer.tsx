import { useEffect, useState } from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { DrawerHeader } from '@/components/ui/drawer-header'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onSave: (value: string) => Promise<void>
}

export function NoteDrawer({ open, onOpenChange, value, onSave }: Props) {
  const [local, setLocal] = useState(value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setLocal(value)
  }, [open, value])

  const isDirty = local.trim() !== value.trim()

  function handleCancel() {
    setLocal(value)
    onOpenChange(false)
  }

  async function handleSave() {
    setSaving(true)
    await onSave(local.trim())
    setSaving(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined} className="max-w-[420px] mx-auto px-6 pb-8 h-[95dvh]">
        <DrawerHeader
          title="Note"
          state={isDirty ? 'dirty' : 'default'}
          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
        />

        <div className="flex flex-col gap-1 mt-6">
          <label className="text-sm font-medium text-zinc-500">Internal note</label>
          <textarea
            value={local}
            onChange={e => setLocal(e.target.value)}
            placeholder="Add a private note about this service"
            rows={4}
            autoFocus
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-transparent shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

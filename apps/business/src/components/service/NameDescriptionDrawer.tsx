import { useEffect, useState } from 'react'
import { DrawerHeader } from '@/components/ui/drawer-header'
import { ServiceDrawerShell } from './ServiceDrawer'
import { Input } from '@/components/ui/input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  description: string
  onSave: (values: { name: string; description: string }) => Promise<void>
}

export function NameDescriptionDrawer({ open, onOpenChange, name, description, onSave }: Props) {
  const [localName, setLocalName] = useState(name)
  const [localDesc, setLocalDesc] = useState(description)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLocalName(name)
      setLocalDesc(description)
    }
  }, [open, name, description])

  const isDirty = localName.trim() !== name.trim() || localDesc.trim() !== description.trim()

  function handleCancel() {
    setLocalName(name)
    setLocalDesc(description)
    onOpenChange(false)
  }

  async function handleSave() {
    if (!localName.trim()) return
    setSaving(true)
    await onSave({ name: localName.trim(), description: localDesc.trim() })
    setSaving(false)
  }

  return (
    <ServiceDrawerShell
      open={open}
      onOpenChange={onOpenChange}
      header={
        <DrawerHeader
          title="Name and description"
          state={isDirty ? 'dirty' : 'default'}
          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-500">Name</label>
          <Input
            value={localName}
            onChange={e => setLocalName(e.target.value)}
            placeholder="Service name"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-500">Description</label>
          <textarea
            value={localDesc}
            onChange={e => setLocalDesc(e.target.value)}
            placeholder="Add a description"
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-transparent shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>
    </ServiceDrawerShell>
  )
}

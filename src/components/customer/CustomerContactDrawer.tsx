import { useEffect, useState } from 'react'
import { DrawerHeader } from '@/components/ui/drawer-header'
import { ServiceDrawerShell } from '@/components/service/ServiceDrawer'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  name: string
  email: string | null
  phone: string | null
  onSave: (values: { name: string; email: string | null; phone: string | null }) => void
}

export function CustomerContactDrawer({
  open,
  onOpenChange,
  customerId,
  name,
  email,
  phone,
  onSave,
}: Props) {
  const [localName, setLocalName] = useState(name)
  const [localEmail, setLocalEmail] = useState(email ?? '')
  const [localPhone, setLocalPhone] = useState(phone ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLocalName(name)
      setLocalEmail(email ?? '')
      setLocalPhone(phone ?? '')
    }
  }, [open, name, email, phone])

  const isDirty =
    localName.trim() !== name.trim() ||
    (localEmail.trim() || null) !== email ||
    (localPhone.trim() || null) !== phone

  function handleCancel() {
    setLocalName(name)
    setLocalEmail(email ?? '')
    setLocalPhone(phone ?? '')
    onOpenChange(false)
  }

  async function handleSave() {
    if (!localName.trim()) return
    setSaving(true)

    const newEmail = localEmail.trim() || null
    const newPhone = localPhone.trim() || null

    const { error } = await supabase
      .from('customers')
      .update({ name: localName.trim(), email: newEmail, phone: newPhone })
      .eq('id', customerId)

    if (error) {
      toast.error('Failed to save')
    } else {
      onSave({ name: localName.trim(), email: newEmail, phone: newPhone })
      onOpenChange(false)
    }

    setSaving(false)
  }

  return (
    <ServiceDrawerShell
      open={open}
      onOpenChange={onOpenChange}
      header={
        <DrawerHeader
          title="Contact"
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
            placeholder="Customer name"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-500">Email</label>
          <Input
            type="email"
            value={localEmail}
            onChange={e => setLocalEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-500">Phone</label>
          <Input
            type="tel"
            value={localPhone}
            onChange={e => setLocalPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>
    </ServiceDrawerShell>
  )
}

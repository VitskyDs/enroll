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
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  onSave: (values: {
    firstName: string
    lastName: string
    name: string
    email: string | null
    phone: string | null
  }) => void
}

export function CustomerContactDrawer({
  open,
  onOpenChange,
  customerId,
  firstName,
  lastName,
  email,
  phone,
  onSave,
}: Props) {
  const [localFirstName, setLocalFirstName] = useState(firstName)
  const [localLastName, setLocalLastName] = useState(lastName)
  const [localEmail, setLocalEmail] = useState(email ?? '')
  const [localPhone, setLocalPhone] = useState(phone ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLocalFirstName(firstName)
      setLocalLastName(lastName)
      setLocalEmail(email ?? '')
      setLocalPhone(phone ?? '')
    }
  }, [open, firstName, lastName, email, phone])

  const isDirty =
    localFirstName.trim() !== firstName.trim() ||
    localLastName.trim() !== lastName.trim() ||
    (localEmail.trim() || null) !== email ||
    (localPhone.trim() || null) !== phone

  function handleCancel() {
    setLocalFirstName(firstName)
    setLocalLastName(lastName)
    setLocalEmail(email ?? '')
    setLocalPhone(phone ?? '')
    onOpenChange(false)
  }

  async function handleSave() {
    if (!localFirstName.trim()) return
    setSaving(true)

    const newFirstName = localFirstName.trim()
    const newLastName = localLastName.trim() || null
    const newName = [newFirstName, newLastName].filter(Boolean).join(' ')
    const newEmail = localEmail.trim() || null
    const newPhone = localPhone.trim() || null

    const { error } = await supabase
      .from('customers')
      .update({
        first_name: newFirstName,
        last_name: newLastName,
        name: newName,
        email: newEmail,
        phone: newPhone,
      })
      .eq('id', customerId)

    if (error) {
      toast.error('Failed to save')
    } else {
      onSave({ firstName: newFirstName, lastName: newLastName ?? '', name: newName, email: newEmail, phone: newPhone })
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
          <label className="text-sm font-medium text-zinc-500">First name</label>
          <Input
            value={localFirstName}
            onChange={e => setLocalFirstName(e.target.value)}
            placeholder="First name"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-500">Last name</label>
          <Input
            value={localLastName}
            onChange={e => setLocalLastName(e.target.value)}
            placeholder="Last name"
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

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

function Divider() {
  return <div className="h-px bg-zinc-100 w-full" />
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="w-28 shrink-0 text-sm text-zinc-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-base text-zinc-950 bg-transparent focus:outline-none placeholder:text-zinc-400"
      />
    </div>
  )
}

export default function CustomerFormPage() {
  const navigate = useNavigate()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    supabase
      .from('businesses')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data: biz }) => {
        if (biz) setBusinessId(biz.id)
      })
  }, [])

  function set(field: keyof FormData) {
    return (value: string) => setData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!data.firstName.trim()) {
      toast.error('First name is required')
      return
    }
    if (!businessId) {
      toast.error('Could not determine business')
      return
    }

    setIsSaving(true)

    const fullName = data.lastName.trim()
      ? `${data.firstName.trim()} ${data.lastName.trim()}`
      : data.firstName.trim()

    const { data: inserted, error } = await supabase
      .from('customers')
      .insert({
        business_id: businessId,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim() || null,
        name: fullName,
        email: data.email.trim() || null,
        phone: data.phone.trim() || null,
        status: 'active',
        points: 0,
        joined_at: new Date().toISOString(),
      })
      .select()

    setIsSaving(false)

    if (error) {
      toast.error('Failed to create customer')
      return
    }

    toast.success('Customer added')
    navigate(`/customers/${inserted![0].id}`, { replace: true })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-4 bg-white shrink-0">
        <button
          className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg"
          onClick={() => navigate('/customers')}
        >
          <ChevronLeft className="w-4 h-4 text-zinc-700" />
        </button>
        <p className="text-base font-semibold text-zinc-950">New customer</p>
        <div className="w-9" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-32">
        <div className="bg-white px-4">
          <div className="flex items-center h-8 mt-2">
            <p className="text-base font-semibold text-zinc-950">Contact information</p>
          </div>
          <Field
            label="First name"
            value={data.firstName}
            onChange={set('firstName')}
            placeholder="Required"
          />
          <Divider />
          <Field
            label="Last name"
            value={data.lastName}
            onChange={set('lastName')}
            placeholder="Optional"
          />
          <Divider />
          <Field
            label="Email"
            value={data.email}
            onChange={set('email')}
            placeholder="Optional"
            type="email"
          />
          <Divider />
          <Field
            label="Phone"
            value={data.phone}
            onChange={set('phone')}
            placeholder="Optional"
            type="tel"
          />
        </div>
      </div>

      {/* Save button */}
      <div className="shrink-0 px-4 pb-28 pt-3 bg-white border-t border-zinc-100">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-11 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save customer'}
        </button>
      </div>

      <BottomNav active="customers" />
    </div>
  )
}

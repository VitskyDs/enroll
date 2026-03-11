import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Ellipsis } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { ActionSheet } from '@/components/resource/ActionSheet'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const ACTIVE_COLOR = '#009689'
const INACTIVE_COLOR = '#a3a3a3'

const STATUS_OPTIONS: { value: 'active' | 'inactive'; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: ACTIVE_COLOR },
  { value: 'inactive', label: 'Inactive', color: INACTIVE_COLOR },
]

interface CustomerData {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: 'active' | 'inactive'
  points: number
  tier: string | null
  total_spend: number
  joined_at: string
}

interface CustomerForm {
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function CustomerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [form, setForm] = useState<CustomerForm>({ name: '', email: '', phone: '', status: 'active' })
  const [originalForm, setOriginalForm] = useState<CustomerForm>({ name: '', email: '', phone: '', status: 'active' })
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, status, points, tier, total_spend, joined_at')
        .eq('id', id)
        .single()

      if (!error && data) {
        setCustomer(data as CustomerData)
        const loaded: CustomerForm = {
          name: data.name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          status: data.status === 'inactive' ? 'inactive' : 'active',
        }
        setForm(loaded)
        setOriginalForm(loaded)
      }
      setIsLoading(false)
    }

    load()
  }, [id])

  function setField<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  function handleCancel() {
    setForm(originalForm)
    setIsDirty(false)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Customer name is required')
      return
    }

    setIsSaving(true)

    const { error } = await supabase
      .from('customers')
      .update({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        status: form.status,
      })
      .eq('id', id!)

    if (error) {
      toast.error('Failed to save customer')
    } else {
      toast.success('Customer updated')
      setCustomer(prev => prev ? { ...prev, ...form, name: form.name.trim() } : prev)
      setOriginalForm(form)
      setIsDirty(false)
    }

    setIsSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this customer?')) return

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id!)

    if (error) {
      toast.error('Failed to delete customer')
    } else {
      toast.success('Customer deleted')
      navigate('/customers')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-sm text-zinc-500">Customer not found</p>
      </div>
    )
  }

  const currentStatus = STATUS_OPTIONS.find(o => o.value === form.status) ?? STATUS_OPTIONS[0]

  const header = isDirty ? (
    <div className="flex items-center justify-between px-4 pt-safe pb-4 bg-white">
      <button
        className="h-9 px-4 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-950"
        onClick={handleCancel}
      >
        Cancel
      </button>
      <button
        className="h-9 px-4 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-950 disabled:opacity-50"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving…' : 'Save'}
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-between px-4 pt-safe pb-4 bg-white">
      <button
        className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="w-4 h-4 text-zinc-700" />
      </button>
      <button
        className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg"
        onClick={() => setActionSheetOpen(true)}
      >
        <Ellipsis className="w-4 h-4 text-zinc-700" />
      </button>
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {header}

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-6 pt-6 pb-32">

        {/* Status */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Status</p>
          <div className="relative">
            <button
              className="flex items-center gap-2 w-full h-9 px-3 border border-[#d4d4d4] rounded-lg bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0)]"
              onClick={() => setStatusOpen(prev => !prev)}
            >
              <span
                className="w-4 h-4 rounded shrink-0"
                style={{ backgroundColor: currentStatus.color }}
              />
              <span className="flex-1 text-sm text-zinc-950">{currentStatus.label}</span>
              <svg className="w-4 h-4 text-zinc-400 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-md z-20 overflow-hidden">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-zinc-50 transition-colors"
                      onClick={() => { setStatusOpen(false); setField('status', opt.value) }}
                    >
                      <span className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: opt.color }} />
                      <span className="flex-1 text-sm text-zinc-950 text-left">{opt.label}</span>
                      {form.status === opt.value && <span className="text-xs text-zinc-400">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Name</p>
          <input
            type="text"
            placeholder="Customer name"
            className="h-9 px-3 border border-zinc-200 rounded-lg text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white shadow-[0_1px_2px_rgba(0,0,0,0)]"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Email</p>
          <input
            type="email"
            placeholder="email@example.com"
            className="h-9 px-3 border border-zinc-200 rounded-lg text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white shadow-[0_1px_2px_rgba(0,0,0,0)]"
            value={form.email}
            onChange={e => setField('email', e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Phone</p>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="h-9 px-3 border border-zinc-200 rounded-lg text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white shadow-[0_1px_2px_rgba(0,0,0,0)]"
            value={form.phone}
            onChange={e => setField('phone', e.target.value)}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-100" />

        {/* Read-only loyalty stats */}
        <div className="flex flex-col gap-6">
          <ReadOnlyField label="Points" value={String(customer.points)} />
          <ReadOnlyField label="Tier" value={customer.tier ?? '—'} />
          <ReadOnlyField label="Total spend" value={`$${Number(customer.total_spend).toFixed(2)}`} />
          <ReadOnlyField label="Joined" value={formatDate(customer.joined_at)} />
        </div>

      </div>

      <BottomNav active="customers" />

      <ActionSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-zinc-950">{label}</p>
      <div className="flex items-center h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0)]">
        <span className="text-sm text-zinc-500">{value}</span>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Award, ChevronLeft, ChevronRight, CirclePlus, Copy, Ellipsis } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { ActionSheet } from '@/components/resource/ActionSheet'
import { CustomerContactDrawer } from '@/components/customer/CustomerContactDrawer'
import { CustomerStatusDrawer } from '@/components/customer/CustomerStatusDrawer'
import { CustomerNoteDrawer } from '@/components/customer/CustomerNoteDrawer'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface CustomerData {
  id: string
  first_name: string
  last_name: string | null
  name: string
  email: string | null
  phone: string | null
  status: 'active' | 'inactive'
  points: number
  tier: string | null
  joined_at: string
  note: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 text-xs font-medium text-stone-700">
      <Award className="w-3 h-3" />
      {tier}
    </span>
  )
}

function StatusBadge({
  status,
  onClick,
}: {
  status: 'active' | 'inactive'
  onClick: () => void
}) {
  const isActive = status === 'active'
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-opacity active:opacity-70 ${
        isActive ? 'bg-[#009689] text-white' : 'bg-zinc-200 text-zinc-950'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </button>
  )
}

function ContactRow({
  value,
  placeholder,
  onClick,
}: {
  value: string | null
  placeholder: string
  onClick: () => void
}) {
  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    if (!value) return
    await navigator.clipboard.writeText(value)
    toast.success('Copied')
  }

  return (
    <button
      className="flex items-center gap-3 w-full py-3 text-left"
      onClick={onClick}
    >
      <span className={`flex-1 text-sm ${value ? 'text-zinc-950' : 'text-zinc-400'}`}>
        {value || placeholder}
      </span>
      {value && (
        <button
          className="flex items-center justify-center w-7 h-7 shrink-0 rounded-md transition-colors active:bg-zinc-100"
          onClick={handleCopy}
        >
          <Copy className="w-4 h-4 text-zinc-400" />
        </button>
      )}
    </button>
  )
}

function Divider() {
  return <div className="h-px bg-zinc-100" />
}

function LoyaltyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-zinc-950">{label}</span>
      <span className="text-sm text-zinc-500">{value}</span>
    </div>
  )
}

export default function CustomerPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [openDrawer, setOpenDrawer] = useState<'contact' | 'status' | 'note' | null>(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, name, email, phone, status, points, tier, joined_at, note')
        .eq('id', id)
        .single()

      if (!error && data) {
        setCustomer(data as CustomerData)
      }
      setIsLoading(false)
    }

    load()
  }, [id])

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

  const fullName = customer.last_name
    ? `${customer.first_name} ${customer.last_name}`
    : customer.first_name

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-100">
      <div className="flex-1 overflow-y-auto">
        {/* Header — scrolls with content */}
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

        <div className="flex flex-col gap-3 mt-3 pb-28">
          {/* Hero */}
          <div className="bg-white px-4 pt-4 pb-5 flex flex-col gap-1">
            <button className="text-left" onClick={() => setOpenDrawer('contact')}>
              <p className="text-2xl font-semibold text-zinc-950 tracking-tight">{fullName}</p>
            </button>
            <p className="text-sm text-zinc-500">Since {formatDate(customer.joined_at)}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {customer.tier && <TierBadge tier={customer.tier} />}
              <StatusBadge status={customer.status} onClick={() => setOpenDrawer('status')} />
            </div>
          </div>

          {/* Contact information */}
          <div className="bg-white px-4">
            <p className="text-base font-semibold text-zinc-950 py-3">Contact information</p>
            <ContactRow
              value={customer.email}
              placeholder="No email"
              onClick={() => setOpenDrawer('contact')}
            />
            <Divider />
            <ContactRow
              value={customer.phone}
              placeholder="No phone"
              onClick={() => setOpenDrawer('contact')}
            />
          </div>

          {/* Loyalty */}
          <div className="bg-white px-4">
            <p className="text-base font-semibold text-zinc-950 py-3">Loyalty</p>
            <LoyaltyRow label="Tier" value={customer.tier ?? '—'} />
            <Divider />
            <LoyaltyRow label="Points" value={String(customer.points)} />
          </div>

          {/* Note */}
          <div className="bg-white px-4">
            <p className="text-base font-semibold text-zinc-950 py-3">Note</p>
            <button
              className="flex items-center gap-2 w-full py-3"
              onClick={() => setOpenDrawer('note')}
            >
              {!customer.note && (
                <CirclePlus className="w-5 h-5 text-zinc-400 shrink-0" />
              )}
              <span className={`flex-1 text-sm text-left ${customer.note ? 'text-zinc-950' : 'text-zinc-400'}`}>
                {customer.note || 'Add note'}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav active="customers" />

      <CustomerContactDrawer
        open={openDrawer === 'contact'}
        onOpenChange={open => setOpenDrawer(open ? 'contact' : null)}
        customerId={customer.id}
        firstName={customer.first_name}
        lastName={customer.last_name ?? ''}
        email={customer.email}
        phone={customer.phone}
        onSave={values =>
          setCustomer(prev =>
            prev
              ? {
                  ...prev,
                  first_name: values.firstName,
                  last_name: values.lastName || null,
                  name: values.name,
                  email: values.email,
                  phone: values.phone,
                }
              : prev
          )
        }
      />

      <CustomerStatusDrawer
        open={openDrawer === 'status'}
        onOpenChange={open => setOpenDrawer(open ? 'status' : null)}
        customerId={customer.id}
        value={customer.status}
        onSave={status => setCustomer(prev => (prev ? { ...prev, status } : prev))}
      />

      <CustomerNoteDrawer
        open={openDrawer === 'note'}
        onOpenChange={open => setOpenDrawer(open ? 'note' : null)}
        customerId={customer.id}
        value={customer.note ?? ''}
        onSave={note => setCustomer(prev => (prev ? { ...prev, note: note || null } : prev))}
      />

      <ActionSheet
        open={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        onDelete={handleDelete}
      />
    </div>
  )
}

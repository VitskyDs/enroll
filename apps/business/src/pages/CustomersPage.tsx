import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, ListFilter, UsersRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'
import { ResourceScreen } from '@/components/resource/ResourceScreen'
import { useDemoMode } from '@/hooks/useDemoMode'
import { useAuth } from '@/contexts/AuthContext'
import { DEMO_CUSTOMERS } from '@/data/demoData'

interface CustomerRow {
  id: string
  name: string
  joined_at: string
  tier: string | null
  points: number
  total_spend: number
  status: string
}

type FilterTab = 'all' | 'active' | 'inactive'

const ACTIVE_COLOR = '#009689'
const INACTIVE_COLOR = '#a3a3a3'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function CustomerItem({ customer, onClick }: { customer: CustomerRow; onClick?: () => void }) {
  const isActive = customer.status === 'active'
  const spendTierPoints = [
    `$${Number(customer.total_spend).toFixed(2)}`,
    customer.tier ?? null,
    `${customer.points} pts`,
  ].filter(Boolean).join(' · ')

  return (
    <button className="flex items-start gap-4 w-full py-3 text-left" onClick={onClick}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-950 leading-5 truncate">{customer.name}</p>
        <p className="text-sm text-zinc-500 leading-5 truncate">{spendTierPoints}</p>
        <p className="text-sm text-zinc-500 leading-5 truncate">{formatDate(customer.joined_at)}</p>
      </div>
      <div
        className="shrink-0 flex items-center justify-center px-2 py-0.5 rounded-lg mt-0.5"
        style={{ backgroundColor: isActive ? ACTIVE_COLOR : INACTIVE_COLOR }}
      >
        <span className="text-xs font-semibold text-white leading-4">
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </button>
  )
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const demoMode = useDemoMode()
  const { user } = useAuth()
  const [customers, setCustomers] = useState<CustomerRow[]>(demoMode ? DEMO_CUSTOMERS : [])
  const [isLoading, setIsLoading] = useState(!demoMode)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  useEffect(() => {
    if (demoMode || !user) return
    async function load() {
      setIsLoading(true)
      setError(null)

      const { data: business, error: bizErr } = await supabase
        .from('businesses')
        .select('id, loyalty_program_id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (bizErr || !business) {
        setError('Could not load customers.')
        setIsLoading(false)
        return
      }

      if (!business.loyalty_program_id) {
        setIsLoading(false)
        return
      }

      const { data, error: custErr } = await supabase
        .from('customers')
        .select('id, name, joined_at, tier, points, total_spend, status')
        .eq('business_id', business.id)
        .order('joined_at', { ascending: false })

      if (custErr) {
        setError('Could not load customers.')
      } else {
        setCustomers(data ?? [])
      }

      setIsLoading(false)
    }

    load()
  }, [demoMode, user])

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => filter === 'all' || c.status === filter)
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
  }, [customers, filter, search])

  const toolbar = (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 h-9 border border-zinc-200 rounded-lg bg-white px-3 shadow-sm">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          placeholder="Search customers"
          className="flex-1 text-sm text-zinc-950 placeholder:text-zinc-400 bg-transparent focus:outline-none min-w-0"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <button className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
        <ArrowUpDown className="w-4 h-4 text-zinc-700" />
      </button>
      <button className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
        <ListFilter className="w-4 h-4 text-zinc-700" />
      </button>
    </div>
  )

  const filterTabs = (
    <div className="flex items-center">
      {(['all', 'active', 'inactive'] as FilterTab[]).map(tab => (
        <button
          key={tab}
          className={`h-9 px-4 py-2 rounded-full text-sm font-medium leading-5 transition-colors ${
            filter === tab ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
          }`}
          onClick={() => setFilter(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )

  const emptySecondaryActions = (
    <>
      <p className="text-sm text-zinc-500">More ways to add customers</p>
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-zinc-200 rounded-lg px-5 py-4 shadow-sm">
          <p className="text-sm text-zinc-500 leading-5">Import from csv</p>
        </div>
        <div className="flex-1 bg-white border border-zinc-200 rounded-lg px-5 py-4 shadow-sm">
          <p className="text-sm text-zinc-500 leading-5">Invite customers</p>
        </div>
      </div>
    </>
  )

  // When no program exists, show empty state without toolbar
  // When program exists (even 0 customers), show toolbar — zero customers maps to isNoResults
  return (
    <>
      <ResourceScreen
        title="Customers"
        items={filteredCustomers}
        hasAnyItems={customers.length > 0}
        isLoading={isLoading}
        error={error}
        onAdd={() => navigate('/customers/new')}
        renderItem={c => <CustomerItem key={c.id} customer={c} onClick={() => navigate(`/customers/${c.id}`)} />}
        emptyIcon={<UsersRound className="w-5 h-5 text-zinc-600" />}
        emptyHeading="No customers yet"
        emptySubtext="Invite your first customers to join your loyalty program"
        emptyCtaLabel="Add customer"
        emptySecondaryActions={emptySecondaryActions}
        toolbar={toolbar}
        filterTabs={filterTabs}
      />
      <BottomNav active="customers" />
    </>
  )
}

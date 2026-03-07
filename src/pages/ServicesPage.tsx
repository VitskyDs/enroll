import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, ListFilter, HandHeart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'
import { ResourceScreen } from '@/components/resource/ResourceScreen'
import { ResourceListItem, ACTIVE_COLOR, DRAFT_COLOR } from '@/components/resource/ResourceListItem'

interface ServiceRow {
  id: string
  name: string
  price: number | null
  status: string
  category: string | null
  image_url: string | null
}

type FilterTab = 'all' | 'active' | 'draft'

export default function ServicesPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)

      // Get current business
      const { data: business, error: bizErr } = await supabase
        .from('businesses')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (bizErr || !business) {
        setError('Could not load services.')
        setIsLoading(false)
        return
      }

      const { data, error: svcErr } = await supabase
        .from('services')
        .select('id, name, price, status, category, image_url')
        .eq('business_id', business.id)
        .order('created_at', { ascending: true })

      if (svcErr) {
        setError('Could not load services.')
      } else {
        setServices(data ?? [])
      }

      setIsLoading(false)
    }

    load()
  }, [])

  const filteredServices = useMemo(() => {
    return services
      .filter(s => filter === 'all' || s.status === filter)
      .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
  }, [services, filter, search])

  // --- Toolbar (populated state only) ---
  const toolbar = (
    <div className="flex items-center gap-2">
      {/* Search input */}
      <div className="flex-1 flex items-center gap-2 h-9 border border-zinc-200 rounded-lg bg-white px-3 shadow-sm">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          placeholder="Search services"
          className="flex-1 text-sm text-zinc-950 placeholder:text-zinc-400 bg-transparent focus:outline-none min-w-0"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Sort */}
      <button className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
        <ArrowUpDown className="w-4 h-4 text-zinc-700" />
      </button>
      {/* Filter */}
      <button className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
        <ListFilter className="w-4 h-4 text-zinc-700" />
      </button>
    </div>
  )

  // --- Filter tabs ---
  const filterTabs = (
    <div className="flex items-center">
      {(['all', 'active', 'draft'] as FilterTab[]).map(tab => (
        <button
          key={tab}
          className={`h-9 px-4 py-2 rounded-full text-sm font-medium leading-5 transition-colors ${
            filter === tab
              ? 'bg-zinc-100 text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
          onClick={() => setFilter(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )

  // --- Empty state secondary actions ---
  const emptySecondaryActions = (
    <>
      <p className="text-sm text-zinc-500">More ways to add services</p>
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-zinc-200 rounded-lg px-5 py-4 shadow-sm">
          <p className="text-sm text-zinc-500 leading-5">Import from website</p>
        </div>
        <div className="flex-1 bg-white border border-zinc-200 rounded-lg px-5 py-4 shadow-sm">
          <p className="text-sm text-zinc-500 leading-5">Add a sample service</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <ResourceScreen
        title="Services"
        items={filteredServices}
        isLoading={isLoading}
        error={error}
        onAdd={() => navigate('/services/new')}
        renderItem={svc => (
          <ResourceListItem
            key={svc.id}
            imageUrl={svc.image_url}
            title={svc.name}
            subtitle={svc.price != null ? `$${Number(svc.price).toFixed(2)}` : '—'}
            badge={{
              label: svc.status === 'active' ? 'Active' : 'Draft',
              color: svc.status === 'active' ? ACTIVE_COLOR : DRAFT_COLOR,
            }}
            onClick={() => navigate(`/services/${svc.id}`)}
          />
        )}
        emptyIcon={<HandHeart className="w-5 h-5 text-zinc-600" />}
        emptyHeading="Add your first service"
        emptySubtext="Your service will appear here"
        emptyCtaLabel="Add service"
        emptySecondaryActions={emptySecondaryActions}
        toolbar={toolbar}
        filterTabs={filterTabs}
      />
      <BottomNav active="services" />
    </>
  )
}

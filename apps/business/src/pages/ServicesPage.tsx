import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowUpDown, ListFilter, HandHeart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { BottomNav } from '@/components/BottomNav'
import { ResourceScreen } from '@/components/resource/ResourceScreen'
import { ResourceListItem } from '@/components/resource/ResourceListItem'
import { useDemoMode } from '@/hooks/useDemoMode'
import { useAuth } from '@/contexts/AuthContext'

interface ServiceRow {
  id: string
  name: string
  price_cents: number | null
  status: string
  category: string | null
  image_url: string | null
  service_images: { url: string; sort_order: number }[]
}

type FilterTab = 'all' | 'active' | 'draft' | 'inactive'

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active:   { label: 'Active',   color: '#009689' },
  draft:    { label: 'Draft',    color: '#a3a3a3' },
  inactive: { label: 'Inactive', color: '#737373' },
}

const DEMO_SERVICE_ROWS: ServiceRow[] = [
  { id: 'demo-1', name: 'Signature cut & style',       price_cents: 8500,  status: 'active', category: 'Haircut',   image_url: null, service_images: [{ url: 'https://fhbgyigrzbmdwdxvuqfh.supabase.co/storage/v1/object/public/service-images/1774011504379-khd9n6jqlpg.png', sort_order: 0 }] },
  { id: 'demo-2', name: 'Full color & highlights',      price_cents: 18000, status: 'active', category: 'Color',     image_url: null, service_images: [{ url: 'https://fhbgyigrzbmdwdxvuqfh.supabase.co/storage/v1/object/public/service-images/1774011797039-i3m1604p5n.png', sort_order: 0 }] },
  { id: 'demo-3', name: 'Blowout & finish',             price_cents: 5500,  status: 'active', category: 'Styling',   image_url: null, service_images: [{ url: 'https://fhbgyigrzbmdwdxvuqfh.supabase.co/storage/v1/object/public/service-images/1774011813111-wpt3ezxk02.png', sort_order: 0 }] },
  { id: 'demo-4', name: 'Deep conditioning treatment',  price_cents: 4500,  status: 'draft',  category: 'Treatment', image_url: null, service_images: [{ url: 'https://fhbgyigrzbmdwdxvuqfh.supabase.co/storage/v1/object/public/service-images/1774011823228-wb10xvvdwi.png', sort_order: 0 }] },
]

export default function ServicesPage() {
  const navigate = useNavigate()
  const demoMode = useDemoMode()
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceRow[]>(demoMode ? DEMO_SERVICE_ROWS : [])
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
        .select('id')
        .eq('owner_id', user!.id)
        .maybeSingle()

      if (bizErr || !business) {
        setError('Could not load services.')
        setIsLoading(false)
        return
      }

      const { data, error: svcErr } = await supabase
        .from('services')
        .select('id, name, price_cents, status, category, image_url, service_images(url, sort_order)')
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
  }, [demoMode, user])

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
      {(['all', 'active', 'draft', 'inactive'] as FilterTab[]).map(tab => (
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
        hasAnyItems={services.length > 0}
        isLoading={isLoading}
        error={error}
        onAdd={() => navigate('/services/new')}
        renderItem={svc => (
          <ResourceListItem
            key={svc.id}
            imageUrl={svc.image_url ?? svc.service_images?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null}
            title={svc.name}
            subtitle={svc.price_cents != null ? `$${(svc.price_cents / 100).toFixed(2)}` : '—'}
            badge={STATUS_BADGE[svc.status] ?? STATUS_BADGE.draft}
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

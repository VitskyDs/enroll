import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CirclePlus, Ellipsis, ImagePlus, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { BottomNav } from '@/components/BottomNav'
import { ActionSheet } from '@/components/resource/ActionSheet'
import { StatusDrawer } from '@/components/service/StatusDrawer'
import { NameDescriptionDrawer } from '@/components/service/NameDescriptionDrawer'
import { PricingDrawer } from '@/components/service/PricingDrawer'
import { CategoryDrawer } from '@/components/service/CategoryDrawer'
import { NoteDrawer } from '@/components/service/NoteDrawer'
import { MediaDrawer } from '@/components/service/MediaDrawer'
import { supabase } from '@/lib/supabase'

const ACTIVE_COLOR = '#009689'
const DRAFT_COLOR = '#a3a3a3'
const INACTIVE_COLOR = '#71717a'

type Status = 'active' | 'draft' | 'inactive'
type DrawerType = 'status' | 'nameDescription' | 'pricing' | 'category' | 'note' | 'media'

interface ServiceData {
  name: string
  status: Status
  description: string
  category: string
  price: string
  subscriptionPrice: string
  note: string
}

const DEFAULT_DATA: ServiceData = {
  name: '',
  status: 'active',
  description: '',
  category: '',
  price: '',
  subscriptionPrice: '',
  note: '',
}

const STATUS_COLOR: Record<Status, string> = {
  active: ACTIVE_COLOR,
  draft: DRAFT_COLOR,
  inactive: INACTIVE_COLOR,
}

const STATUS_LABEL: Record<Status, string> = {
  active: 'Active',
  draft: 'Draft',
  inactive: 'Inactive',
}

function Divider() {
  return <div className="h-px bg-zinc-100 w-full" />
}

interface PropertyRowProps {
  label: React.ReactNode
  right?: React.ReactNode
  onClick: () => void
}

function PropertyRow({ label, right, onClick }: PropertyRowProps) {
  return (
    <button
      className="flex items-center gap-2 w-full py-4 text-left"
      onClick={onClick}
    >
      <span className="flex-1 text-base text-[#404040] truncate">{label}</span>
      {right}
      <ChevronRight className="w-6 h-6 text-zinc-300 shrink-0" />
    </button>
  )
}

export default function ServiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isCreate = id === 'new'

  const [data, setData] = useState<ServiceData>(DEFAULT_DATA)
  const [images, setImages] = useState<string[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!isCreate)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [openDrawer, setOpenDrawer] = useState<DrawerType | null>(isCreate ? 'nameDescription' : null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (isCreate || !id) return

    async function load() {
      setIsLoading(true)
      const [{ data: row, error }, { data: imgs }] = await Promise.all([
        supabase
          .from('services')
          .select('id, name, status, description, category, price, subscription_price, note')
          .eq('id', id)
          .single(),
        supabase
          .from('service_images')
          .select('url')
          .eq('service_id', id)
          .order('sort_order', { ascending: true }),
      ])

      if (!error && row) {
        setData({
          name: row.name ?? '',
          status: row.status === 'draft' ? 'draft' : row.status === 'inactive' ? 'inactive' : 'active',
          description: row.description ?? '',
          category: row.category ?? '',
          price: row.price != null ? String(row.price) : '',
          subscriptionPrice: row.subscription_price != null ? String(row.subscription_price) : '',
          note: row.note ?? '',
        })
      }
      if (imgs) setImages(imgs.map(r => r.url))
      setIsLoading(false)
    }

    load()
  }, [id, isCreate])

  async function updateService(payload: Record<string, unknown>) {
    const { error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id!)

    if (error) {
      toast.error('Failed to save')
      return false
    }
    return true
  }

  // --- Drawer save handlers ---

  async function handleStatusSave(status: Status) {
    if (isCreate) {
      setData(prev => ({ ...prev, status }))
      return
    }
    const ok = await updateService({ status })
    if (ok) setData(prev => ({ ...prev, status }))
  }

  async function handleNameDescriptionSave({ name, description }: { name: string; description: string }) {
    if (isCreate) {
      if (!businessId) return
      const priceVal = data.price ? parseFloat(data.price) : null
      const subPriceVal = data.subscriptionPrice ? parseFloat(data.subscriptionPrice) : null

      const { data: inserted, error } = await supabase
        .from('services')
        .insert({
          business_id: businessId,
          source: 'manual',
          name,
          description: description || null,
          status: data.status,
          category: data.category || null,
          price: priceVal,
          price_cents: priceVal != null ? Math.round(priceVal * 100) : null,
          subscription_price: subPriceVal,
          note: data.note || null,
        })
        .select()

      if (error) {
        toast.error('Failed to create service')
        return
      }

      toast.success('Service created')
      navigate(`/services/${inserted![0].id}`, { replace: true })
      return
    }

    const ok = await updateService({ name, description: description || null })
    if (ok) setData(prev => ({ ...prev, name, description }))
    setOpenDrawer(null)
  }

  async function handlePricingSave({ price, subscriptionPrice }: { price: string; subscriptionPrice: string }) {
    if (isCreate) {
      setData(prev => ({ ...prev, price, subscriptionPrice }))
      setOpenDrawer(null)
      return
    }
    const priceVal = price ? parseFloat(price) : null
    const subPriceVal = subscriptionPrice ? parseFloat(subscriptionPrice) : null
    const ok = await updateService({
      price: priceVal,
      price_cents: priceVal != null ? Math.round(priceVal * 100) : null,
      subscription_price: subPriceVal,
    })
    if (ok) setData(prev => ({ ...prev, price, subscriptionPrice }))
    setOpenDrawer(null)
  }

  async function handleCategorySave(category: string) {
    if (isCreate) {
      setData(prev => ({ ...prev, category }))
      return
    }
    const ok = await updateService({ category: category || null })
    if (ok) setData(prev => ({ ...prev, category }))
  }

  async function handleNoteSave(note: string) {
    if (isCreate) {
      setData(prev => ({ ...prev, note }))
      setOpenDrawer(null)
      return
    }
    const ok = await updateService({ note: note || null })
    if (ok) setData(prev => ({ ...prev, note }))
    setOpenDrawer(null)
  }

  // --- Inline image upload ---

  async function handleInlineUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id || isCreate) return
    e.target.value = ''

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data: uploaded, error } = await supabase.storage
      .from('service-images')
      .upload(path, file, { upsert: true })

    if (error) { toast.error('Failed to upload image'); return }

    const { data: urlData } = supabase.storage.from('service-images').getPublicUrl(uploaded.path)
    const url = urlData.publicUrl

    const { error: insertError } = await supabase
      .from('service_images')
      .insert({ service_id: id, url, sort_order: images.length })

    if (insertError) { toast.error('Failed to save image'); return }

    setImages(prev => [...prev, url])
  }

  // --- Duplicate / Delete ---

  async function handleDelete() {
    if (!window.confirm('Delete this service?')) return
    const { error } = await supabase.from('services').delete().eq('id', id!)
    if (error) {
      toast.error('Failed to delete service')
    } else {
      toast.success('Service deleted')
      navigate('/services')
    }
  }

  async function handleDuplicate() {
    if (!businessId) return
    const priceVal = data.price ? parseFloat(data.price) : null
    const subPriceVal = data.subscriptionPrice ? parseFloat(data.subscriptionPrice) : null
    const { error } = await supabase.from('services').insert({
      business_id: businessId,
      source: 'manual',
      name: `${data.name} (copy)`,
      status: data.status,
      description: data.description || null,
      category: data.category || null,
      price: priceVal,
      price_cents: priceVal != null ? Math.round(priceVal * 100) : null,
      subscription_price: subPriceVal,
      note: data.note || null,
    })

    if (error) {
      toast.error('Failed to duplicate service')
    } else {
      toast.success('Service duplicated')
      navigate('/services')
    }
  }

  // --- Formatted display values ---

  function priceDisplay() {
    if (!data.price) return null
    return `$${parseFloat(data.price).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white shrink-0">
        <button
          className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-4 h-4 text-zinc-700" />
        </button>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg">
            <Share2 className="w-4 h-4 text-zinc-700" />
          </button>
          {!isCreate && (
            <button
              className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg"
              onClick={() => setActionSheetOpen(true)}
            >
              <Ellipsis className="w-4 h-4 text-zinc-700" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-32">

        {/* Basic information */}
        <div className="bg-white px-4">
          <div className="flex items-center h-8">
            <p className="text-base font-semibold text-zinc-950">Basic information</p>
          </div>
          <div>
            {/* Status */}
            <PropertyRow
              label="Service status"
              right={
                <span
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold text-white shrink-0"
                  style={{ backgroundColor: STATUS_COLOR[data.status] }}
                >
                  {STATUS_LABEL[data.status]}
                </span>
              }
              onClick={() => setOpenDrawer('status')}
            />
            <Divider />

            {/* Name */}
            <PropertyRow
              label={data.name || <span className="text-zinc-400">Name</span>}
              onClick={() => setOpenDrawer('nameDescription')}
            />
            <Divider />

            {/* Description */}
            <PropertyRow
              label={data.description || <span className="text-zinc-400">Description</span>}
              onClick={() => setOpenDrawer('nameDescription')}
            />
            <Divider />

            {/* Category */}
            <PropertyRow
              label={data.category || <span className="text-zinc-400">Category</span>}
              onClick={() => setOpenDrawer('category')}
            />
            <Divider />

            {/* Price */}
            <PropertyRow
              label={priceDisplay() || <span className="text-zinc-400">Price</span>}
              onClick={() => setOpenDrawer('pricing')}
            />
          </div>
        </div>

        {/* Media */}
        {!isCreate && (
          <div className="bg-white px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-zinc-950">Media</p>
              {images.length > 0 && (
                <button
                  className="text-sm font-medium text-zinc-500"
                  onClick={() => setOpenDrawer('media')}
                >
                  See all
                </button>
              )}
            </div>
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-100 cursor-pointer"
                    onClick={() => setOpenDrawer('media')}
                  />
                ))}
              </div>
            ) : (
              <button
                className="flex flex-col items-center justify-center gap-2 w-full h-40 rounded-lg border border-dashed border-zinc-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-6 h-6 text-zinc-950" />
                <span className="text-sm font-medium text-zinc-950">Add images</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleInlineUpload}
            />
          </div>
        )}

        {/* Note */}
        <div className="bg-white px-4">
          <div className="flex items-center h-8 mt-2">
            <p className="text-base font-semibold text-zinc-950">Note</p>
          </div>
          <div>
            <PropertyRow
              label={
                data.note
                  ? <span className="text-zinc-600 truncate">{data.note}</span>
                  : (
                    <span className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                      <CirclePlus className="w-5 h-5 shrink-0" />
                      Add note
                    </span>
                  )
              }
              onClick={() => setOpenDrawer('note')}
            />
          </div>
        </div>

      </div>

      <BottomNav active="services" />

      {/* Action sheet */}
      {!isCreate && (
        <ActionSheet
          open={actionSheetOpen}
          onClose={() => setActionSheetOpen(false)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}

      {/* Drawers */}
      <StatusDrawer
        open={openDrawer === 'status'}
        onOpenChange={open => setOpenDrawer(open ? 'status' : null)}
        value={data.status}
        onSave={handleStatusSave}
      />
      <NameDescriptionDrawer
        open={openDrawer === 'nameDescription'}
        onOpenChange={open => setOpenDrawer(open ? 'nameDescription' : null)}
        name={data.name}
        description={data.description}
        onSave={handleNameDescriptionSave}
      />
      <PricingDrawer
        open={openDrawer === 'pricing'}
        onOpenChange={open => setOpenDrawer(open ? 'pricing' : null)}
        price={data.price}
        subscriptionPrice={data.subscriptionPrice}
        onSave={handlePricingSave}
      />
      <CategoryDrawer
        open={openDrawer === 'category'}
        onOpenChange={open => setOpenDrawer(open ? 'category' : null)}
        value={data.category}
        onSave={handleCategorySave}
      />
      <NoteDrawer
        open={openDrawer === 'note'}
        onOpenChange={open => setOpenDrawer(open ? 'note' : null)}
        value={data.note}
        onSave={handleNoteSave}
      />
      {!isCreate && (
        <MediaDrawer
          open={openDrawer === 'media'}
          onOpenChange={open => setOpenDrawer(open ? 'media' : null)}
          serviceId={id!}
          images={images}
          onImagesChange={setImages}
        />
      )}
    </div>
  )
}

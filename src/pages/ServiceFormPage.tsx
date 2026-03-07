import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Share2, Ellipsis, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { ActionSheet } from '@/components/resource/ActionSheet'

interface ServiceForm {
  name: string
  status: 'active' | 'draft'
  description: string
  category: string
  price: string
  subscriptionPrice: string
  durationMinutes: string
  imageUrl: string | null
}

const DEFAULT_FORM: ServiceForm = {
  name: '',
  status: 'active',
  description: '',
  category: '',
  price: '',
  subscriptionPrice: '',
  durationMinutes: '',
  imageUrl: null,
}

const STATUS_OPTIONS: { value: 'active' | 'draft'; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: '#009689' },
  { value: 'draft', label: 'Draft', color: '#a3a3a3' },
]

export default function ServiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isCreate = id === 'new'

  const [form, setForm] = useState<ServiceForm>(DEFAULT_FORM)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!isCreate)
  const [isSaving, setIsSaving] = useState(false)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  // Load business ID
  useEffect(() => {
    supabase
      .from('businesses')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setBusinessId(data.id)
      })
  }, [])

  // Load service for edit mode
  useEffect(() => {
    if (isCreate || !id) return

    async function load() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('id, name, status, description, category, price, subscription_price, duration_minutes, image_url')
        .eq('id', id)
        .single()

      if (!error && data) {
        setForm({
          name: data.name ?? '',
          status: data.status === 'draft' ? 'draft' : 'active',
          description: data.description ?? '',
          category: data.category ?? '',
          price: data.price != null ? String(data.price) : '',
          subscriptionPrice: data.subscription_price != null ? String(data.subscription_price) : '',
          durationMinutes: data.duration_minutes != null ? String(data.duration_minutes) : '',
          imageUrl: data.image_url ?? null,
        })
      }
      setIsLoading(false)
    }

    load()
  }, [id, isCreate])

  function setField<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Service name is required')
      return
    }

    setIsSaving(true)

    const priceVal = form.price ? parseFloat(form.price) : null
    const subPriceVal = form.subscriptionPrice ? parseFloat(form.subscriptionPrice) : null
    const durationVal = form.durationMinutes ? parseInt(form.durationMinutes, 10) : null

    const payload = {
      name: form.name.trim(),
      status: form.status,
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      price: priceVal,
      price_cents: priceVal != null ? Math.round(priceVal * 100) : null,
      subscription_price: subPriceVal,
      duration_minutes: durationVal,
      image_url: form.imageUrl,
    }

    if (isCreate) {
      if (!businessId) {
        setIsSaving(false)
        return
      }
      const { error } = await supabase
        .from('services')
        .insert({ ...payload, business_id: businessId, source: 'manual' })

      if (error) {
        toast.error('Failed to save service')
      } else {
        toast.success('Service created')
        navigate('/services')
      }
    } else {
      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', id!)

      if (error) {
        toast.error('Failed to save service')
      } else {
        toast.success('Service updated')
        navigate('/services')
      }
    }

    setIsSaving(false)
  }

  async function handleDelete() {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id!)

    if (error) {
      toast.error('Failed to delete service')
    } else {
      toast.success('Service deleted')
      navigate('/services')
    }
  }

  async function handleDuplicate() {
    if (!businessId || isCreate) return

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id!)
      .single()

    if (!error && data) {
      const { id: _id, created_at: _ca, ...rest } = data
      const { error: insertError } = await supabase
        .from('services')
        .insert({ ...rest, name: `${rest.name} (copy)`, source: 'manual' })

      if (insertError) {
        toast.error('Failed to duplicate service')
      } else {
        toast.success('Service duplicated')
        navigate('/services')
      }
    }
  }

  const currentStatus = STATUS_OPTIONS.find(o => o.value === form.status) ?? STATUS_OPTIONS[0]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-14 pb-4 bg-white">
        {isCreate ? (
          <>
            <button
              className="h-9 px-3 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-900"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <p className="flex-1 text-center text-sm font-semibold text-zinc-950">New service</p>
            <button
              className="h-9 px-3 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-900 disabled:opacity-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </>
        ) : (
          <>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0"
              onClick={() => navigate('/services')}
            >
              <ChevronLeft className="w-5 h-5 text-zinc-900" />
            </button>
            <p className="flex-1 text-center text-sm font-semibold text-zinc-950 truncate">
              {form.name || 'Service'}
            </p>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0">
              <Share2 className="w-4 h-4 text-zinc-700" />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0"
              onClick={() => setActionSheetOpen(true)}
            >
              <Ellipsis className="w-4 h-4 text-zinc-700" />
            </button>
          </>
        )}
      </div>

      {/* Form body */}
      <div className="flex-1 px-4 pb-12 flex flex-col gap-6">

        {/* Status */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</p>
          <div className="relative">
            <button
              className="flex items-center gap-2 w-full h-11 px-3 border border-zinc-200 rounded-lg bg-white text-left"
              onClick={() => setStatusOpen(prev => !prev)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentStatus.color }}
              />
              <span className="flex-1 text-sm text-zinc-900">{currentStatus.label}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            </button>

            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-md z-20 overflow-hidden">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className="flex items-center gap-2 w-full px-3 py-3 hover:bg-zinc-50 transition-colors"
                      onClick={() => { setField('status', opt.value); setStatusOpen(false) }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span className="flex-1 text-sm text-zinc-900 text-left">{opt.label}</span>
                      {form.status === opt.value && (
                        <span className="text-xs text-zinc-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</p>
          <input
            type="text"
            placeholder="e.g. Haircut & blowout"
            className="h-11 px-3 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Image</p>
          <div className="h-20 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center bg-zinc-50">
            <p className="text-sm text-zinc-400">Tap to upload image</p>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</p>
          <textarea
            placeholder="Describe this service…"
            rows={3}
            className="px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white resize-none"
            value={form.description}
            onChange={e => setField('description', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</p>
          <input
            type="text"
            placeholder="e.g. Hair, Nails, Skin"
            className="h-11 px-3 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
            value={form.category}
            onChange={e => setField('category', e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Price</p>
          <div className="flex items-center h-11 border border-zinc-200 rounded-lg bg-white overflow-hidden">
            <span className="pl-3 pr-1 text-sm text-zinc-500 shrink-0">$</span>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="flex-1 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
              value={form.price}
              onChange={e => setField('price', e.target.value)}
            />
          </div>
        </div>

        {/* Subscription price */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Subscription price</p>
          <div className="flex items-center h-11 border border-zinc-200 rounded-lg bg-white overflow-hidden">
            <span className="pl-3 pr-1 text-sm text-zinc-500 shrink-0">$</span>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              className="flex-1 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
              value={form.subscriptionPrice}
              onChange={e => setField('subscriptionPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Duration</p>
          <div className="flex items-center h-11 border border-zinc-200 rounded-lg bg-white overflow-hidden">
            <input
              type="number"
              placeholder="0"
              min="0"
              step="1"
              className="flex-1 pl-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none bg-transparent"
              value={form.durationMinutes}
              onChange={e => setField('durationMinutes', e.target.value)}
            />
            <span className="pr-3 pl-1 text-sm text-zinc-500 shrink-0">minutes</span>
          </div>
        </div>

      </div>

      {/* Save button at bottom for edit mode */}
      {!isCreate && (
        <div className="px-4 pb-8">
          <button
            className="w-full h-11 bg-zinc-900 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      {/* Action sheet (edit mode only) */}
      {!isCreate && (
        <ActionSheet
          open={actionSheetOpen}
          onClose={() => setActionSheetOpen(false)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

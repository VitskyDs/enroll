import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Share2, Ellipsis } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { ActionSheet } from '@/components/resource/ActionSheet'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'

const ACTIVE_COLOR = '#009689'
const DRAFT_COLOR = '#a3a3a3'
const INACTIVE_COLOR = '#71717a'

const CATEGORIES = [
  'Hair',
  'Nails',
  'Skin',
  'Massage',
  'Waxing',
  'Lashes & brows',
  'Makeup',
  'Wellness',
  'Fitness',
  'Other',
]

interface ServiceForm {
  name: string
  status: 'active' | 'draft' | 'inactive'
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

const STATUS_OPTIONS: { value: 'active' | 'draft' | 'inactive'; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: ACTIVE_COLOR },
  { value: 'draft', label: 'Draft', color: DRAFT_COLOR },
  { value: 'inactive', label: 'Inactive', color: INACTIVE_COLOR },
]

export default function ServiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isCreate = id === 'new'

  const [form, setForm] = useState<ServiceForm>(DEFAULT_FORM)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!isCreate)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          status: data.status === 'draft' ? 'draft' : data.status === 'inactive' ? 'inactive' : 'active',
          description: data.description ?? '',
          category: data.category ?? '',
          price: data.price != null ? String(data.price) : '',
          subscriptionPrice: data.subscription_price != null ? String(data.subscription_price) : '',
          durationMinutes: data.duration_minutes != null ? String(data.duration_minutes) : '',
          imageUrl: data.image_url ?? null,
        })
        if (data.image_url) {
          const parts = data.image_url.split('/')
          setImageFileName(parts[parts.length - 1] ?? null)
        }
      }
      setIsLoading(false)
    }

    load()
  }, [id, isCreate])

  function setField<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleStatusChange(newStatus: 'active' | 'draft' | 'inactive') {
    setField('status', newStatus)
    setStatusOpen(false)

    if (!isCreate && id) {
      const { error, data } = await supabase
        .from('services')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
      console.log('[ServiceForm] status update:', { newStatus, id, data, error })
      if (error) toast.error('Failed to update status')
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setImageFileName(file.name)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('service-images')
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error('Failed to upload image')
      setImageFileName(null)
    } else {
      const { data: urlData } = supabase.storage
        .from('service-images')
        .getPublicUrl(data.path)
      setField('imageUrl', urlData.publicUrl)
    }

    setIsUploading(false)
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
      category: form.category || null,
      price: priceVal,
      price_cents: priceVal != null ? Math.round(priceVal * 100) : null,
      subscription_price: subPriceVal,
      duration_minutes: durationVal,
      image_url: form.imageUrl,
    }

    if (isCreate) {
      if (!businessId) { setIsSaving(false); return }
      const { error, data } = await supabase
        .from('services')
        .insert({ ...payload, business_id: businessId, source: 'manual' })
        .select()

      console.log('[ServiceForm] insert:', { data, error })
      if (error) {
        toast.error('Failed to save service')
      } else {
        toast.success('Service created')
        navigate('/services')
      }
    } else {
      const { error, data } = await supabase
        .from('services')
        .update(payload)
        .eq('id', id!)
        .select()

      console.log('[ServiceForm] update:', { id, data, error })
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
    if (!window.confirm('Delete this service?')) return

    const { error, count } = await supabase
      .from('services')
      .delete()
      .eq('id', id!)

    console.log('[ServiceForm] delete:', { id, error, count })
    if (error) {
      toast.error('Failed to delete service')
    } else {
      toast.success('Service deleted')
      navigate('/services')
    }
  }

  async function handleDuplicate() {
    const priceVal = form.price ? parseFloat(form.price) : null
    const subPriceVal = form.subscriptionPrice ? parseFloat(form.subscriptionPrice) : null
    const durationVal = form.durationMinutes ? parseInt(form.durationMinutes, 10) : null

    if (!businessId) return

    const { error, data } = await supabase
      .from('services')
      .insert({
        business_id: businessId,
        source: 'manual',
        name: `${form.name.trim()} (copy)`,
        status: form.status,
        description: form.description.trim() || null,
        category: form.category || null,
        price: priceVal,
        price_cents: priceVal != null ? Math.round(priceVal * 100) : null,
        subscription_price: subPriceVal,
        duration_minutes: durationVal,
        image_url: form.imageUrl,
      })
      .select()

    console.log('[ServiceForm] duplicate:', { data, error })
    if (error) {
      toast.error('Failed to duplicate service')
    } else {
      toast.success('Service duplicated')
      navigate('/services')
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
      {isCreate ? (
        <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white">
          <button
            className="h-9 px-4 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-950"
            onClick={() => navigate(-1)}
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
        <div className="flex items-center justify-between px-4 pt-14 pb-4 bg-white">
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
            <button
              className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg"
              onClick={() => setActionSheetOpen(true)}
            >
              <Ellipsis className="w-4 h-4 text-zinc-700" />
            </button>
          </div>
        </div>
      )}

      {/* Form body */}
      <div className="flex-1 px-4 flex flex-col gap-6 pt-6 pb-32">

        {/* Service status */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Service status</p>
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
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            </button>

            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-md z-20 overflow-hidden">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-zinc-50 transition-colors"
                      onClick={() => handleStatusChange(opt.value)}
                    >
                      <span
                        className="w-4 h-4 rounded shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span className="flex-1 text-sm text-zinc-950 text-left">{opt.label}</span>
                      {form.status === opt.value && (
                        <span className="text-xs text-zinc-400">✓</span>
                      )}
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
            placeholder="Service name"
            className="h-9 px-3 border border-zinc-200 rounded-lg text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white shadow-[0_1px_2px_rgba(0,0,0,0)]"
            value={form.name}
            onChange={e => setField('name', e.target.value)}
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Image</p>
          <div
            className="flex items-center h-9 px-3 border border-zinc-200 rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0)] cursor-pointer gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-sm font-medium text-zinc-950 shrink-0">
              {isUploading ? 'Uploading…' : 'Choose File'}
            </span>
            <span className="text-sm text-zinc-400 truncate">
              {imageFileName ?? 'No file chosen'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Service preview"
              className="mt-1 h-20 w-20 object-cover rounded-lg border border-zinc-200"
            />
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Description</p>
          <textarea
            placeholder="Add service description"
            rows={3}
            className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white resize-none shadow-[0_1px_2px_rgba(0,0,0,0)]"
            value={form.description}
            onChange={e => setField('description', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Category</p>
          <Select value={form.category || undefined} onValueChange={v => setField('category', v)}>
            <SelectTrigger className="h-9 border-[#d4d4d4] shadow-[0_1px_2px_rgba(0,0,0,0)] text-sm">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Price</p>
          <div className="flex items-center h-9 border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0)]">
            <span className="pl-3 pr-1 text-sm text-zinc-400 shrink-0">$</span>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              className="flex-1 pr-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none bg-transparent"
              value={form.price}
              onChange={e => setField('price', e.target.value)}
            />
          </div>
        </div>

        {/* Subscription price */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Subscription price</p>
          <div className="flex items-center h-9 border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0)]">
            <span className="pl-3 pr-1 text-sm text-zinc-400 shrink-0">$</span>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              className="flex-1 pr-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none bg-transparent"
              value={form.subscriptionPrice}
              onChange={e => setField('subscriptionPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-950">Duration</p>
          <div className="flex items-center h-9 border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0)]">
            <input
              type="number"
              placeholder="0"
              min="0"
              step="1"
              className="flex-1 pl-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none bg-transparent"
              value={form.durationMinutes}
              onChange={e => setField('durationMinutes', e.target.value)}
            />
            <span className="pr-3 pl-1 text-sm text-zinc-400 shrink-0">Minutes</span>
          </div>
        </div>

        {/* Save button (edit mode only) */}
        {!isCreate && (
          <button
            className="h-11 bg-zinc-950 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        )}

      </div>

      <BottomNav active="services" />

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

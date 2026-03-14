import { useRef, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { DrawerHeader } from '@/components/ui/drawer-header'
import { ActionBar } from '@/components/ui/action-bar'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceId: string
  images: string[]
  onImagesChange: (images: string[]) => void
}

export function MediaDrawer({ open, onOpenChange, serviceId, images, onImagesChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleClose(open: boolean) {
    if (!open) setSelected(new Set())
    onOpenChange(open)
  }

  function toggleSelect(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  async function saveSortOrder(imgs: string[]) {
    await Promise.all(
      imgs.map((url, i) =>
        supabase
          .from('service_images')
          .update({ sort_order: i })
          .eq('url', url)
          .eq('service_id', serviceId),
      ),
    )
  }

  async function handleRemove() {
    const urlsToRemove = Array.from(selected).map(i => images[i])
    const newImages = images.filter((_, i) => !selected.has(i))

    const { error } = await supabase
      .from('service_images')
      .delete()
      .in('url', urlsToRemove)
      .eq('service_id', serviceId)

    if (error) {
      toast.error('Failed to remove images')
      return
    }

    onImagesChange(newImages)
    setSelected(new Set())
    if (newImages.length > 0) await saveSortOrder(newImages)
  }

  function handleDragStart(i: number) {
    setDraggingIndex(i)
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (i !== dragOverIndex) setDragOverIndex(i)
  }

  async function handleDrop(i: number) {
    if (draggingIndex === null || draggingIndex === i) {
      setDraggingIndex(null)
      setDragOverIndex(null)
      return
    }
    const newImages = [...images]
    const [item] = newImages.splice(draggingIndex, 1)
    newImages.splice(i, 0, item)
    onImagesChange(newImages)
    setDraggingIndex(null)
    setDragOverIndex(null)
    await saveSortOrder(newImages)
  }

  function handleDragEnd() {
    setDraggingIndex(null)
    setDragOverIndex(null)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    setUploading(true)

    const { data: uploaded, error } = await supabase.storage
      .from('service-images')
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error('Failed to upload image')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('service-images').getPublicUrl(uploaded.path)
    const url = urlData.publicUrl

    const { error: insertError } = await supabase
      .from('service_images')
      .insert({ service_id: serviceId, url, sort_order: images.length })

    if (insertError) {
      toast.error('Failed to save image')
      setUploading(false)
      return
    }

    onImagesChange([...images, url])
    setUploading(false)
  }

  const hasSelection = selected.size > 0

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent
        aria-describedby={undefined}
        className="max-w-[420px] mx-auto h-[90dvh] flex flex-col overflow-hidden"
      >
        <div className="px-4 shrink-0">
          <DrawerHeader title="Media" />
        </div>

        {/* Scrollable content — extra bottom padding when action bar visible */}
        <div
          className="flex-1 overflow-y-auto px-4 mt-6 transition-[padding-bottom] duration-300 ease-in-out"
          style={{ paddingBottom: hasSelection ? '88px' : '32px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-zinc-950">Media ({images.length})</p>
            {hasSelection && (
              <button
                className="text-sm font-medium text-zinc-500"
                onClick={() => setSelected(new Set())}
              >
                Done
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {images.map((url, i) => {
              const isSelected = selected.has(i)
              const isDragOver = dragOverIndex === i && draggingIndex !== i
              return (
                <div
                  key={url}
                  className="relative shrink-0 w-20 h-20 cursor-pointer"
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={handleDragEnd}
                  onClick={() => toggleSelect(i)}
                >
                  <img
                    src={url}
                    alt=""
                    draggable={false}
                    className={`w-20 h-20 object-cover rounded-lg bg-zinc-100 select-none transition-opacity ${
                      draggingIndex === i ? 'opacity-40' : 'opacity-100'
                    }`}
                  />
                  {/* Selected: dark overlay + border */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-lg bg-black/20 border-2 border-zinc-950 pointer-events-none" />
                  )}
                  {/* Drag-over indicator */}
                  {isDragOver && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-zinc-950 pointer-events-none" />
                  )}
                  {/* Checkmark badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-zinc-950 rounded-full flex items-center justify-center pointer-events-none">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add button */}
            <button
              className="flex items-center justify-center w-20 h-20 rounded-lg border border-zinc-200 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
              ) : (
                <Plus className="w-6 h-6 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        <ActionBar
          visible={hasSelection}
          count={selected.size}
          onClear={() => setSelected(new Set())}
          onAction={handleRemove}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </DrawerContent>
    </Drawer>
  )
}

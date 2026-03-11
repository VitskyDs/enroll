import { useEffect, useState } from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { DrawerHeader } from '@/components/ui/drawer-header'
import { Switch } from '@/components/ui/switch'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  price: string
  subscriptionPrice: string
  onSave: (values: { price: string; subscriptionPrice: string }) => Promise<void>
}

export function PricingDrawer({ open, onOpenChange, price, subscriptionPrice, onSave }: Props) {
  const [localPrice, setLocalPrice] = useState(price)
  const [localSubPrice, setLocalSubPrice] = useState(subscriptionPrice)
  const [subEnabled, setSubEnabled] = useState(!!subscriptionPrice)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLocalPrice(price)
      setLocalSubPrice(subscriptionPrice)
      setSubEnabled(!!subscriptionPrice)
    }
  }, [open, price, subscriptionPrice])

  const isDirty =
    localPrice !== price ||
    subEnabled !== !!subscriptionPrice ||
    (subEnabled && localSubPrice !== subscriptionPrice)

  function handleCancel() {
    setLocalPrice(price)
    setLocalSubPrice(subscriptionPrice)
    setSubEnabled(!!subscriptionPrice)
    onOpenChange(false)
  }

  async function handleSave() {
    setSaving(true)
    await onSave({
      price: localPrice,
      subscriptionPrice: subEnabled ? localSubPrice : '',
    })
    setSaving(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined} className="max-w-[420px] mx-auto px-6 pb-8 h-[95dvh]">
        <DrawerHeader
          title="Pricing"
          state={isDirty ? 'dirty' : 'default'}
          onCancel={handleCancel}
          onSave={handleSave}
          saving={saving}
        />

        <div className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-500">Price</label>
            <div className="flex items-center h-9 border border-input rounded-md bg-transparent overflow-hidden shadow-sm">
              <span className="pl-3 pr-1 text-sm text-zinc-400 shrink-0">$</span>
              <input
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={localPrice}
                onChange={e => setLocalPrice(e.target.value)}
                className="flex-1 pr-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none bg-transparent"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={subEnabled}
              onCheckedChange={setSubEnabled}
              className="data-[state=checked]:bg-[#009689]"
            />
            <span className="text-sm text-zinc-600">Enable subscription</span>
          </div>

          {subEnabled && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-500">Subscription price</label>
              <div className="flex items-center h-9 border border-input rounded-md bg-transparent overflow-hidden shadow-sm">
                <span className="pl-3 pr-1 text-sm text-zinc-400 shrink-0">$</span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  value={localSubPrice}
                  onChange={e => setLocalSubPrice(e.target.value)}
                  className="flex-1 pr-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

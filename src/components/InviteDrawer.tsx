import { Copy } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer'

interface InviteDrawerProps {
  open: boolean
  onClose: () => void
  businessName?: string
  description?: string
}

export function InviteDrawer({
  open,
  onClose,
  businessName = 'Your business',
  description = 'Invite customers to join your loyalty program',
}: InviteDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="bg-[#171717] border-0 px-6 pb-8 gap-6">
        {/* White card: heading + QR code */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center gap-5 w-full">
          <div className="flex flex-col gap-1 text-center w-full">
            <p className="text-xl font-semibold text-zinc-900 leading-6">{businessName}</p>
            <p className="text-sm text-zinc-500 leading-5">{description}</p>
          </div>
          {/* QR code placeholder */}
          <div className="w-[208px] h-[208px] bg-zinc-100 rounded-lg flex items-center justify-center">
            <QrPlaceholder />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 w-full">
          <button className="w-full bg-zinc-100 text-[#171717] font-medium text-base leading-6 py-3 px-8 rounded-lg flex items-center justify-center gap-2">
            Copy invite link
            <Copy className="w-4 h-4" />
          </button>
          <button className="w-full bg-zinc-100 text-[#171717] font-medium text-base leading-6 py-3 px-8 rounded-lg">
            Share
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function QrPlaceholder() {
  // 7×7 grid of cells to approximate a QR code appearance
  const cells = Array.from({ length: 49 }, (_, i) => {
    // Deterministic pattern based on index — corners are finder patterns
    const row = Math.floor(i / 7)
    const col = i % 7
    const inTopLeft = row < 3 && col < 3
    const inTopRight = row < 3 && col >= 4
    const inBottomLeft = row >= 4 && col < 3
    if (inTopLeft || inTopRight || inBottomLeft) return true
    return (i * 37 + row * 13 + col * 7) % 3 !== 0
  })

  return (
    <div className="grid grid-cols-7 gap-0.5 w-28 h-28">
      {cells.map((filled, i) => (
        <div
          key={i}
          className={`rounded-[1px] ${filled ? 'bg-zinc-800' : 'bg-zinc-100'}`}
        />
      ))}
    </div>
  )
}

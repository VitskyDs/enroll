import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, Share2 } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

interface InviteDrawerProps {
  open: boolean
  onClose: () => void
  businessName?: string
  description?: string
  inviteUrl?: string
}

export function InviteDrawer({
  open,
  onClose,
  businessName = 'Your business',
  description = 'Invite customers to join your loyalty program',
  inviteUrl = 'https://enroll.app/join/your-business',
}: InviteDrawerProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select a temp input
      const el = document.createElement('input')
      el.value = inviteUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleShare() {
    const shareData = { url: inviteUrl, title: `Join ${businessName}'s loyalty program` }
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    handleCopy()
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="bg-[#171717] border-0 px-6 pb-8 gap-6">
        <DrawerTitle className="sr-only">Invite customers</DrawerTitle>
        <DrawerDescription className="sr-only">Share your loyalty program link with customers</DrawerDescription>

        {/* White card: heading + QR code */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center gap-5 w-full">
          <div className="flex flex-col gap-1 text-center w-full">
            <p className="text-xl font-semibold text-zinc-900 leading-6">{businessName}</p>
            <p className="text-sm text-zinc-500 leading-5">{description}</p>
          </div>
          <div className="w-[208px] h-[208px] bg-white rounded-lg flex items-center justify-center">
            <QRCode
              value={inviteUrl}
              size={192}
              bgColor="#ffffff"
              fgColor="#18181b"
              level="M"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleCopy}
            className="w-full bg-zinc-100 text-[#171717] font-medium text-base leading-6 py-3 px-8 rounded-lg flex items-center justify-center gap-2"
          >
            {copied ? 'Copied!' : 'Copy invite link'}
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="w-full bg-zinc-100 text-[#171717] font-medium text-base leading-6 py-3 px-8 rounded-lg flex items-center justify-center gap-2"
          >
            Share
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

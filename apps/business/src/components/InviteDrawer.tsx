import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

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
    if (navigator.share) {
      try {
        await navigator.share({ url: inviteUrl, title: `Join ${businessName}'s loyalty program` })
      } catch {
        // user cancelled — do nothing
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-sm p-6 flex flex-col gap-6">
        <DialogTitle className="sr-only">Invite customers</DialogTitle>
        <DialogDescription className="sr-only">Share your loyalty program link with customers</DialogDescription>

        {/* QR card */}
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col gap-1 text-center w-full">
            <p className="text-xl font-semibold text-zinc-900 leading-6">{businessName}</p>
            <p className="text-sm text-zinc-500 leading-5">{description}</p>
          </div>
          <div className="w-[208px] h-[208px] bg-white rounded-lg flex items-center justify-center border border-zinc-100">
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
      </DialogContent>
    </Dialog>
  )
}

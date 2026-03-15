import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Share2, Gift, CircleCheck } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import BottomNav from '@/components/BottomNav'
import { cn } from '@/lib/utils'

// Placeholder data — will come from auth context + business config
const REFERRAL_LINK = `${window.location.origin}/join?ref=username`
const REWARD = '$10 off'
const CONDITIONS = [
  'Your friend must be a new customer and complete their first visit.',
  'Reward is credited to your account within 48 hours of their visit.',
]

// Placeholder avatars — real ones will come from referred users' profiles
const AVATARS = [
  'https://i.pravatar.cc/176?img=32',
  'https://i.pravatar.cc/176?img=47',
  'https://i.pravatar.cc/176?img=16',
]

export default function ReferPage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: browser blocked clipboard
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me',
          text: `Use my link to get ${REWARD} on your first visit.`,
          url: REFERRAL_LINK,
        })
      } catch {
        // user cancelled or not supported
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <AppHeader action={{ label: 'Track referrals', onClick: () => navigate('/refer/track') }} />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Hero card ─────────────────────────────────────────── */}
        <div className="px-4">
          <div className="bg-[#f5f5f5] rounded-2xl p-6 flex flex-col gap-6 items-center">
            {/* Heading + subtitle */}
            <div className="flex flex-col gap-3 text-center w-full">
              <h1 className="text-[48px] font-semibold leading-[48px] tracking-[-1.5px] text-black">
                Invite friends and earn {REWARD}
              </h1>
              <p className="text-[18px] font-normal leading-[27px] text-black">
                Refer to friends and earn {REWARD} for yourself. Your friend gets {REWARD} to spend.
              </p>
            </div>

            {/* Overlapping avatars — 3 photos + 1 dark check circle */}
            <div className="flex items-center justify-center pr-4">
              {AVATARS.map((src, i) => (
                <div
                  key={i}
                  className="w-[88px] h-[88px] rounded-full border-2 border-[#fafafa] -mr-4 relative shrink-0 overflow-hidden bg-white"
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                  />
                </div>
              ))}
              <div className="w-[88px] h-[88px] rounded-full bg-[#171717] -mr-4 shrink-0 flex items-center justify-center border-2 border-[#fafafa]">
                <Check size={28} className="text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Share your link */}
            <div className="flex flex-col gap-2 w-[320px]">
              <p className="text-sm font-medium text-[#737373]">Share your link</p>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-[#171717] text-white rounded-lg h-9 w-full"
              >
                <span className="text-sm font-medium">Share</span>
                <Share2 size={16} />
              </button>

              {/* URL + copy pill */}
              <div className="flex items-center gap-3 bg-white border border-[#e5e5e5] rounded-lg px-3 h-10 shadow-[0px_1px_2px_0px_rgba(0,0,0,0)]">
                <span className="flex-1 text-sm text-[#0a0a0a] truncate">{REFERRAL_LINK}</span>
                <button
                  onClick={handleCopy}
                  className={cn(
                    'bg-[#171717] text-white text-xs font-medium rounded-full px-2 h-6 whitespace-nowrap transition-opacity',
                    copied && 'opacity-70',
                  )}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main section ──────────────────────────────────────── */}
        <div className="flex flex-col gap-6 items-center px-4 py-6">
          {/* Small overlapping avatars with gift badge */}
          <div className="relative flex items-center self-center">
            <div className="flex items-center bg-[#f5f5f5] rounded-full pl-3 pr-7 py-3">
              {AVATARS.map((src, i) => (
                <div
                  key={i}
                  className="w-[72px] h-[72px] rounded-full border-2 border-[#fafafa] -mr-4 relative shrink-0 overflow-hidden bg-white"
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                  />
                </div>
              ))}
            </div>
            {/* Gift badge positioned over the last avatar */}
            <div className="absolute right-0 -top-1 w-10 h-10 rounded-full bg-[#009689] border-2 border-white flex items-center justify-center">
              <Gift size={18} className="text-white" />
            </div>
          </div>

          {/* Heading + condition/reward line */}
          <div className="flex flex-col gap-3 text-center w-full">
            <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-black">
              Invite friends
            </h2>
            <p className="text-[18px] font-normal leading-[27px] text-black">
              Refer a friend to earn {REWARD} when they complete their first visit.
            </p>
          </div>

          {/* Important information */}
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-[20px] font-semibold leading-6 text-[#0a0a0a]">
              Important information
            </h3>
            <div className="flex flex-col gap-4">
              {CONDITIONS.map((condition, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CircleCheck size={24} className="text-[#009689] shrink-0 mt-0.5" />
                  <p className="text-base font-normal leading-6 text-black">{condition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

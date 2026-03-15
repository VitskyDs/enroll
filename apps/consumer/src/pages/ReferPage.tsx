import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Share2, Gift, CircleCheck } from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import { useLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { formatReferrerReward, formatRefereeReward, getReferralConditions } from '@/lib/referral'
import { cn } from '@/lib/utils'

// Placeholder referral link — in production this includes the authenticated
// customer's unique code returned from the backend.
const REFERRAL_LINK = `${window.location.origin}/join?ref=username`

// Placeholder avatars — will come from referred users' profiles
const AVATARS = [
  'https://i.pravatar.cc/176?img=32',
  'https://i.pravatar.cc/176?img=47',
  'https://i.pravatar.cc/176?img=16',
]

// z-index per avatar slot so later items are always painted on top
const AVATAR_Z = ['z-[1]', 'z-[2]', 'z-[3]']

export default function ReferPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const businessId = searchParams.get('business') ?? undefined

  const { program, loading, error } = useLoyaltyProgram(businessId)
  const [copied, setCopied] = useState(false)

  // Derive display values from the live program
  const rules = (program?.referral_rules ?? {}) as Record<string, unknown>
  const currencyName = program?.currency_name ?? 'points'
  const referrerReward = program ? formatReferrerReward(rules, currencyName) : null
  const refereeReward = program ? formatRefereeReward(rules, currencyName) : null
  const conditions = program ? getReferralConditions(rules) : []

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Browser blocked clipboard access
    }
  }

  async function handleShare() {
    const shareData = {
      title: program ? `Join ${program.program_name}` : 'Join my loyalty program',
      text: refereeReward
        ? `Use my link to get ${refereeReward} on your first visit.`
        : 'Join and get rewarded on your first visit.',
      url: REFERRAL_LINK,
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    // Fallback: copy link to clipboard
    handleCopy()
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Scrollable area — AppHeader scrolls with content ──── */}
      <div className="flex-1 overflow-y-auto">
        {/* Header scrolls, not pinned */}
        <AppHeader action={{ label: 'Track referrals', onClick: () => navigate('/refer/track') }} />

        {/* ── Hero card ───────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <div className="bg-[#f5f5f5] rounded-2xl p-6 flex flex-col gap-6 items-center">

            {/* Heading + subtitle */}
            <div className="flex flex-col gap-3 text-center w-full">
              {loading ? (
                <>
                  <div className="h-12 rounded-xl bg-black/[0.08] animate-pulse w-3/4 mx-auto" />
                  <div className="h-5 rounded-lg bg-black/[0.08] animate-pulse w-full" />
                  <div className="h-5 rounded-lg bg-black/[0.08] animate-pulse w-4/5 mx-auto" />
                </>
              ) : error ? (
                <p className="text-base text-[#737373]">Unable to load program details.</p>
              ) : (
                <>
                  <h1 className="text-[48px] font-semibold leading-[48px] tracking-[-1.5px] text-black">
                    Invite friends and earn {referrerReward}
                  </h1>
                  <p className="text-[18px] font-normal leading-[27px] text-black">
                    {program ? `Refer ${program.program_name} to friends and earn ` : 'Earn '}
                    {referrerReward} for yourself. Your friend gets {refereeReward} to spend.
                  </p>
                </>
              )}
            </div>

            {/* Overlapping avatars — 3 photos + check circle on top */}
            <div className="flex items-center justify-center overflow-clip pr-4 w-full">
              {AVATARS.map((src, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-[88px] h-[88px] rounded-full border-2 border-[#fafafa] -mr-4 relative shrink-0 overflow-hidden bg-white',
                    AVATAR_Z[i],
                  )}
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                  />
                </div>
              ))}
              {/* Check circle — z-[4] ensures it sits on top of all photos */}
              <div className="w-[88px] h-[88px] rounded-full bg-[#171717] -mr-4 shrink-0 flex items-center justify-center border-2 border-[#fafafa] z-[4] relative">
                <Check size={28} className="text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Share your link — URL + inline copy only (Share button is at the bottom) */}
            <div className="flex flex-col gap-2 w-[320px]">
              <p className="text-sm font-medium text-[#737373]">Share your link</p>
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

        {/* ── Invite friends section ───────────────────────────── */}
        <div className="flex flex-col gap-6 items-center px-4 py-6">

          {/* Small overlapping avatars with gift badge */}
          <div className="relative flex items-center self-center">
            <div className="flex items-center bg-[#f5f5f5] rounded-full pl-3 pr-7 py-3">
              {AVATARS.map((src, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-[72px] h-[72px] rounded-full border-2 border-[#fafafa] -mr-4 relative shrink-0 overflow-hidden bg-white',
                    AVATAR_Z[i],
                  )}
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                  />
                </div>
              ))}
            </div>
            <div className="absolute left-[172px] -top-1 w-10 h-10 rounded-full bg-[#009689] border-2 border-[#fafafa] flex items-center justify-center z-[5]">
              <Gift size={18} className="text-white" />
            </div>
          </div>

          {/* Heading + condition/reward summary */}
          <div className="flex flex-col gap-3 text-center w-full">
            <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-black">
              Invite friends
            </h2>
            {loading ? (
              <div className="h-6 rounded-lg bg-black/[0.08] animate-pulse w-3/4 mx-auto" />
            ) : (
              <p className="text-[18px] font-normal leading-[27px] text-black">
                {referrerReward && refereeReward
                  ? `Earn ${referrerReward} when a friend joins. They get ${refereeReward}.`
                  : 'Refer a friend and both of you get rewarded.'}
              </p>
            )}
          </div>
        </div>

        {/* ── Important information ─────────────────────────────── */}
        {!loading && conditions.length > 0 && (
          <div className="flex flex-col gap-4 px-4 py-6">
            <p className="text-[18px] font-semibold leading-[27px] text-[#0a0a0a]">
              Important information
            </p>
            <div className="flex flex-col gap-4">
              {conditions.map((condition, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CircleCheck size={24} className="text-[#009689] shrink-0 mt-0.5" />
                  <p className="text-base font-normal leading-6 text-black">{condition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Share bar ────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[#e5e5e5] bg-white pb-6 pt-3 px-4 shadow-[0px_-1px_3px_0px_rgba(0,0,0,0.1),0px_-1px_2px_0px_rgba(0,0,0,0.06)]">
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-[#171717] text-white rounded-lg h-9 w-full"
        >
          <span className="text-sm font-medium">Share</span>
          <Share2 size={16} />
        </button>
      </div>
    </div>
  )
}

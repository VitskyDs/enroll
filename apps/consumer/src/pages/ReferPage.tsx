import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Share2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Placeholder — will be replaced by the authenticated customer's referral code.
const REFERRAL_CODE = 'MAYA-7X4K'
const REFERRAL_LINK = `${window.location.origin}/join?ref=${REFERRAL_CODE}`
const INCENTIVE = 'Give $10 off, get $10 off'

export default function ReferPage() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard without interaction
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Enroll',
          text: `Use my referral code ${REFERRAL_CODE} to get $10 off your first visit.`,
          url: REFERRAL_LINK,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="pt-safe px-4 pb-3 flex items-center gap-3 border-b">
        <h1 className="text-sm font-semibold">Refer a friend</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        {/* Incentive banner */}
        <div className="rounded-2xl bg-primary text-primary-foreground px-5 py-6 text-center">
          <p className="text-2xl font-bold tracking-tight">{INCENTIVE}</p>
          <p className="mt-1 text-sm opacity-80">
            Your friend gets $10 off their first visit. You get $10 credit when they book.
          </p>
        </div>

        {/* Referral code card */}
        <Card>
          <CardContent className="pt-5 pb-4 flex flex-col gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Your referral code
              </p>
              <p className="text-2xl font-mono font-bold tracking-wider">{REFERRAL_CODE}</p>
            </div>

            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <span className="flex-1 text-xs text-muted-foreground truncate">{REFERRAL_LINK}</span>
              <button
                onClick={handleCopy}
                className={cn(
                  'shrink-0 p-1 rounded transition-colors',
                  copied ? 'text-green-600' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label="Copy referral link"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button className="flex-1 gap-2" onClick={handleShare}>
                <Share2 size={16} />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Track referrals link */}
        <Link
          to="/refer/track"
          className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:bg-muted transition-colors"
        >
          <Users size={18} className="text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Track your referrals</p>
            <p className="text-xs text-muted-foreground">See who joined and your pending credits</p>
          </div>
        </Link>

        {/* How it works */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          {[
            { step: '1', label: 'Share your code', detail: 'Send your unique link to a friend.' },
            {
              step: '2',
              label: 'Friend books a visit',
              detail: 'They use your code at checkout.',
            },
            {
              step: '3',
              label: 'You both get rewarded',
              detail: '$10 off for them, $10 credit for you.',
            },
          ].map(({ step, label, detail }) => (
            <div key={step} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

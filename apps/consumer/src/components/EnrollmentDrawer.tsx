import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, ChevronRight } from 'lucide-react'
import type { ConsumerBusiness } from '@/hooks/useBusiness'
import type { ConsumerLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'

interface Customer {
  points: number
}

interface EnrollmentDrawerProps {
  open: boolean
  business: ConsumerBusiness
  program: ConsumerLoyaltyProgram | null
  customer: Customer
  onClose: () => void
}

function formatEarnRule(program: ConsumerLoyaltyProgram | null): string {
  if (!program) return 'Earn points on every visit'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules = (program.earn_rules ?? {}) as Record<string, any>
  if (rules.points_per_dollar != null) {
    return `Earn ${rules.points_per_dollar} ${program.currency_name} per $1 spent`
  }
  if (rules.points_per_visit != null) {
    return `Earn ${rules.points_per_visit} ${program.currency_name} per visit`
  }
  if (rules.cashback_percent != null) {
    return `Earn ${rules.cashback_percent}% cashback on every visit`
  }
  return `Earn ${program.currency_name} on every visit`
}

// Simple SVG circular progress ring
function PointsMeter({ points, target = 100 }: { points: number; target?: number }) {
  const radius = 24
  const strokeWidth = 3
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = Math.min(points / target, 1)
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="relative flex items-center justify-center size-[72px] shrink-0">
      {/* Track */}
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24" cy="24" r={normalizedRadius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="24" cy="24" r={normalizedRadius}
          fill="none"
          stroke="#f5be53"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>
      {/* Coin icon */}
      <div className="relative z-10 size-[32px] rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #ffdc99 0%, #f5be53 100%)' }}>
        <div className="size-[12px] text-[#c37a1a] font-bold text-[10px] flex items-center justify-center">★</div>
      </div>
    </div>
  )
}

export default function EnrollmentDrawer({ open, business, program, customer, onClose }: EnrollmentDrawerProps) {
  const navigate = useNavigate()
  const points = customer.points ?? 0
  const nextTarget = 100

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="mt-0 max-h-[90vh] overflow-y-auto border-0 px-6 pb-6 gap-6" aria-describedby={undefined}>
        <VisuallyHidden><DrawerTitle>Welcome to {business.name}</DrawerTitle></VisuallyHidden>
        {/* Image placeholder */}
        <div className="bg-[#f5f5f5] rounded-2xl h-[176px] w-full shrink-0 mt-2" />

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold leading-6 tracking-tight text-[#0a0a0a]">
            You're enrolled
          </h2>
          <p className="text-sm text-[#737373] leading-5">
            You're now enrolled to {business.name} and can start earning rewards,
            which get even better the longer you stay with us.
          </p>
        </div>

        {/* Badge-check rows */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 items-start">
            <BadgeCheck size={24} className="text-[#009689] shrink-0" />
            <div>
              <p className="text-base font-medium text-[#0a0a0a] leading-6">{formatEarnRule(program)}</p>
              <p className="text-sm text-[#737373] leading-5">Automatically applied on every visit</p>
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <BadgeCheck size={24} className="text-[#009689] shrink-0" />
            <div>
              <p className="text-base font-medium text-[#0a0a0a] leading-6">Loyalty points</p>
              <p className="text-sm text-[#737373] leading-5">
                You've earned {points} points with {business.name}
              </p>
            </div>
          </div>
        </div>

        {/* Points meter card */}
        <button
          onClick={() => { onClose(); navigate('/loyalty') }}
          className="flex items-center gap-3 border border-[#e5e5e5] rounded-lg p-3 w-full text-left"
        >
          <PointsMeter points={points} target={nextTarget} />
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm font-medium text-[#737373] leading-5">Your points</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[30px] font-semibold leading-8 tracking-[-1px] text-[#0a0a0a]">{points}</span>
              <span className="text-sm text-[#737373] leading-5">/{nextTarget}</span>
            </div>
          </div>
          <ChevronRight size={24} className="text-[#0a0a0a] shrink-0" />
        </button>

        {/* Tier text */}
        {program && (
          <p className="text-sm text-[#0a0a0a] leading-5">
            Complete your first visit to start earning {program.currency_name} and unlock rewards.
          </p>
        )}
      </DrawerContent>
    </Drawer>
  )
}

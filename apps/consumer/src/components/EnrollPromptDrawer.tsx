import { BadgeCheck } from 'lucide-react'
import type { ConsumerBusiness } from '@/hooks/useBusiness'
import type { ConsumerLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { Drawer, DrawerContent } from '@/components/ui/drawer'

interface EnrollPromptDrawerProps {
  open: boolean
  business: ConsumerBusiness
  program: ConsumerLoyaltyProgram | null
  onClose: () => void
  onGoogleEnroll: () => void
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

function getJoinPoints(program: ConsumerLoyaltyProgram | null): number | null {
  if (!program) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules = (program.referral_rules ?? {}) as Record<string, any>
  return rules.referee_points ?? rules.points_on_join ?? null
}

export default function EnrollPromptDrawer({
  open,
  business,
  program,
  onClose,
  onGoogleEnroll,
}: EnrollPromptDrawerProps) {
  const joinPoints = getJoinPoints(program)

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="mt-0 max-h-[90vh] overflow-y-auto border-0 px-6 pb-6 gap-6">
        {/* Image placeholder */}
        <div className="bg-[#f5f5f5] rounded-2xl h-[176px] w-full shrink-0 mt-2" />

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold leading-6 tracking-tight text-[#0a0a0a]">
            Enroll to {business.name}
          </h2>
          <p className="text-sm text-[#737373] leading-5">
            Enroll to {business.name} and start earning rewards, which get even better the longer you stay with us.
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
                You've earned 20 points with {business.name}
              </p>
            </div>
          </div>
        </div>

        {/* Join points card */}
        {joinPoints != null && (
          <div className="flex items-center gap-3 border border-[#e5e5e5] rounded-lg p-4">
            <div className="size-[40px] rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(180deg, #ffdc99 0%, #f5be53 100%)' }}>
              <span className="text-[#c37a1a] font-bold text-base">★</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-[#737373] leading-5">Enroll now and get</p>
              <p className="text-[30px] font-semibold leading-8 tracking-[-1px] text-[#0a0a0a]">
                {joinPoints}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onGoogleEnroll}
          className="bg-[#171717] text-white text-sm font-medium rounded-lg h-12 w-full flex items-center justify-center"
        >
          Enroll using Google
        </button>
      </DrawerContent>
    </Drawer>
  )
}

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { BadgeCheck } from 'lucide-react'
import type { ConsumerBusiness } from '@/hooks/useBusiness'
import type { ConsumerLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'

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
  const currencyName = program?.currency_name ?? 'points'

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="border-0 px-6 pb-12 pt-6 gap-6" aria-describedby={undefined}>
        <VisuallyHidden><DrawerTitle>Enroll to {business.name}</DrawerTitle></VisuallyHidden>

        {/* Cover image */}
        {business.cover_image_url ? (
          <img
            src={business.cover_image_url}
            alt={business.name}
            className="w-full h-[176px] object-cover rounded-2xl shrink-0"
          />
        ) : (
          <div className="bg-[#f5f5f5] rounded-2xl h-[176px] w-full shrink-0" />
        )}

        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold leading-6 text-[#0a0a0a]">
            Enroll to {business.name}
          </h2>
          <p className="text-sm text-[#737373] leading-5">
            Enroll to {business.name} and start earning rewards, which only get better the longer you stay with us.
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
                {joinPoints != null
                  ? `By enrolling you earn ${joinPoints} ${currencyName}`
                  : `Earn ${currencyName} with every visit`}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onGoogleEnroll}
          className="bg-[#171717] text-white text-sm font-medium rounded-lg h-9 w-full flex items-center justify-center"
        >
          Enroll using Google
        </button>
      </DrawerContent>
    </Drawer>
  )
}

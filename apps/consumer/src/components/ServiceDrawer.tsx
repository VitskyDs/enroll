import type { ConsumerService } from '@/hooks/useServices'
import type { ConsumerLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { Drawer, DrawerContent } from '@/components/ui/drawer'

interface ServiceDrawerProps {
  open: boolean
  service: ConsumerService | null
  program: ConsumerLoyaltyProgram | null
  isEnrolled?: boolean
  onEnrollRequired?: () => void
  onClose: () => void
}

function formatPrice(cents: number | null): string {
  if (cents == null) return '—'
  return `$${(cents / 100).toFixed(0)}`
}

function formatEarnedPoints(program: ConsumerLoyaltyProgram | null): string {
  if (!program) return '—'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules = (program.earn_rules ?? {}) as Record<string, any>
  if (rules.points_per_visit != null) {
    return `${rules.points_per_visit} ${program.currency_name}`
  }
  if (rules.points_per_dollar != null) {
    return `${rules.points_per_dollar}× per $1`
  }
  if (rules.cashback_percent != null) {
    return `${rules.cashback_percent}% back`
  }
  return 'Loyalty points'
}

function CoinIcon() {
  return (
    <div className="relative shrink-0 size-4">
      <div className="absolute inset-y-[3.13%] left-[6.25%] right-0 rounded-full bg-[#c37a1a]" />
      <div className="absolute inset-y-[3.13%] left-0 right-[6.25%] rounded-full bg-gradient-to-b from-[#ffdc99] to-[#f5be53] flex items-center justify-center">
        <svg viewBox="0 0 10 10" className="size-[60%]" fill="#c37a1a">
          <path d="M5 0.5l1.18 2.39 2.64.38-1.91 1.86.45 2.63L5 6.5 2.64 7.76l.45-2.63L1.18 3.27l2.64-.38L5 0.5z" />
        </svg>
      </div>
    </div>
  )
}

export default function ServiceDrawer({ open, service, program, isEnrolled, onEnrollRequired, onClose }: ServiceDrawerProps) {
  function handleCta() {
    if (!isEnrolled) {
      onClose()
      onEnrollRequired?.()
    }
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="border-0 pb-12">

        {/* Service image */}
        <div className="px-4 pt-4">
          {service?.image_url ? (
            <img
              src={service.image_url}
              alt={service?.name}
              className="w-full h-[148px] object-cover rounded-2xl shrink-0"
            />
          ) : (
            <div className="bg-[#f5f5f5] h-[148px] w-full rounded-2xl shrink-0" />
          )}
        </div>

        {service && (
          <>
            {/* Heading */}
            <div className="flex flex-col gap-1 px-4 py-4">
              <h2 className="text-[20px] font-semibold leading-6 text-[#0a0a0a]">
                {service.name}
              </h2>
              {service.description && (
                <p className="text-sm text-[#737373] leading-5">{service.description}</p>
              )}
            </div>

            {/* Duration row */}
            {service.duration_minutes != null && (
              <div className="flex items-center px-4 py-3">
                <p className="flex-1 text-sm font-medium text-[#0a0a0a] leading-5">Duration</p>
                <p className="text-sm font-medium text-[#0a0a0a] leading-5 whitespace-nowrap">
                  {service.duration_minutes} min
                </p>
              </div>
            )}

            {/* Points earned row */}
            <div className="flex items-start px-4 py-3">
              <div className="flex-1 flex flex-col gap-0.5">
                <p className="text-sm font-medium text-[#0a0a0a] leading-5">Points earned</p>
                <p className="text-sm text-[#737373] leading-5">Subscribe to earn pts every month</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <CoinIcon />
                <p className="text-sm font-medium text-[#0a0a0a] leading-5 whitespace-nowrap">
                  {formatEarnedPoints(program)}
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 px-4 pt-2">
              {service.subscription_price_cents != null && (
                <button
                  onClick={handleCta}
                  className="bg-[#171717] text-white text-sm font-medium rounded-lg h-9 w-full flex items-center justify-center">
                  Subscribe and save {formatPrice(service.subscription_price_cents)}/month
                </button>
              )}
              {service.price_cents != null && (
                <button
                  onClick={handleCta}
                  className="bg-[#f5f5f5] text-[#171717] text-sm font-medium rounded-lg h-9 w-full flex items-center justify-center">
                  Buy once {formatPrice(service.price_cents)}
                </button>
              )}
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

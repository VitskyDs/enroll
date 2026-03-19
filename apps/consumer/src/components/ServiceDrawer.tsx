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

export default function ServiceDrawer({ open, service, program, isEnrolled, onEnrollRequired, onClose }: ServiceDrawerProps) {
  function handleCta() {
    if (!isEnrolled) {
      onClose()
      onEnrollRequired?.()
    }
  }
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="mt-0 max-h-[90vh] overflow-y-auto border-0 pb-12">
        {/* Service image */}
        {service?.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="w-full h-[176px] object-cover shrink-0"
          />
        ) : (
          <div className="bg-[#f5f5f5] h-[176px] w-full shrink-0" />
        )}

        {service && (
          <>
            {/* Heading */}
            <div className="flex flex-col gap-1 px-4 py-4">
              <h2 className="text-[20px] font-semibold leading-6 tracking-tight text-[#0a0a0a]">
                {service.name}
              </h2>
              {service.description && (
                <p className="text-sm text-[#737373] leading-5">{service.description}</p>
              )}
            </div>

            {/* Duration row */}
            {service.duration_minutes != null && (
              <div className="flex items-center px-4 py-4 border-t border-[#f5f5f5]">
                <p className="flex-1 text-sm font-medium text-[#0a0a0a] leading-5">Duration</p>
                <p className="text-sm font-medium text-[#0a0a0a] leading-5 whitespace-nowrap">
                  {service.duration_minutes} min
                </p>
              </div>
            )}

            {/* Points earned row */}
            <div className="flex items-start px-4 py-4 border-t border-[#f5f5f5]">
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm font-medium text-[#0a0a0a] leading-5">Points earned</p>
                <p className="text-sm text-[#737373] leading-5">Subscribe to earn pts every month</p>
              </div>
              <p className="text-sm font-medium text-[#0a0a0a] leading-5 whitespace-nowrap ml-4">
                {formatEarnedPoints(program)}
              </p>
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

import { Plus } from 'lucide-react'
import type { ConsumerService } from '@/hooks/useServices'

interface ServiceCardProps {
  service: ConsumerService
  onClick: () => void
}

function formatPrice(cents: number | null): string {
  if (cents == null) return ''
  return `$${(cents / 100).toFixed(0)}`
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const hasDiscount =
    service.subscription_price_cents != null &&
    service.price_cents != null &&
    service.subscription_price_cents < service.price_cents

  return (
    <div
      onClick={onClick}
      className="flex items-start border border-[#e5e5e5] rounded-2xl overflow-hidden bg-white min-h-[128px] cursor-pointer"
    >
      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 p-4">
        <div className="flex flex-col">
          <p className="text-base font-semibold text-black leading-6">{service.name}</p>
          {service.description && (
            <p className="text-[14px] text-[#737373] leading-5 line-clamp-2">{service.description}</p>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-medium text-[#0a0a0a] leading-5">
              {formatPrice(service.subscription_price_cents ?? service.price_cents)}
            </p>
            {hasDiscount && (
              <p className="text-[14px] text-[#737373] leading-5 line-through">
                {formatPrice(service.price_cents)}
              </p>
            )}
          </div>
          <p className="text-[14px] text-[#0a0a0a] leading-5">x1 a month</p>
        </div>
      </div>

      {/* Image */}
      <div className="relative w-[112px] self-stretch shrink-0 flex items-end justify-end p-4">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#f5f5f5]" />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="relative z-10 bg-white/80 rounded-full size-9 flex items-center justify-center"
        >
          <Plus size={16} className="text-[#0a0a0a]" />
        </button>
      </div>
    </div>
  )
}

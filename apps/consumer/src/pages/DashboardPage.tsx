import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, MapPin, Images, Share2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/hooks/useBusiness'
import { useServices, type ConsumerService } from '@/hooks/useServices'
import { useLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { formatRefereeReward } from '@/lib/referral'
import { cn } from '@/lib/utils'
import EnrollmentDrawer from '@/components/EnrollmentDrawer'
import ServiceDrawer from '@/components/ServiceDrawer'
import BottomNav from '@/components/BottomNav'

interface EnrolledCustomer {
  id: string
  points: number
}

function formatPrice(cents: number | null): string {
  if (cents == null) return ''
  return `$${(cents / 100).toFixed(0)}`
}

// ── Service card ─────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: ConsumerService
  onClick: () => void
}

function ServiceCard({ service, onClick }: ServiceCardProps) {
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

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-black/[0.08] animate-pulse rounded-lg', className)} />
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [searchParams] = useSearchParams()
  const businessId = searchParams.get('business') ?? undefined

  const { business, loading: bizLoading } = useBusiness(businessId)
  const { services, loading: svcLoading } = useServices(businessId ?? business?.id)
  const { program } = useLoyaltyProgram(businessId ?? business?.id)

  const [selectedService, setSelectedService] = useState<ConsumerService | null>(null)
  const [showEnrollmentDrawer, setShowEnrollmentDrawer] = useState(false)
  const [enrolledCustomer, setEnrolledCustomer] = useState<EnrolledCustomer | null>(null)

  const isEnrolled = enrolledCustomer !== null

  // Check if user is already signed in + enrolled on mount
  useEffect(() => {
    const resolvedBusinessId = businessId ?? business?.id
    if (!resolvedBusinessId) return

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      const { data } = await supabase
        .from('customers')
        .select('id, points')
        .eq('user_id', session.user.id)
        .eq('business_id', resolvedBusinessId)
        .maybeSingle()
      if (data) setEnrolledCustomer(data as EnrolledCustomer)
    })
  }, [businessId, business?.id])

  // Detect Google OAuth redirect and handle enrollment
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const resolvedBusinessId = businessId ?? business?.id
          if (!resolvedBusinessId) return

          const user = session.user

          // Check if customer already enrolled
          const { data: existing } = await supabase
            .from('customers')
            .select('id, points')
            .eq('user_id', user.id)
            .eq('business_id', resolvedBusinessId)
            .maybeSingle()

          if (existing) {
            // Returning user — restore session silently
            setEnrolledCustomer(existing as EnrolledCustomer)
            return
          }

          // New enrollment
          const { data: customer } = await supabase
            .from('customers')
            .insert({
              user_id: user.id,
              business_id: resolvedBusinessId,
              name: user.user_metadata?.full_name ?? user.email ?? 'Guest',
              email: user.email,
              status: 'active',
              points: 0,
              joined_at: new Date().toISOString(),
            })
            .select('id, points')
            .single()

          if (customer) {
            setEnrolledCustomer(customer as EnrolledCustomer)
            setShowEnrollmentDrawer(true)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [businessId, business?.id])

  async function handleEnroll() {
    const redirectTo = window.location.href
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  // Derive the enrollment incentive copy from the program
  const currencyName = program?.currency_name ?? 'points'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules = (program?.referral_rules ?? {}) as Record<string, any>
  const refereeReward = program ? formatRefereeReward(rules, currencyName) : null
  const bannerTitle = program
    ? `Join ${program.program_name} and get rewarded`
    : 'Earn rewards on every visit'
  const bannerSub = refereeReward
    ? `When you enroll. ${refereeReward}.`
    : 'Points on every visit.'

  const loading = bizLoading

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">

        {/* ── Header — cover image + logo ──────────────────────────── */}
        <div className="relative pb-[28px] px-4 pt-[64px]">
          {/* Cover image */}
          <div className="relative rounded-lg h-[165px] w-full overflow-hidden bg-[#f5f5f5]">
            {business?.cover_image_url && (
              <img
                src={business.cover_image_url}
                alt={business.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* Gallery pill */}
            <button className="absolute bottom-3 right-3 z-10 bg-[#f5f5f5] rounded-lg flex items-center gap-1.5 px-2 py-1">
              <Images size={12} className="text-[#171717]" />
              <span className="text-xs font-medium text-[#171717]">Gallery</span>
            </button>
          </div>
          {/* Logo circle — overlaps cover */}
          <div className="absolute bottom-0 left-8 size-[64px] rounded-full bg-white border border-[#e5e5e5] shadow-sm overflow-hidden">
            {business?.logo_url && (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="px-4 pt-2 flex flex-col gap-6">

          {/* Title row */}
          <div className="flex gap-2 items-start">
            {/* Left: name + tagline */}
            <div className="flex-1 flex flex-col gap-2">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </>
              ) : (
                <>
                  <p className="text-[24px] font-semibold leading-[29px] tracking-[-1px] text-[#0a0a0a]">
                    {business?.name ?? 'Business'}
                  </p>
                  <p className="text-[14px] text-[#737373] leading-5">
                    {business?.tagline ?? business?.industry ?? ''}
                  </p>
                </>
              )}
            </div>

            {/* Right: share icon (always visible) + enroll button (hidden when enrolled) */}
            <div className="flex flex-col gap-1 items-end shrink-0">
              <div className="flex gap-2 items-center">
                <button className="bg-[#f5f5f5] rounded-full size-8 flex items-center justify-center">
                  <Share2 size={16} className="text-[#171717]" />
                </button>
                {!isEnrolled && (
                  <button
                    onClick={handleEnroll}
                    className="bg-[#171717] text-white text-[14px] font-medium rounded-full px-3 h-8 whitespace-nowrap"
                  >
                    Enroll
                  </button>
                )}
              </div>
              {!isEnrolled && (
                <p className="text-[12px] text-[#737373] leading-4">
                  {refereeReward ? `Free. ${refereeReward} on join.` : 'Free to join.'}
                </p>
              )}
            </div>
          </div>

          {/* Metadata bar */}
          {!loading && (business?.hours || business?.address) && (
            <div className="flex items-center gap-0 flex-wrap">
              {business?.hours && (
                <div className="flex items-center gap-1.5 px-2 py-0.5">
                  <Clock size={12} className="text-[#737373]" />
                  <span className="text-[12px] font-semibold text-[#737373]">{business.hours}</span>
                </div>
              )}
              {business?.hours && business?.address && (
                <div className="size-1 rounded-full bg-[#737373] mx-1" />
              )}
              {business?.address && (
                <div className="flex items-center gap-1.5 px-2 py-0.5">
                  <MapPin size={12} className="text-[#737373]" />
                  <span className="text-[12px] font-semibold text-[#737373]">{business.address}</span>
                </div>
              )}
              <div className="size-1 rounded-full bg-[#737373] mx-1" />
              <button className="px-2 py-0.5">
                <span className="text-[12px] font-medium text-[#404040]">More</span>
              </button>
            </div>
          )}

          {/* Loyalty enrollment banner — hidden once enrolled */}
          {!isEnrolled && (
            <div className="bg-[#f5f5f5] rounded-2xl flex items-start overflow-hidden">
              <div className="flex-1 flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[18px] font-semibold leading-[27px] text-black">{bannerTitle}</p>
                  <p className="text-[14px] text-[#737373] leading-5">{bannerSub}</p>
                </div>
                <button
                  onClick={handleEnroll}
                  className="bg-[#171717] text-white text-[14px] font-medium rounded-full px-6 h-10 self-start whitespace-nowrap"
                >
                  Enroll now
                </button>
              </div>
              {/* Decorative image placeholder */}
              <div className="w-[120px] self-stretch bg-[#e5e5e5] shrink-0" />
            </div>
          )}

          {/* Services section */}
          <div className={cn('flex flex-col gap-4', isEnrolled ? 'pb-28' : 'pb-8')}>
            <div className="flex flex-col gap-1">
              <p className="text-[20px] font-semibold leading-6 text-[#0a0a0a]">Services</p>
              <p className="text-base text-[#737373] leading-6">Subscribe to popular services and save</p>
            </div>

            {svcLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[128px] rounded-2xl" />
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className="flex flex-col gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => setSelectedService(service)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#737373]">No services available.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Service drawer ───────────────────────────────────────── */}
      {selectedService && (
        <ServiceDrawer
          service={selectedService}
          program={program}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* ── Enrollment confirmation drawer ───────────────────────── */}
      {showEnrollmentDrawer && business && enrolledCustomer && (
        <EnrollmentDrawer
          business={business}
          program={program}
          customer={enrolledCustomer}
          onClose={() => setShowEnrollmentDrawer(false)}
        />
      )}

      {/* ── Consumer navbar — visible once enrolled ───────────────── */}
      {isEnrolled && <BottomNav />}
    </div>
  )
}

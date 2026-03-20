import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, MapPin, Images, Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/hooks/useBusiness'
import { useServices, type ConsumerService } from '@/hooks/useServices'
import { useLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { formatRefereeReward } from '@/lib/referral'
import { cn } from '@/lib/utils'
import EnrollmentDrawer from '@/components/EnrollmentDrawer'
import EnrollPromptDrawer from '@/components/EnrollPromptDrawer'
import ServiceDrawer from '@/components/ServiceDrawer'
import ServiceCard from '@/components/ServiceCard'
import BottomNav from '@/components/BottomNav'

interface EnrolledCustomer {
  id: string
  points: number
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
  const [logoError, setLogoError] = useState(false)
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false)
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

  function handleEnroll() {
    setShowEnrollPrompt(true)
  }

  async function handleGoogleEnroll() {
    const resolvedBusinessId = businessId ?? business?.id
    if (resolvedBusinessId) {
      sessionStorage.setItem('enroll_business_id', resolvedBusinessId)
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
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
        <div className={cn('relative px-4', business?.cover_image_url ? 'pb-[28px] pt-[64px]' : 'pt-4')}>
          {/* Cover image — only shown when URL exists */}
          {business?.cover_image_url && (
            <div className="relative rounded-lg h-[165px] w-full overflow-hidden bg-[#f5f5f5]">
              <img
                src={business.cover_image_url}
                alt={business.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gallery pill */}
              <button className="absolute bottom-3 right-3 z-10 bg-[#f5f5f5] rounded-lg flex items-center gap-1.5 px-2 py-1">
                <Images size={12} className="text-[#171717]" />
                <span className="text-xs font-medium text-[#171717]">Gallery</span>
              </button>
            </div>
          )}
          {/* Logo circle — overlaps cover when cover exists, inline otherwise */}
          <div className={cn(
            'size-[64px] rounded-full bg-white border border-[#e5e5e5] shadow-sm overflow-hidden flex items-center justify-center',
            business?.cover_image_url ? 'absolute bottom-0 left-8' : 'mt-2'
          )}>
            {business?.logo_url && !logoError ? (
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : business?.name ? (
              <span className="text-[18px] font-semibold text-[#404040] leading-none select-none">
                {business.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </span>
            ) : null}
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
      <ServiceDrawer
        open={!!selectedService}
        service={selectedService}
        program={program}
        isEnrolled={isEnrolled}
        onEnrollRequired={() => { setSelectedService(null); setShowEnrollPrompt(true) }}
        onClose={() => setSelectedService(null)}
      />

      {/* ── Pre-enrollment prompt drawer ─────────────────────────── */}
      {business && (
        <EnrollPromptDrawer
          open={showEnrollPrompt && !isEnrolled}
          business={business}
          program={program}
          onClose={() => setShowEnrollPrompt(false)}
          onGoogleEnroll={handleGoogleEnroll}
        />
      )}

      {/* ── Enrollment confirmation drawer ───────────────────────── */}
      {business && enrolledCustomer && (
        <EnrollmentDrawer
          open={showEnrollmentDrawer}
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

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, MapPin, Menu, Share2, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useBusiness } from '@/hooks/useBusiness'
import { useServices, type ConsumerService } from '@/hooks/useServices'
import { useLoyaltyProgram } from '@/hooks/useLoyaltyProgram'
import { cn } from '@/lib/utils'
import EnrollmentDrawer from '@/components/EnrollmentDrawer'
import EnrollPromptDrawer from '@/components/EnrollPromptDrawer'
import ServiceDrawer from '@/components/ServiceDrawer'
import ServiceCard from '@/components/ServiceCard'

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-black/[0.08] animate-pulse rounded-lg', className)} />
}

// ── Points coin icon ──────────────────────────────────────────────────────────

function PointsCoin() {
  return (
    <div className="relative size-6">
      {/* Side accent */}
      <div className="absolute inset-[3%] rounded-full bg-[#c37a1a]" />
      {/* Front face */}
      <div className="absolute inset-[3%_6%_3%_0] rounded-full bg-gradient-to-b from-[#ffdc99] to-[#f5be53] flex items-center justify-center">
        <Star size={10} className="text-white fill-white" />
      </div>
    </div>
  )
}

// ── User avatar ───────────────────────────────────────────────────────────────

function UserAvatar({ name, email, avatarUrl }: { name?: string; email?: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <div className="size-10 rounded-full overflow-hidden bg-[#f5f5f5]">
        <img src={avatarUrl} alt={name ?? 'User'} className="w-full h-full object-cover" />
      </div>
    )
  }

  const initials = name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : email
      ? email[0].toUpperCase()
      : '?'

  return (
    <div className="size-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
      <span className="text-[14px] font-semibold text-[#0a0a0a] leading-5 select-none">
        {initials}
      </span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlBusinessId = searchParams.get('business') ?? undefined

  const { user, enrolledCustomer, setEnrolledCustomer, setBusinessId, isEnrolled } = useAuth()

  const { business, loading: bizLoading } = useBusiness(urlBusinessId)
  const { services, loading: svcLoading } = useServices(urlBusinessId ?? business?.id)
  const { program } = useLoyaltyProgram(urlBusinessId ?? business?.id)

  const [selectedService, setSelectedService] = useState<ConsumerService | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false)
  const [showEnrollmentDrawer, setShowEnrollmentDrawer] = useState(false)

  // Inform context about the resolved businessId (handles the fallback case
  // where no ?business= param is present and useBusiness returns the latest)
  useEffect(() => {
    const resolved = urlBusinessId ?? business?.id
    if (resolved) setBusinessId(resolved)
  }, [urlBusinessId, business?.id])

  // Auto-enroll: when a signed-in user visits with a resolved business but is
  // not yet enrolled, check for an existing customer record or create one.
  // This replaces the old onAuthStateChange approach which had a race condition
  // (the SIGNED_IN event fired before business data was available).
  useEffect(() => {
    if (!user || isEnrolled) return

    const resolvedBusinessId = urlBusinessId ?? business?.id
    if (!resolvedBusinessId) return

    let cancelled = false

    async function checkAndEnroll() {
      // Check whether customer already exists (returning user)
      const { data: existing } = await supabase
        .from('customers')
        .select('id, points')
        .eq('user_id', user!.id)
        .eq('business_id', resolvedBusinessId!)
        .maybeSingle()

      if (cancelled) return

      if (existing) {
        setEnrolledCustomer(existing)
        return
      }

      // Look up signup bonus from the loyalty program
      const { data: programData } = await supabase
        .from('loyalty_programs')
        .select('referral_rules')
        .eq('business_id', resolvedBusinessId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cancelled) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rules = (programData?.referral_rules ?? {}) as Record<string, any>
      const signupPoints: number = rules.referee_points ?? rules.points_on_join ?? 0

      // New enrollment — create customer record and show confirmation drawer
      const { data: customer } = await supabase
        .from('customers')
        .insert({
          user_id: user!.id,
          business_id: resolvedBusinessId!,
          name: user!.user_metadata?.full_name ?? user!.email ?? 'Guest',
          email: user!.email,
          status: 'active',
          points: signupPoints,
          joined_at: new Date().toISOString(),
        })
        .select('id, points')
        .single()

      if (cancelled) return

      if (customer) {
        setEnrolledCustomer(customer)
        setShowEnrollmentDrawer(true)
      }
    }

    checkAndEnroll()

    return () => { cancelled = true }
  }, [user?.id, urlBusinessId, business?.id, isEnrolled])

  function handleEnroll() {
    setShowEnrollPrompt(true)
  }

  async function handleSignIn() {
    const resolvedBusinessId = urlBusinessId ?? business?.id
    if (resolvedBusinessId) {
      sessionStorage.setItem('enroll_business_id', resolvedBusinessId)
    }
    sessionStorage.setItem('enroll_return_url', window.location.href)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } },
    })
  }

  const loading = bizLoading

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">

        {/* ── Top header bar ────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-16 pb-4 px-4 bg-white shrink-0">
          {/* Left: hamburger menu */}
          <button className="flex items-center justify-center min-h-[36px] min-w-[36px] p-2 rounded-lg">
            <Menu size={16} className="text-[#171717]" />
          </button>

          {/* Right: sign in or points + avatar */}
          {isEnrolled ? (
            <div className="flex items-center gap-2">
              {/* Points badge */}
              <div className="flex items-center gap-2 border border-[#e5e5e5] rounded-md px-4 py-2">
                <PointsCoin />
                <span className="text-[16px] font-semibold text-[#0a0a0a] leading-6">
                  {enrolledCustomer?.points ?? 0}
                </span>
              </div>
              {/* Avatar */}
              <button onClick={() => navigate('/profile')}>
                <UserAvatar
                  name={user?.user_metadata?.full_name}
                  email={user?.email}
                  avatarUrl={user?.user_metadata?.avatar_url}
                />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-[#f5f5f5] rounded-lg px-4 py-2 min-h-[36px]"
            >
              <span className="text-[14px] font-medium text-[#171717] leading-5">Sign in</span>
            </button>
          )}
        </div>

        {/* ── Header — cover image + logo ──────────────────────────── */}
        <div className={cn('relative px-4', business?.cover_image_url ? 'pb-[28px]' : '')}>
          {/* Cover image — only shown when URL exists */}
          {business?.cover_image_url && (
            <div className="relative rounded-lg h-[165px] w-full overflow-hidden bg-[#f5f5f5]">
              <img
                src={encodeURI(business.cover_image_url)}
                alt={business.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
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
        <div className="px-4 pt-6 flex flex-col gap-6">

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

            {/* Right: share icon */}
            <div className="shrink-0">
              <button className="bg-[#f5f5f5] rounded-full size-8 flex items-center justify-center">
                <Share2 size={16} className="text-[#171717]" />
              </button>
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

          {/* Services section */}
          <div className="flex flex-col gap-4 pb-8">
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
          onGoogleEnroll={handleSignIn}
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
    </div>
  )
}

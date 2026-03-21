import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, UserX, ReceiptText, User, CreditCard, TicketPercent, ChevronRight, Pencil, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileUser {
  name: string
  email: string
  avatarUrl: string | null
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-black/[0.08] animate-pulse rounded-lg ${className ?? ''}`} />
}

function Divider() {
  return (
    <div className="relative flex h-px items-center w-full shrink-0">
      <div className="absolute bg-[#e5e5e5] h-px left-0 right-0" />
    </div>
  )
}

interface SectionItemProps {
  icon: React.ReactNode
  label: string
  labelClassName?: string
  trailing?: React.ReactNode
  onClick?: () => void
}

function SectionItem({ icon, label, labelClassName, trailing, onClick }: SectionItemProps) {
  const inner = (
    <>
      <div className="shrink-0 text-[#0a0a0a]">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium leading-5 ${labelClassName ?? 'text-[#0a0a0a]'}`}>
          {label}
        </p>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </>
  )

  const base = 'flex gap-4 items-center py-4 w-full text-left'
  if (onClick) return <button className={base} onClick={onClick}>{inner}</button>
  return <div className={base}>{inner}</div>
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate()
  const { enrolledCustomer, setEnrolledCustomer, businessId } = useAuth()
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) {
        setLoading(false)
        return
      }

      setUser({
        name: authUser.user_metadata?.full_name ?? authUser.email ?? 'User',
        email: authUser.email ?? '',
        avatarUrl: authUser.user_metadata?.avatar_url ?? null,
      })

      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/dashboard')
  }

  async function handleUnenroll() {
    if (!enrolledCustomer) return
    setUnenrolling(true)
    await supabase.from('customers').delete().eq('id', enrolledCustomer.id)
    setEnrolledCustomer(null)
    setUnenrolling(false)
    setShowUnenrollConfirm(false)
    navigate(businessId ? `/dashboard?business=${businessId}` : '/dashboard')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await supabase.from('customers').delete().eq('user_id', authUser.id)
    }
    await supabase.auth.signOut()
    setDeleting(false)
    setShowDeleteConfirm(false)
    navigate('/dashboard')
  }

  const pointsDisplay = enrolledCustomer?.points != null ? `${enrolledCustomer.points} points` : null

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">

        {/* ── Profile header ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4 items-center pt-16 pb-4 px-4">
          {/* Avatar */}
          <div className="relative size-[120px]">
            <div className="size-[120px] rounded-full overflow-hidden bg-[#f5f5f5]">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={48} className="text-[#a3a3a3]" />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 -right-0.5 size-8 bg-[#171717] rounded-full flex items-center justify-center">
              <Pencil size={14} className="text-white" />
            </button>
          </div>

          {/* Name + subtitle */}
          <div className="flex flex-col gap-2 text-center w-full">
            {loading ? (
              <>
                <Skeleton className="h-7 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-2/3 mx-auto" />
              </>
            ) : (
              <>
                <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#0a0a0a]">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[14px] text-[#737373] leading-5">
                  {pointsDisplay
                    ? `So far you've saved ${pointsDisplay}`
                    : `So far you've saved nothing yet`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Personal information ─────────────────────────────────── */}
        <div className="flex flex-col gap-4 p-4">
          <p className="text-base font-semibold leading-6 text-[#0a0a0a]">Personal information</p>
          <div className="flex flex-col">
            <SectionItem
              icon={<ReceiptText size={24} />}
              label="Orders"
              trailing={<ChevronRight size={16} className="text-[#0a0a0a]" />}
            />
            <Divider />
            <SectionItem
              icon={<User size={24} />}
              label="Personal details"
              trailing={<ChevronRight size={16} className="text-[#0a0a0a]" />}
            />
          </div>
        </div>

        {/* ── Payment method ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4 p-4">
          <p className="text-base font-semibold leading-6 text-[#0a0a0a]">Payment method</p>
          <div className="flex flex-col">
            <SectionItem
              icon={<CreditCard size={24} />}
              label="0123"
              trailing={<ChevronRight size={16} className="text-[#0a0a0a]" />}
            />
            <Divider />
            <SectionItem
              icon={<CreditCard size={24} />}
              label="6789"
              trailing={<ChevronRight size={16} className="text-[#0a0a0a]" />}
            />
            <Divider />
            <SectionItem
              icon={<TicketPercent size={24} />}
              label="Credits"
              trailing={<span className="text-[14px] font-medium text-[#0a0a0a]">$15.5</span>}
            />
          </div>
        </div>

        {/* ── Account ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 p-4 pb-6">
          <p className="text-base font-semibold leading-6 text-[#0a0a0a]">Account</p>
          <div className="flex flex-col">
            {enrolledCustomer && (
              <>
                <SectionItem
                  icon={<LogIn size={24} className="text-[#737373]" />}
                  label="Unenroll"
                  labelClassName="text-[#737373]"
                  onClick={() => setShowUnenrollConfirm(true)}
                />
                <Divider />
              </>
            )}
            <SectionItem
              icon={<LogOut size={24} />}
              label="Logout"
              onClick={handleLogout}
            />
            <Divider />
            <SectionItem
              icon={<UserX size={24} className="text-[#dc2626]" />}
              label="Delete account"
              labelClassName="text-[#dc2626]"
              onClick={() => setShowDeleteConfirm(true)}
            />
          </div>
        </div>

      </div>

      {/* ── Unenroll confirmation action sheet ───────────────────── */}
      <Drawer open={showUnenrollConfirm} onOpenChange={setShowUnenrollConfirm}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Unenroll</DrawerTitle>
            <DrawerDescription>
              This will remove you from this loyalty program and forfeit any unredeemed points. Your account will remain active.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <button
              onClick={handleUnenroll}
              disabled={unenrolling}
              className="flex items-center justify-center bg-[#171717] text-white rounded-lg h-10 w-full text-sm font-medium disabled:opacity-50"
            >
              {unenrolling ? 'Unenrolling...' : 'Unenroll'}
            </button>
            <button
              onClick={() => setShowUnenrollConfirm(false)}
              className="flex items-center justify-center bg-[#f5f5f5] text-[#0a0a0a] rounded-lg h-10 w-full text-sm font-medium"
            >
              Cancel
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ── Delete confirmation action sheet ─────────────────────── */}
      <Drawer open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Delete account</DrawerTitle>
            <DrawerDescription>
              This will permanently delete your account and all your rewards data. This action cannot be undone.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center justify-center bg-[#dc2626] text-white rounded-lg h-10 w-full text-sm font-medium disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete account'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex items-center justify-center bg-[#f5f5f5] text-[#0a0a0a] rounded-lg h-10 w-full text-sm font-medium"
            >
              Cancel
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

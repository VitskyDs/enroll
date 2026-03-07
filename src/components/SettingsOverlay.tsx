import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  House,
  UsersRound,
  Send,
  HandHeart,
  ShoppingBag,
  Award,
  Sparkles,
  Hexagon,
  HandCoins,
} from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const MENU_ITEMS = [
  { label: 'Home', icon: House, route: '/dashboard' },
  { label: 'Customers', icon: UsersRound, route: null },
  { label: 'Invite customer', icon: Send, route: null },
  { label: 'Services', icon: HandHeart, route: '/services' },
  { label: 'Products', icon: ShoppingBag, route: null },
  { label: 'Loyalty program', icon: Award, route: '/program' },
  { label: 'Chat', icon: Sparkles, route: null },
  { label: 'Brand', icon: Hexagon, route: null },
  { label: 'Payment provider', icon: HandCoins, route: null },
] as const

export function SettingsOverlay({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  // Step 1: mount/unmount the element
  useEffect(() => {
    if (open) {
      setMounted(true)
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 500)
      return () => clearTimeout(t)
    }
  }, [open])

  // Step 2: trigger the enter transition after the element is in the DOM.
  // A small timeout is more reliable than rAF — it guarantees the browser
  // has painted the initial (hidden) state before we flip visible → true.
  useEffect(() => {
    if (!mounted || !open) return
    const t = setTimeout(() => setVisible(true), 16)
    return () => clearTimeout(t)
  }, [mounted, open])

  if (!mounted) return null

  function handleItem(route: string | null) {
    if (route) {
      navigate(route)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-[#fafafa]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }}
    >
      {/* Header */}
      <div className="pt-16 pb-4 px-4">
        <p
          className="text-2xl font-semibold text-black"
          style={{ lineHeight: '28.8px', letterSpacing: '-1px' }}
        >
          Settings
        </p>
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="flex flex-col gap-4">
          {MENU_ITEMS.map(({ label, icon: Icon, route }) => (
            <button
              key={label}
              className="flex items-center gap-3 h-10 px-2 rounded-md w-full text-left"
              onClick={() => handleItem(route)}
            >
              <Icon className="w-6 h-6 text-[#404040] shrink-0" />
              <span className="text-[20px] font-semibold text-[#404040] leading-6 truncate">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

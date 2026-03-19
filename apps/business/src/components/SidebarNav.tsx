import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { House, Award, HandHeart, UsersRound, Menu, ShoppingBag, Send, Hexagon, HandCoins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsOverlay } from '@/components/SettingsOverlay'

interface Props {
  active?: 'home' | 'program' | 'services' | 'customers'
  onShare?: () => void
}

const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: House, route: '/dashboard' },
  { key: 'program', label: 'Program', icon: Award, route: '/program' },
  { key: 'services', label: 'Services', icon: HandHeart, route: '/services' },
  { key: 'products', label: 'Products', icon: ShoppingBag, route: null },
  { key: 'customers', label: 'Customers', icon: UsersRound, route: '/customers' },
  { key: 'invite', label: 'Invite customer', icon: Send, route: null },
  { key: 'brand', label: 'Brand', icon: Hexagon, route: null },
  { key: 'payment', label: 'Payment provider', icon: HandCoins, route: null },
] as const

export function SidebarNav({ active, onShare }: Props) {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <SettingsOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)} onInvite={onShare} />

      <nav className="flex flex-col gap-1 flex-1 pt-4">
        {NAV_ITEMS.map(({ key, label, icon: Icon, route }) => (
          <Button
            key={key}
            variant="ghost"
            disabled={route === null}
            className={`justify-start gap-3 h-9 px-3 font-normal ${active === key ? 'bg-zinc-100 hover:bg-zinc-100' : ''} ${route === null ? 'opacity-40 cursor-default' : ''}`}
            onClick={() => { if (route) navigate(route) }}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Button>
        ))}
      </nav>

      <div className="pb-4 border-t border-zinc-100 pt-3">
        <Button
          variant="ghost"
          className={`justify-start gap-3 h-9 px-3 font-normal w-full ${settingsOpen ? 'bg-zinc-100 hover:bg-zinc-100' : ''}`}
          onClick={() => setSettingsOpen(s => !s)}
        >
          <Menu className="w-4 h-4 shrink-0" />
          Settings
        </Button>
      </div>
    </>
  )
}

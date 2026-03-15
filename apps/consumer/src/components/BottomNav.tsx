import { Link, useLocation } from 'react-router-dom'
import { Search, House, Send, Award, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { icon: House, path: '/dashboard', label: 'Home' },
  { icon: Send, path: '/refer', label: 'Refer' },
  { icon: Award, path: '/loyalty', label: 'Loyalty' },
  { icon: User, path: '/profile', label: 'Profile' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="flex gap-2 items-start justify-center pb-6 pt-3 px-4 bg-white shadow-[0px_-1px_3px_0px_rgba(0,0,0,0.1),0px_-1px_2px_0px_rgba(0,0,0,0.06)] shrink-0">
      {/* Search — standalone pill */}
      <div className="bg-white p-1 rounded-full shrink-0">
        <Link
          to="/search"
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full"
          aria-label="Search"
        >
          <Search size={24} strokeWidth={1.5} className="text-[#171717]" />
        </Link>
      </div>

      {/* Main nav items */}
      <div className="bg-white flex flex-1 items-center justify-between p-1 rounded-full">
        {NAV_ITEMS.map(({ icon: Icon, path, label }) => {
          const active = pathname === path || pathname.startsWith(path + '/')
          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              className={cn(
                'flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors',
                active ? 'bg-[#f5f5f5]' : '',
              )}
            >
              <Icon size={24} strokeWidth={1.5} className="text-[#171717]" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

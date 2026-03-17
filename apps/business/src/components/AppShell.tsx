import { Outlet, useLocation } from 'react-router-dom'
import { SidebarNav } from '@/components/SidebarNav'

type ActivePage = 'home' | 'program' | 'services' | 'customers'

function getActivePage(pathname: string): ActivePage | undefined {
  if (pathname.startsWith('/dashboard')) return 'home'
  if (pathname.startsWith('/program')) return 'program'
  if (pathname.startsWith('/services')) return 'services'
  if (pathname.startsWith('/customers')) return 'customers'
  return undefined
}

export function AppShell() {
  const { pathname } = useLocation()
  const active = getActivePage(pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-zinc-100 px-3">
        <SidebarNav active={active} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

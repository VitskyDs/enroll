import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarNav } from '@/components/SidebarNav'
import { InviteDrawer } from '@/components/InviteDrawer'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useDemoMode } from '@/hooks/useDemoMode'
import { DEMO_BUSINESS_NAME, DEMO_BUSINESS_SLUG } from '@/data/demoData'

type ActivePage = 'home' | 'program' | 'services' | 'customers'

function getActivePage(pathname: string): ActivePage | undefined {
  if (pathname.startsWith('/dashboard')) return 'home'
  if (pathname.startsWith('/program')) return 'program'
  if (pathname.startsWith('/services')) return 'services'
  if (pathname.startsWith('/customers')) return 'customers'
  return undefined
}

export interface AppShellContext {
  openInvite: () => void
}

export function AppShell() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const demoMode = useDemoMode()
  const active = getActivePage(pathname)

  const [inviteOpen, setInviteOpen] = useState(false)
  const [businessName, setBusinessName] = useState(demoMode ? DEMO_BUSINESS_NAME : '')
  const [inviteUrl, setInviteUrl] = useState(() => {
    if (demoMode) {
      const base = import.meta.env.VITE_CONSUMER_URL ?? window.location.origin
      return `${base}/join/${DEMO_BUSINESS_SLUG}`
    }
    return ''
  })

  useEffect(() => {
    if (demoMode || !user) return
    supabase
      .from('businesses')
      .select('name, slug')
      .eq('owner_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.name) setBusinessName(data.name)
        if (data?.slug) {
          const base = import.meta.env.VITE_CONSUMER_URL ?? window.location.origin
          setInviteUrl(`${base}/join/${data.slug}`)
        }
      })
  }, [user, demoMode])

  const openInvite = () => setInviteOpen(true)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-zinc-100 px-3">
        <SidebarNav active={active} onShare={openInvite} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet context={{ openInvite } satisfies AppShellContext} />
      </main>

      <InviteDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        businessName={businessName}
        inviteUrl={inviteUrl}
      />
    </div>
  )
}

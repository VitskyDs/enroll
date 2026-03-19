import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Bell, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useDemoMode } from '@/hooks/useDemoMode'
import { BottomNav } from '@/components/BottomNav'
import { Row } from '@/components/ChecklistRow'
import { DEMO_BUSINESS_NAME } from '@/data/demoData'
import type { AppShellContext } from '@/components/AppShell'

const CHECKLIST_ITEMS = [
  { label: 'Invite your first customers', description: 'Share your loyalty link' },
  { label: 'Add your branding', description: 'Upload your logo and set brand colors' },
  { label: 'Set up a payment provider', description: 'Connect Stripe to accept payment' },
  { label: 'Preview your business', description: "See it through your customer's eyes" },
  { label: 'Download the app', description: 'Get the merchant app on your phone' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const demoMode = useDemoMode()
  const { openInvite } = useOutletContext<AppShellContext>()
  const [businessName, setBusinessName] = useState<string>(demoMode ? DEMO_BUSINESS_NAME : 'Your business')
  const [businessId, setBusinessId] = useState<string | null>(null)

  useEffect(() => {
    if (demoMode || !user) return
    supabase
      .from('businesses')
      .select('id, name')
      .eq('owner_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.id) setBusinessId(data.id)
        if (data?.name) setBusinessName(data.name)
      })
  }, [user, demoMode])

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28 lg:pb-6">
      <div className="flex flex-col gap-6 px-4 lg:px-6 pt-safe w-full max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-2">
          <p className="flex-1 text-xl font-semibold text-zinc-900 leading-6 truncate">
            {businessName}
          </p>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-100 transition-colors">
            <Bell className="w-4 h-4 text-zinc-700" />
          </button>
        </div>

        {/* Banner */}
        <div className="bg-zinc-100 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-base font-medium text-zinc-900 leading-6">
                Your loyalty program is live
              </p>
            </div>
            <p className="text-xs text-zinc-500 leading-4">
              Start inviting customers and grow your members.
            </p>
          </div>
          <button
            onClick={openInvite}
            className="w-full h-10 bg-zinc-900 text-white text-sm font-medium rounded-lg"
          >
            Invite customers
          </button>
        </div>

        {/* Get started */}
        <div className="flex flex-col gap-4">
          {/* Section heading */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-medium text-zinc-900 leading-7">Get started</p>
              <p className="text-base text-zinc-500 leading-6">
                Follow this guide to get up and running
              </p>
            </div>
            <div className="self-start border border-zinc-200 rounded-lg px-2 py-0.5">
              <p className="text-xs font-semibold text-zinc-500 leading-4">0 / 5 completed</p>
            </div>
          </div>

          {/* Checklist */}
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            {CHECKLIST_ITEMS.map((item, i) => (
              <Row
                key={item.label}
                label={item.label}
                description={item.description}
                isLast={i === CHECKLIST_ITEMS.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
      </div>

      {import.meta.env.DEV && (
        <button
          onClick={async () => {
            if (!businessId) return
            await supabase.from('businesses').update({ loyalty_program_id: null }).eq('id', businessId)
            await supabase.from('loyalty_programs').delete().eq('business_id', businessId)
            await supabase.from('services').delete().eq('business_id', businessId)
            await supabase.from('businesses').delete().eq('id', businessId)
            navigate('/onboarding')
          }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-xs text-zinc-400 underline underline-offset-2 whitespace-nowrap"
        >
          dev: reset onboarding
        </button>
      )}

      <BottomNav active="home" onShare={openInvite} />
    </div>
  )
}

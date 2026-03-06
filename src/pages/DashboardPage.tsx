import { useEffect, useState } from 'react'
import {
  Bell,
  Menu,
  Sparkles,
  CircleDashed,
  ChevronRight,
  Search,
  House,
  Send,
  Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const CHECKLIST_ITEMS = [
  { label: 'Invite your first customers', description: 'Share your loyalty link' },
  { label: 'Add your branding', description: 'Upload your logo and set brand colors' },
  { label: 'Set up a payment provider', description: 'Connect Stripe to accept payment' },
  { label: 'Preview your business', description: "See it through your customer's eyes" },
  { label: 'Download the app', description: 'Get the merchant app on your phone' },
]

export default function DashboardPage() {
  const [businessName, setBusinessName] = useState<string>('Your business')

  useEffect(() => {
    supabase
      .from('businesses')
      .select('name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.name) setBusinessName(data.name)
      })
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Scrollable content */}
      <div className="flex-1 flex flex-col gap-6 px-4 pt-14 pb-28">

        {/* Header */}
        <div className="flex items-center gap-2">
          <p className="flex-1 text-xl font-semibold text-zinc-900 leading-6 truncate">
            {businessName}
          </p>
          <div className="flex items-center gap-1">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-100 transition-colors">
              <Bell className="w-4 h-4 text-zinc-700" />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-100 transition-colors">
              <Menu className="w-4 h-4 text-zinc-700" />
            </button>
          </div>
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
          <button className="w-full h-10 bg-zinc-900 text-white text-sm font-medium rounded-lg">
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
              <div
                key={item.label}
                className={`flex items-start gap-2 p-4 bg-white ${
                  i < CHECKLIST_ITEMS.length - 1 ? 'border-b border-zinc-200' : ''
                }`}
              >
                <CircleDashed className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <p className="text-base font-semibold text-zinc-700 leading-6">{item.label}</p>
                  <p className="text-sm text-zinc-500 leading-5">{item.description}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-sm flex items-center justify-center gap-2 px-4 pt-3 pb-6">
        {/* Search — inert */}
        <div className="bg-white rounded-full p-1">
          <button className="flex items-center justify-center w-12 h-12 rounded-full">
            <Search className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Main section with Home active */}
        <div className="flex-1 flex items-center justify-between bg-white rounded-full p-1">
          {/* Home — active */}
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100">
            <House className="w-6 h-6 text-zinc-900" />
          </button>
          {/* Send — inert */}
          <button className="flex items-center justify-center w-12 h-12 rounded-full">
            <Send className="w-6 h-6 text-zinc-500" />
          </button>
          {/* Loyalty/Star — inert */}
          <button className="flex items-center justify-center w-12 h-12 rounded-full">
            <Star className="w-6 h-6 text-zinc-500" />
          </button>
          {/* Menu — inert */}
          <button className="flex items-center justify-center w-12 h-12 rounded-full">
            <Menu className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Sparkles — inert */}
        <div className="bg-white rounded-full p-1">
          <button className="flex items-center justify-center w-12 h-12 rounded-full">
            <Sparkles className="w-6 h-6 text-zinc-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

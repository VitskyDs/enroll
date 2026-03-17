import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, House, Send, Award, Menu, Sparkles } from 'lucide-react'
import { SettingsOverlay } from '@/components/SettingsOverlay'

interface Props {
  active?: 'home' | 'program' | 'services' | 'customers'
  onShare?: () => void
}

const PILL_SHADOW = { boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }
const SAFE_PADDING = { paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }

export function BottomNav({ active: activeProp, onShare }: Props) {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const active = settingsOpen ? undefined : activeProp

  return (
    <>
      <SettingsOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)} onInvite={onShare} />

      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 flex items-start justify-center gap-3 px-4 pt-3 z-50"
        style={{ ...SAFE_PADDING, maxWidth: '420px', width: '100%', justifySelf: 'center' }}
      >
        {/* Left pill: Search */}
        <div className="bg-white rounded-full p-1 flex items-center shrink-0" style={PILL_SHADOW}>
          <button className="flex items-center justify-center w-12 h-12 rounded-full">
            <Search className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Middle pill: Home | Send | Loyalty | Menu */}
        <div className="flex-1 flex items-center justify-between bg-white rounded-full p-1" style={PILL_SHADOW}>
          <button
            className={`flex items-center justify-center w-12 h-12 rounded-full ${active === 'home' ? 'bg-zinc-100' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            <House className={`w-6 h-6 ${active === 'home' ? 'text-zinc-900' : 'text-zinc-500'}`} />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-full" onClick={onShare}>
            <Send className="w-6 h-6 text-zinc-500" />
          </button>
          <button
            className={`flex items-center justify-center w-12 h-12 rounded-full ${active === 'program' ? 'bg-zinc-100' : ''}`}
            onClick={() => navigate('/program')}
          >
            <Award className={`w-6 h-6 ${active === 'program' ? 'text-zinc-900' : 'text-zinc-500'}`} />
          </button>
          <button
            className={`flex items-center justify-center w-12 h-12 rounded-full ${settingsOpen ? 'bg-zinc-100' : ''}`}
            onClick={() => setSettingsOpen(s => !s)}
          >
            <Menu className={`w-6 h-6 ${settingsOpen ? 'text-zinc-900' : 'text-zinc-500'}`} />
          </button>
        </div>

        {/* Right pill: Sparkles */}
        <div className="bg-white rounded-full p-1 flex items-center shrink-0" style={PILL_SHADOW}>
          <button className="flex items-center justify-center w-12 h-12 rounded-full">
            <Sparkles className="w-6 h-6 text-zinc-500" />
          </button>
        </div>
      </div>
    </>
  )
}

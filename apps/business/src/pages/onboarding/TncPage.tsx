import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface LocationState {
  terms: string
}

export default function TncPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const terms = state?.terms ?? ''

  return (
    <div className="flex flex-col h-screen bg-white items-center">
    <div className="flex flex-col flex-1 w-full max-w-lg overflow-hidden">

      {/* ── Fixed header ── */}
      <div className="bg-white flex h-[120px] items-end overflow-hidden pb-4 pt-[var(--safe-area-inset-top,0px)] px-4 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="size-4 text-zinc-700" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
          <h1 className="text-[20px] font-semibold text-zinc-900 leading-[26px]">
            Terms and conditions
          </h1>
          <p className="text-base text-zinc-600 leading-6 whitespace-pre-wrap">
            {terms}
          </p>
        </div>
      </div>

    </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface AppHeaderProps {
  /** Right-side action button label + handler */
  action?: { label: string; onClick: () => void }
}

export default function AppHeader({ action }: AppHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="h-[120px] flex items-end overflow-hidden pb-4 pt-16 px-4 bg-white shrink-0">
      <div className="flex flex-1 h-9 items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 bg-[#f5f5f5] rounded-lg shrink-0"
          aria-label="Go back"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        {action && (
          <button
            onClick={action.onClick}
            className="flex items-center justify-center bg-[#f5f5f5] rounded-lg px-4 py-2 h-9"
          >
            <span className="text-sm font-medium text-[#171717]">{action.label}</span>
          </button>
        )}
      </div>
    </header>
  )
}

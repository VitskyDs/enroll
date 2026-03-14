import type { BusinessSearchResult } from '@/services/searchBusiness'

interface Props {
  options: BusinessSearchResult[]
  onSelect: (url: string) => void
  onNone: () => void
}

export function UrlSelector({ options, onSelect, onNone }: Props) {
  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
      {options.map((opt) => (
        <button
          key={opt.url}
          onClick={() => onSelect(opt.url)}
          className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white text-left hover:bg-zinc-50 transition-colors"
        >
          <span className="text-sm font-semibold text-zinc-900">{opt.title}</span>
          <span className="text-xs text-zinc-400 truncate">{opt.url}</span>
          {opt.snippet && (
            <span className="text-sm text-zinc-500 line-clamp-2">{opt.snippet}</span>
          )}
        </button>
      ))}
      <button
        className="w-full h-12 rounded bg-white border border-zinc-200 text-sm font-medium text-zinc-500 mt-1 hover:bg-zinc-50 transition-colors"
        onClick={onNone}
      >
        None of these — I'll enter my details manually
      </button>
    </div>
  )
}

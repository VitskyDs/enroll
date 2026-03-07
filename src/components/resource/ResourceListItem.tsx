interface ResourceListItemProps {
  imageUrl?: string | null
  title: string
  subtitle: string
  badge?: {
    label: string
    color?: string
  }
  onClick?: () => void
}

const ACTIVE_COLOR = '#009689'
const DRAFT_COLOR = '#a3a3a3'

export function ResourceListItem({
  imageUrl,
  title,
  subtitle,
  badge,
  onClick,
}: ResourceListItemProps) {
  return (
    <button
      className="flex items-center gap-4 w-full text-left py-3"
      onClick={onClick}
    >
      {/* Image / placeholder */}
      <div className="shrink-0 w-10 h-10 rounded-sm bg-zinc-100 overflow-hidden">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-950 leading-5 truncate">{title}</p>
        <p className="text-sm text-zinc-500 leading-5 truncate">{subtitle}</p>
      </div>

      {/* Badge */}
      {badge && (
        <div
          className="shrink-0 flex items-center justify-center px-2 py-0.5 rounded-lg"
          style={{ backgroundColor: badge.color ?? ACTIVE_COLOR }}
        >
          <span className="text-xs font-semibold text-white leading-4">{badge.label}</span>
        </div>
      )}
    </button>
  )
}

export { ACTIVE_COLOR, DRAFT_COLOR }

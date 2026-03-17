import { cn } from '@/lib/utils'
import type { UserProfile } from '@/contexts/AuthContext'

interface AvatarProps {
  profile: UserProfile | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

function getInitials(fullName: string | null): string {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ profile, size = 'md', className }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size]

  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.full_name ?? 'User'}
        className={cn('rounded-full object-cover', sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-zinc-200 flex items-center justify-center font-medium text-zinc-600 shrink-0',
        sizeClass,
        className,
      )}
    >
      {getInitials(profile?.full_name ?? null)}
    </div>
  )
}

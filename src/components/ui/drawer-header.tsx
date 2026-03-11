import { X } from 'lucide-react'
import { DrawerClose, DrawerTitle } from '@/components/ui/drawer'

interface Props {
  title: string
  state?: 'default' | 'dirty'
  onCancel?: () => void
  onSave?: () => void
  saving?: boolean
}

export function DrawerHeader({ title, state = 'default', onCancel, onSave, saving }: Props) {
  return (
    <div className="relative flex items-center justify-center h-9 mt-2 shrink-0">
      {state === 'default' ? (
        <DrawerClose className="absolute left-0 flex items-center justify-center w-9 h-9 bg-zinc-100 rounded-lg">
          <X className="w-4 h-4 text-zinc-700" />
        </DrawerClose>
      ) : (
        <>
          <button
            onClick={onCancel}
            className="absolute left-0 flex items-center justify-center h-9 px-4 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="absolute right-0 flex items-center justify-center h-9 px-4 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      )}
      <DrawerTitle className="text-base font-medium text-zinc-950">{title}</DrawerTitle>
    </div>
  )
}

import { CopyPlus, Trash2 } from 'lucide-react'

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  onDuplicate?: () => void
  onDelete: () => void
}

export function ActionSheet({ open, onClose, onDuplicate, onDelete }: ActionSheetProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/10"
        onClick={onClose}
      />

      {/* Floating card — anchored to bottom */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6 pt-4"
        style={{ maxWidth: '420px', margin: '0 auto' }}
      >
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          {/* Heading */}
          <div className="flex items-center h-14 px-3 py-4">
            <p className="text-base font-semibold text-zinc-950">Actions</p>
          </div>

          {/* Duplicate */}
          {onDuplicate && (
            <button
              className="flex items-center gap-2 w-full px-3 py-4 rounded-md hover:bg-zinc-50 transition-colors"
              onClick={() => { onDuplicate(); onClose() }}
            >
              <span className="flex items-center justify-center w-5 p-0.5">
                <CopyPlus className="w-4 h-4 text-zinc-900" />
              </span>
              <span className="flex-1 text-sm text-zinc-950 text-left leading-5">Duplicate</span>
            </button>
          )}

          {/* Delete */}
          <button
            className="flex items-center gap-2 w-full px-3 py-4 rounded-md hover:bg-zinc-50 transition-colors"
            onClick={() => { onDelete(); onClose() }}
          >
            <span className="flex items-center justify-center w-5 p-0.5">
              <Trash2 className="w-4 h-4 text-red-600" />
            </span>
            <span className="flex-1 text-sm text-red-600 text-left leading-5">Delete</span>
          </button>
        </div>
      </div>
    </>
  )
}

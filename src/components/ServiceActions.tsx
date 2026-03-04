interface Props {
  onContinue: () => void
  onRedo: () => void
}

export function ServiceActions({ onContinue, onRedo }: Props) {
  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
      <button
        onClick={onContinue}
        className="w-full h-12 rounded bg-zinc-900 text-white text-sm font-medium"
      >
        Continue
      </button>
      <button
        onClick={onRedo}
        className="w-full h-12 rounded bg-white border border-zinc-200 text-sm font-medium text-zinc-900"
      >
        Redo
      </button>
      <p className="text-xs text-center text-zinc-500 mt-1">
        You can update these settings anytime.
      </p>
    </div>
  )
}
import { useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Props {
  onSend: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message' }: Props) {
  const [value, setValue] = useState('')

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 px-4 py-6 bg-white">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 h-10"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="flex items-center justify-center w-10 h-10 rounded bg-zinc-900 text-white shrink-0 disabled:opacity-40"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}

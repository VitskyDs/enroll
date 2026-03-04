import type { ChatMessage as ChatMessageType } from '@/types'

interface Props {
  message: ChatMessageType
  children?: React.ReactNode
}

export function ChatMessage({ message, children }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-zinc-900 text-white rounded-2xl px-3 py-3 max-w-[85%] text-base leading-6">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      {message.content && (
        <div className="border border-zinc-200 rounded-2xl px-3 py-3 max-w-[85%] text-base leading-6">
          {message.content}
        </div>
      )}
      {children}
    </div>
  )
}
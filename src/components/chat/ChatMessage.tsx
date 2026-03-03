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
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%] text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
        E
      </div>
      <div className="max-w-[75%] space-y-2">
        {message.content && (
          <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm whitespace-pre-wrap">
            {message.content}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

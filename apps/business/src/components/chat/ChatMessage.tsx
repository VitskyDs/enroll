import type { ChatMessage as ChatMessageType } from '@/types'

function renderContent(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

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
        <div className="border border-zinc-200 rounded-2xl px-3 py-3 max-w-[85%] text-base leading-6 self-start">
          {renderContent(message.content)}
        </div>
      )}
      {children}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import type { ChatMessage as ChatMessageType } from '@/types'

interface Props {
  messages: ChatMessageType[]
  isTyping: boolean
  renderWidget?: (message: ChatMessageType) => React.ReactNode
}

export function MessageList({ messages, isTyping, renderWidget }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <ScrollArea className="flex-1">
      <div className="px-4 pt-6 pb-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg}>
            {msg.widget && renderWidget?.(msg)}
          </ChatMessage>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

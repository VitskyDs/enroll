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
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-4 pt-6 pb-[50vh]">
        {messages.map((msg) => {
          const isStandalone = msg.widget === 'service_actions'
          return (
            <div key={msg.id}>
              <ChatMessage message={msg}>
                {msg.widget && !isStandalone && renderWidget?.(msg)}
              </ChatMessage>
              {isStandalone && (
                <div className="mt-6 mb-4">
                  {renderWidget?.(msg)}
                </div>
              )}
            </div>
          )
        })}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

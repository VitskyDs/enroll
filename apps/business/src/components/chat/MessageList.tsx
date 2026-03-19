import { useEffect, useRef } from 'react'
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
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const prevCountRef = useRef(0)

  useEffect(() => {
    const prev = prevCountRef.current
    const curr = messages.length
    prevCountRef.current = curr

    if (curr > prev) {
      const firstNewAssistant = messages.slice(prev).find(m => m.role === 'assistant')
      if (firstNewAssistant) {
        const el = messageRefs.current.get(firstNewAssistant.id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="px-4 pt-6 pb-[50vh]">
      {messages.map((msg) => {
        const isStandalone = msg.widget === 'service_actions'
        return (
          <div
            key={msg.id}
            ref={(el) => {
              if (el) messageRefs.current.set(msg.id, el)
              else messageRefs.current.delete(msg.id)
            }}
          >
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
  )
}

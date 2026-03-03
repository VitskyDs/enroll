import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import type { ChatMessage, OnboardingStep } from '@/types'

const INPUT_STEPS: OnboardingStep[] = ['collect_name', 'collect_type', 'collect_website', 'collect_goal']

interface Props {
  messages: ChatMessage[]
  isTyping: boolean
  step: OnboardingStep
  onSend: (value: string) => void
  renderWidget?: (message: ChatMessage) => React.ReactNode
}

export function ChatShell({ messages, isTyping, step, onSend, renderWidget }: Props) {
  const inputEnabled = INPUT_STEPS.includes(step)

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <header className="px-4 py-3 border-b border-border">
        <h1 className="text-sm font-semibold">Enroll</h1>
        <p className="text-xs text-muted-foreground">AI loyalty program setup</p>
      </header>

      <MessageList messages={messages} isTyping={isTyping} renderWidget={renderWidget} />

      <ChatInput
        onSend={onSend}
        disabled={!inputEnabled}
        placeholder={inputEnabled ? 'Type your answer…' : ''}
      />
    </div>
  )
}

import { ArrowLeft } from 'lucide-react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import type { ChatMessage, OnboardingStep } from '@/types'

const INPUT_STEPS: OnboardingStep[] = ['collect_name', 'collect_website']

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  greeting: 10,
  collect_name: 20,
  collect_type: 30,
  collect_website: 40,
  crawling: 50,
  extracting: 60,
  confirm_services: 70,
  collect_goal: 80,
  generating: 90,
  saving: 90,
  reviewing: 100,
  done: 100,
}

interface Props {
  messages: ChatMessage[]
  isTyping: boolean
  step: OnboardingStep
  onSend: (value: string) => void
  onBack?: () => void
  renderWidget?: (message: ChatMessage) => React.ReactNode
  title: string
  subtitle: string
  inputEnabled?: boolean
}

export function ChatShell({ messages, isTyping, step, onSend, onBack, renderWidget, title, subtitle, inputEnabled: inputEnabledProp }: Props) {
  const inputEnabled = inputEnabledProp ?? INPUT_STEPS.includes(step)
  const progress = STEP_PROGRESS[step]

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex flex-col gap-4 px-4 pt-14 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded bg-zinc-100 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-semibold leading-8">{title}</p>
          <p className="text-base text-zinc-500 leading-6">{subtitle}</p>
        </div>
      </header>

      <MessageList messages={messages} isTyping={isTyping} renderWidget={renderWidget} />

      {inputEnabled && <ChatInput onSend={onSend} />}
    </div>
  )
}

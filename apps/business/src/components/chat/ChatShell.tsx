import { ArrowLeft } from 'lucide-react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import type { ChatMessage, OnboardingStep } from '@/types'

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  // Phase 1 — Your business (0–33%)
  greeting: 5,
  collect_url_or_name: 15,
  searching: 22,
  extracting: 28,
  confirm_services: 33,
  manual_entry: 18,
  // Phase 2 — Program inputs (33–66%)
  collect_primary_goal: 45,
  collect_visit_frequency: 55,
  collect_spend_variance: 66,
  // Phase 3 — Your program (66–100%)
  show_recommendation: 100,
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
  placeholder?: string
}

export function ChatShell({ messages, isTyping, step, onSend, onBack, renderWidget, title, subtitle, inputEnabled: inputEnabledProp, placeholder }: Props) {
  const inputEnabled = inputEnabledProp ?? false
  const progress = STEP_PROGRESS[step] ?? 10

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex flex-col gap-4 px-4 pt-safe pb-6">
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

      {inputEnabled && <ChatInput onSend={onSend} placeholder={placeholder} />}
    </div>
  )
}

import { useEffect } from 'react'
import { ChatShell } from '@/components/chat/ChatShell'
import { ServiceSelector } from '@/components/ServiceSelector'
import { GoalSelector } from '@/components/GoalSelector'
import { ProgramPreview } from '@/components/ProgramPreview'
import { useOnboarding } from '@/hooks/useOnboarding'
import type { ChatMessage, LoyaltyGoal } from '@/types'

export default function App() {
  const { state, start, handleUserInput, confirmServices, selectGoal } = useOnboarding()

  useEffect(() => {
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.step === 'done' && state.programDraft) {
    return (
      <ProgramPreview
        program={state.programDraft}
        businessName={state.businessName}
        onBack={() => window.location.reload()}
      />
    )
  }

  function renderWidget(message: ChatMessage) {
    if (message.widget === 'service_selector' && state.step === 'confirm_services') {
      return (
        <ServiceSelector
          services={state.services}
          onConfirm={(ids) => confirmServices(ids)}
        />
      )
    }
    if (message.widget === 'goal_selector' && state.step === 'collect_goal') {
      return (
        <GoalSelector onSelect={(goal: LoyaltyGoal) => selectGoal(goal)} />
      )
    }
    return null
  }

  return (
    <ChatShell
      messages={state.messages}
      isTyping={state.isTyping}
      step={state.step}
      onSend={handleUserInput}
      renderWidget={renderWidget}
    />
  )
}

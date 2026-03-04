import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChatShell } from '@/components/chat/ChatShell'
import { ServiceSelector } from '@/components/ServiceSelector'
import { ServiceActions } from '@/components/ServiceActions'
import { GoalSelector } from '@/components/GoalSelector'
import { ProgramSectionCard } from '@/components/ProgramSectionCard'
import { ProgramPreview } from '@/components/ProgramPreview'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/hooks/useOnboarding'
import type { ChatMessage, LoyaltyGoal } from '@/types'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const userName = (location.state as { userName?: string })?.userName
  const { state, start, handleUserInput, confirmServices, continueToGoal, redoServices, selectGoal, reviewDone } = useOnboarding(userName)

  useEffect(() => {
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.step === 'done' && state.programDraft) {
    return (
      <ProgramPreview
        program={state.programDraft}
        businessName={state.businessName}
        onBack={() => navigate('/dashboard')}
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
    if (message.widget === 'service_actions' && state.step === 'collect_goal') {
      return (
        <ServiceActions onContinue={continueToGoal} onRedo={redoServices} />
      )
    }
    if (message.widget === 'goal_selector' && state.step === 'collect_goal') {
      return (
        <GoalSelector onSelect={(goal: LoyaltyGoal) => selectGoal(goal)} />
      )
    }
    if (state.programDraft) {
      if (message.widget === 'program_overview') {
        return <ProgramSectionCard section="overview" program={state.programDraft} />
      }
      if (message.widget === 'program_name') {
        return <ProgramSectionCard section="name" program={state.programDraft} />
      }
      if (message.widget === 'program_earn') {
        return <ProgramSectionCard section="earn" program={state.programDraft} />
      }
      if (message.widget === 'program_tiers') {
        return <ProgramSectionCard section="tiers" program={state.programDraft} />
      }
    }
    if (message.widget === 'program_done') {
      return (
        <Button className="w-full mt-2" onClick={reviewDone}>
          Done
        </Button>
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
      onBack={() => navigate('/')}
      renderWidget={renderWidget}
    />
  )
}
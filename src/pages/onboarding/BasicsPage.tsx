import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChatShell } from '@/components/chat/ChatShell'
import { UrlSelector } from '@/components/UrlSelector'
import { ServiceSelector } from '@/components/ServiceSelector'
import { GoalSelector } from '@/components/GoalSelector'
import { useBasicsOnboarding } from '@/hooks/useBasicsOnboarding'
import type { ChatMessage, LoyaltyGoal, OnboardingStep } from '@/types'

const INPUT_STEPS: OnboardingStep[] = ['greeting', 'collect_url_or_name', 'manual_entry']

export default function BasicsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const userName = (location.state as { userName?: string })?.userName

  const { state, start, handleUserInput, selectUrl, confirmServices, selectGoal } =
    useBasicsOnboarding(userName, (data) => {
      navigate('/onboarding/program', { state: data })
    })

  useEffect(() => {
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function renderWidget(message: ChatMessage) {
    if (message.widget === 'url_selector') {
      return (
        <UrlSelector
          options={state.candidateUrls}
          onSelect={(url) => selectUrl(url)}
          onNone={() => handleUserInput("None of those match — I'll enter my details manually.")}
        />
      )
    }
    if (message.widget === 'service_selector' && state.step === 'confirm_services') {
      return (
        <ServiceSelector
          services={state.services}
          onConfirm={(ids) => confirmServices(ids)}
        />
      )
    }
    if (message.widget === 'goal_selector' && state.step === 'collect_goal') {
      return <GoalSelector onSelect={(goal: LoyaltyGoal) => selectGoal(goal)} />
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
      title="Hi there!"
      subtitle="I'll help you set up your business and create a loyalty program in just a few steps."
      inputEnabled={INPUT_STEPS.includes(state.step)}
    />
  )
}

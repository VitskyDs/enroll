import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChatShell } from '@/components/chat/ChatShell'
import { PrimaryGoalSelector, VisitFrequencySelector, SpendVarianceSelector } from '@/components/PreferencesSelectors'
import { usePreferencesOnboarding } from '@/hooks/usePreferencesOnboarding'
import type { ChatMessage } from '@/types'
import type { OnCompleteData as Phase1Data } from '@/hooks/useBasicsOnboarding'

export default function PreferencesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const phase1Data = location.state as Phase1Data & { demo?: boolean }
  const demoMode = phase1Data?.demo === true

  const { state, start, selectPrimaryGoal, selectVisitFrequency, selectSpendVariance } =
    usePreferencesOnboarding((prefsData) => {
      navigate('/onboarding/recommendation', {
        state: { ...phase1Data, ...prefsData, demo: demoMode },
      })
    })

  useEffect(() => {
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function renderWidget(message: ChatMessage) {
    if (message.widget === 'primary_goal_selector') {
      return (
        <PrimaryGoalSelector
          selected={state.primary_goal}
          onSelect={(goal) => selectPrimaryGoal(goal)}
        />
      )
    }
    if (message.widget === 'visit_frequency_selector') {
      return (
        <VisitFrequencySelector
          selected={state.visit_frequency}
          onSelect={(freq) => selectVisitFrequency(freq)}
        />
      )
    }
    if (message.widget === 'spend_variance_selector') {
      return (
        <SpendVarianceSelector
          selected={state.spend_variance}
          onSelect={(variance) => selectSpendVariance(variance, state)}
        />
      )
    }
    return null
  }

  return (
    <ChatShell
      messages={state.messages}
      isTyping={state.isTyping}
      step={state.step}
      onSend={() => undefined}
      onBack={() => navigate('/onboarding')}
      renderWidget={renderWidget}
      title="Program inputs"
      subtitle="Three quick questions to match you with the right loyalty program."
      inputEnabled={false}
    />
  )
}

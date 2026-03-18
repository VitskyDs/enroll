import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)

  const { state, start, selectPrimaryGoal, selectVisitFrequency, selectSpendVariance } =
    usePreferencesOnboarding((prefsData) => {
      setIsLoading(true)
      setTimeout(() => {
        navigate('/onboarding/recommendation', {
          state: { ...phase1Data, ...prefsData, demo: demoMode },
        })
      }, 1600)
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center gap-4">
        <Loader2 className="size-6 animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Finding your best match…</p>
      </div>
    )
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

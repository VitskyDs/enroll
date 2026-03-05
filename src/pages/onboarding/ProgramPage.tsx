import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChatShell } from '@/components/chat/ChatShell'
import { GoalSelector } from '@/components/GoalSelector'
import { ProgramSectionCard } from '@/components/ProgramSectionCard'
import { useProgramOnboarding } from '@/hooks/useProgramOnboarding'
import type { BusinessCategory, ChatMessage, LoyaltyGoal, Service } from '@/types'

export default function ProgramPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { businessName, businessCategory, websiteUrl, services, goal } = (location.state as {
    businessName: string
    businessCategory: BusinessCategory
    websiteUrl: string
    services: Service[]
    goal: LoyaltyGoal
  }) ?? {}

  const { state, start, selectGoal, advanceReview } = useProgramOnboarding({
    businessName: businessName ?? '',
    businessCategory: businessCategory ?? 'other',
    websiteUrl: websiteUrl ?? '',
    services: services ?? [],
    goal,
  })

  useEffect(() => {
    if (!businessName) { navigate('/onboarding'); return }
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function goToConfirm() {
    navigate('/onboarding/confirm', {
      state: { program: state.programDraft, businessName, services, goal: state.goal },
    })
  }

  function renderWidget(message: ChatMessage) {
    if (message.widget === 'goal_selector' && state.step === 'collect_goal') {
      return <GoalSelector onSelect={(g: LoyaltyGoal) => selectGoal(g)} />
    }

    if (state.programDraft) {
      if (message.widget === 'program_overview') {
        return (
          <div className="flex flex-col gap-3">
            <ProgramSectionCard section="overview" program={state.programDraft} />
            {state.reviewStep === 0 && (
              <button onClick={advanceReview} className="w-full h-12 rounded bg-zinc-900 text-white text-sm font-medium">
                Continue
              </button>
            )}
          </div>
        )
      }
      if (message.widget === 'program_name') {
        return (
          <div className="flex flex-col gap-3">
            <ProgramSectionCard section="name" program={state.programDraft} />
            {state.reviewStep === 1 && (
              <button onClick={advanceReview} className="w-full h-12 rounded bg-zinc-900 text-white text-sm font-medium">
                Continue
              </button>
            )}
          </div>
        )
      }
      if (message.widget === 'program_earn') {
        return (
          <div className="flex flex-col gap-3">
            <ProgramSectionCard section="earn" program={state.programDraft} />
            {state.reviewStep === 2 && (
              <button onClick={advanceReview} className="w-full h-12 rounded bg-zinc-900 text-white text-sm font-medium">
                Continue
              </button>
            )}
          </div>
        )
      }
      if (message.widget === 'program_tiers') {
        return (
          <div className="flex flex-col gap-3">
            <ProgramSectionCard section="tiers" program={state.programDraft} />
            {state.reviewStep === 3 && (
              <button onClick={advanceReview} className="w-full h-12 rounded bg-zinc-900 text-white text-sm font-medium">
                Continue
              </button>
            )}
          </div>
        )
      }
    }

    if (message.widget === 'program_done') {
      return (
        <button
          onClick={goToConfirm}
          className="w-full h-12 rounded bg-zinc-900 text-white text-sm font-medium"
        >
          Good job, continue
        </button>
      )
    }

    return null
  }

  return (
    <ChatShell
      messages={state.messages}
      isTyping={state.isTyping}
      step={state.step}
      onSend={goToConfirm}
      onBack={() => navigate('/onboarding')}
      renderWidget={renderWidget}
      title="Setting up the loyalty program"
      subtitle="I'll guide you through creating a program that works like the pros'."
      inputEnabled={state.reviewStep === 4}
    />
  )
}

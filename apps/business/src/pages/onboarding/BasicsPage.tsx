import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChatShell } from '@/components/chat/ChatShell'
import { UrlSelector } from '@/components/UrlSelector'
import { ServiceSelector } from '@/components/ServiceSelector'
import { useBasicsOnboarding } from '@/hooks/useBasicsOnboarding'
import { useAuth } from '@/contexts/AuthContext'
import type { ChatMessage, OnboardingStep } from '@/types'

const INPUT_STEPS: OnboardingStep[] = ['greeting', 'collect_url_or_name', 'manual_entry']

export default function BasicsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const locationState = location.state as { demo?: boolean } | null
  const demoMode = locationState?.demo === true

  // Use first name from Google profile; hook falls back to 'there' if undefined
  const firstName = profile?.full_name?.trim().split(/\s+/)[0]

  const { state, start, handleUserInput, selectUrl, confirmServices, continueToProgram } =
    useBasicsOnboarding(firstName, (data) => {
      navigate('/onboarding/preferences', { state: { ...data, demo: demoMode } })
    }, demoMode)

  useEffect(() => {
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show a hint in demo mode to guide what to type
  const hint = demoMode && state.step === 'collect_url_or_name'
    ? 'Try: lumierestudio.com'
    : undefined

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
    if (message.widget === 'service_actions') {
      return (
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={continueToProgram}
            className="w-full h-10 rounded-lg bg-zinc-900 text-white text-sm font-medium"
          >
            Continue
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full h-10 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-medium"
          >
            Start over
          </button>
          <p className="text-sm text-zinc-500 text-center">You can change these anytime</p>
        </div>
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
      title="Your business"
      subtitle="Tell me about your business and I'll pull in your services automatically."
      inputEnabled={INPUT_STEPS.includes(state.step)}
      hint={hint}
    />
  )
}

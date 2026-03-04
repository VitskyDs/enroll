import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChatShell } from '@/components/chat/ChatShell'
import { ServiceSelector } from '@/components/ServiceSelector'
import { ServiceActions } from '@/components/ServiceActions'
import { useBasicsOnboarding } from '@/hooks/useBasicsOnboarding'
import type { ChatMessage } from '@/types'

export default function BasicsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const userName = (location.state as { userName?: string })?.userName
  const { state, start, handleUserInput, confirmServices, redoServices, selectedServices, websiteUrl } = useBasicsOnboarding(userName)

  useEffect(() => {
    start()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <ServiceActions
          onContinue={() => navigate('/onboarding/program', {
            state: { businessName: state.businessName, websiteUrl, services: selectedServices },
          })}
          onRedo={redoServices}
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
      onSend={handleUserInput}
      onBack={() => navigate('/')}
      renderWidget={renderWidget}
      title="Hi there!"
      subtitle="I'll help you set up your business and create a loyalty program in just a few steps."
    />
  )
}

import { useCallback, useReducer, useRef } from 'react'
import type { ChatMessage, OnboardingStep, Service } from '@/types'

function makeId() {
  return Math.random().toString(36).slice(2)
}

function assistantMsg(content: string, widget?: ChatMessage['widget']): ChatMessage {
  return { id: makeId(), role: 'assistant', content, timestamp: new Date(), widget }
}

function userMsg(content: string): ChatMessage {
  return { id: makeId(), role: 'user', content, timestamp: new Date() }
}

interface BasicsState {
  step: OnboardingStep
  businessName: string
  websiteUrl: string
  services: Service[]
  selectedServiceIds: Set<string>
  messages: ChatMessage[]
  isTyping: boolean
}

const INITIAL_STATE: BasicsState = {
  step: 'greeting',
  businessName: '',
  websiteUrl: '',
  services: [],
  selectedServiceIds: new Set(),
  messages: [],
  isTyping: false,
}

type Action =
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_TYPING'; value: boolean }
  | { type: 'SET_STEP'; step: OnboardingStep }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_WEBSITE'; url: string }
  | { type: 'SET_SERVICES'; services: Service[] }
  | { type: 'SET_SELECTED_IDS'; ids: Set<string> }

function reducer(state: BasicsState, action: Action): BasicsState {
  switch (action.type) {
    case 'ADD_MESSAGE': return { ...state, messages: [...state.messages, action.message] }
    case 'SET_TYPING': return { ...state, isTyping: action.value }
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_NAME': return { ...state, businessName: action.name }
    case 'SET_WEBSITE': return { ...state, websiteUrl: action.url }
    case 'SET_SERVICES': return { ...state, services: action.services }
    case 'SET_SELECTED_IDS': return { ...state, selectedServiceIds: action.ids }
    default: return state
  }
}

export function useBasicsOnboarding(userName = 'there') {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const stateRef = useRef(state)
  stateRef.current = state

  const addMsg = useCallback((msg: ChatMessage) => dispatch({ type: 'ADD_MESSAGE', message: msg }), [])
  const setTyping = useCallback((v: boolean) => dispatch({ type: 'SET_TYPING', value: v }), [])
  const setStep = useCallback((step: OnboardingStep) => dispatch({ type: 'SET_STEP', step }), [])

  const aiReply = useCallback(
    (content: string, delay = 800, widget?: ChatMessage['widget']): Promise<void> =>
      new Promise((resolve) => {
        setTyping(true)
        setTimeout(() => {
          setTyping(false)
          addMsg(assistantMsg(content, widget))
          resolve()
        }, delay)
      }),
    [addMsg, setTyping],
  )

  const start = useCallback(async () => {
    setStep('greeting')
    await aiReply(`Hello ${userName}, 👋`, 600)
    await aiReply("Let's start with the basics. What's the name of your business?", 400)
    setStep('collect_name')
  }, [aiReply, setStep, userName])

  const handleUserInput = useCallback(
    async (value: string) => {
      addMsg(userMsg(value))
      switch (state.step) {
        case 'collect_name': {
          dispatch({ type: 'SET_NAME', name: value })
          setStep('collect_website')
          await aiReply("What's your website? I'll take a quick peek to understand your services.")
          break
        }
        case 'collect_website': {
          const url = value.toLowerCase() === 'skip' ? '' : value
          dispatch({ type: 'SET_WEBSITE', url })
          // TODO: replace with live Jina + Claude extraction
          const services: Service[] = [
            { id: '1', name: 'Haircut & style', description: 'Precision cut and blow-dry tailored to your hair type.', duration_minutes: 60, price_cents: 8500, subscription_price_cents: 7500, category: 'hair' },
            { id: '2', name: 'Color treatment', description: 'Full color or highlights with conditioning finish.', duration_minutes: 120, price_cents: 15000, subscription_price_cents: 13500, category: 'hair' },
            { id: '3', name: 'Deep conditioning', description: 'Intensive moisture treatment for damaged or dry hair.', duration_minutes: 45, price_cents: 5500, subscription_price_cents: 4900, category: 'hair' },
          ]
          dispatch({ type: 'SET_SERVICES', services })
          dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(services.map((s) => s.id)) })
          setStep('confirm_services')
          await aiReply(
            `Looks like you run a ${stateRef.current.businessName}. Nice. I've found your services — ready to set them up?`,
            600,
            'service_selector',
          )
          break
        }
        default: break
      }
    },
    [state.step, addMsg, aiReply, setStep],
  )

  const confirmServices = useCallback(
    async (selectedIds: Set<string>) => {
      dispatch({ type: 'SET_SELECTED_IDS', ids: selectedIds })
      const count = selectedIds.size
      addMsg(userMsg(`${count} service${count !== 1 ? 's' : ''} confirmed`))
      setStep('collect_goal')
      await aiReply(
        "Great! The services are now added to your business. Next, let's set up your loyalty program.",
        600,
        'service_actions',
      )
    },
    [addMsg, aiReply, setStep],
  )

  const redoServices = useCallback(async () => {
    addMsg(userMsg('Redo'))
    setStep('confirm_services')
    await aiReply("No problem — here are your services again. Make your changes and hit Done.", 400, 'service_selector')
  }, [addMsg, aiReply, setStep])

  const selectedServices = state.services.filter((s) => state.selectedServiceIds.has(s.id))

  return { state, start, handleUserInput, confirmServices, redoServices, selectedServices, websiteUrl: state.websiteUrl }
}

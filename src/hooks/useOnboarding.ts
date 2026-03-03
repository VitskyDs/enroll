import { useCallback, useReducer } from 'react'
import type {
  BusinessCategory,
  ChatMessage,
  LoyaltyGoal,
  LoyaltyProgram,
  OnboardingState,
  OnboardingStep,
  Service,
} from '@/types'

// ---------------------------------------------------------------------------
// Stub data
// ---------------------------------------------------------------------------

const STUB_SERVICES: Service[] = [
  { id: '1', name: 'Haircut', price_cents: 4500 },
  { id: '2', name: 'Color treatment', price_cents: 9500 },
  { id: '3', name: 'Blowout', price_cents: 3500 },
  { id: '4', name: 'Deep conditioning', price_cents: 2500 },
  { id: '5', name: 'Highlights', price_cents: 11000 },
]

const STUB_PROGRAM: LoyaltyProgram = {
  id: 'stub',
  business_id: 'stub',
  program_name: 'The Inner Circle',
  currency_name: 'Glow Points',
  earn_rules: [
    {
      label: 'Every visit',
      points_per_dollar: 1,
      points_per_visit: null,
      description: 'Earn 1 Glow Point for every dollar spent',
    },
    {
      label: 'Birthday bonus',
      points_per_dollar: null,
      points_per_visit: 100,
      description: 'Earn 100 bonus points in your birthday month',
    },
  ],
  reward_tiers: [
    { name: 'Bronze', points_required: 0, reward_description: 'Member pricing on select services' },
    { name: 'Silver', points_required: 200, reward_description: '$10 off your next service' },
    { name: 'Gold', points_required: 500, reward_description: 'Free deep conditioning treatment' },
    { name: 'Platinum', points_required: 1000, reward_description: 'Complimentary full service + priority booking' },
  ],
  bonus_rules: [
    {
      label: 'Referral reward',
      description: 'Give $15 off to a friend, get 50 bonus points when they visit',
      multiplier: null,
    },
    {
      label: 'Double-point Tuesdays',
      description: 'Earn 2x points on all services every Tuesday',
      multiplier: 2,
    },
  ],
  referral_description: 'Share your unique referral link. Your friend gets $15 off their first visit — you earn 50 bonus Glow Points when they redeem it.',
  brand_voice_summary: 'Warm, aspirational, and inclusive. Messaging should feel like an invitation to belong to something special.',
  created_at: new Date().toISOString(),
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const CATEGORY_MAP: Record<string, BusinessCategory> = {
  salon: 'salon',
  spa: 'spa',
  barbershop: 'barbershop',
  barber: 'barbershop',
  clinic: 'clinic',
  fitness: 'fitness',
  gym: 'fitness',
  wellness: 'wellness',
  other: 'other',
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

function assistantMsg(content: string, widget?: ChatMessage['widget']): ChatMessage {
  return { id: makeId(), role: 'assistant', content, timestamp: new Date(), widget }
}

function userMsg(content: string): ChatMessage {
  return { id: makeId(), role: 'user', content, timestamp: new Date() }
}

const INITIAL_STATE: OnboardingState = {
  step: 'greeting',
  businessName: '',
  businessCategory: null,
  websiteUrl: '',
  services: [],
  selectedServiceIds: new Set(),
  goal: null,
  programDraft: null,
  messages: [],
  isTyping: false,
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_TYPING'; value: boolean }
  | { type: 'SET_STEP'; step: OnboardingStep }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_CATEGORY'; category: BusinessCategory }
  | { type: 'SET_WEBSITE'; url: string }
  | { type: 'SET_SERVICES'; services: Service[] }
  | { type: 'SET_SELECTED_IDS'; ids: Set<string> }
  | { type: 'SET_GOAL'; goal: LoyaltyGoal }
  | { type: 'SET_PROGRAM'; program: LoyaltyProgram }

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] }
    case 'SET_TYPING':
      return { ...state, isTyping: action.value }
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_NAME':
      return { ...state, businessName: action.name }
    case 'SET_CATEGORY':
      return { ...state, businessCategory: action.category }
    case 'SET_WEBSITE':
      return { ...state, websiteUrl: action.url }
    case 'SET_SERVICES':
      return { ...state, services: action.services }
    case 'SET_SELECTED_IDS':
      return { ...state, selectedServiceIds: action.ids }
    case 'SET_GOAL':
      return { ...state, goal: action.goal }
    case 'SET_PROGRAM':
      return { ...state, programDraft: action.program }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOnboarding() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Helpers
  const addMsg = useCallback((msg: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', message: msg })
  }, [])

  const setTyping = useCallback((v: boolean) => {
    dispatch({ type: 'SET_TYPING', value: v })
  }, [])

  const setStep = useCallback((step: OnboardingStep) => {
    dispatch({ type: 'SET_STEP', step })
  }, [])

  // Simulates an async AI message with a typing delay
  const aiReply = useCallback(
    (content: string, delay = 800, widget?: ChatMessage['widget']): Promise<void> => {
      return new Promise((resolve) => {
        setTyping(true)
        setTimeout(() => {
          setTyping(false)
          addMsg(assistantMsg(content, widget))
          resolve()
        }, delay)
      })
    },
    [addMsg, setTyping]
  )

  // Start the flow
  const start = useCallback(async () => {
    setStep('greeting')
    await aiReply("Hey! I'm Enroll. I'll help you set up a loyalty program tailored to your business — it takes about 2 minutes.", 600)
    await aiReply("Let's start with the basics. What's the name of your business?", 400)
    setStep('collect_name')
  }, [aiReply, setStep])

  // Main input handler
  const handleUserInput = useCallback(
    async (value: string) => {
      addMsg(userMsg(value))

      switch (state.step) {
        case 'collect_name': {
          dispatch({ type: 'SET_NAME', name: value })
          setStep('collect_type')
          await aiReply(`Great name! What type of business is ${value}? (e.g. salon, spa, barbershop, clinic)`)
          break
        }

        case 'collect_type': {
          const raw = value.toLowerCase().trim()
          const category: BusinessCategory = CATEGORY_MAP[raw] ?? 'other'
          dispatch({ type: 'SET_CATEGORY', category })
          setStep('collect_website')
          await aiReply("Do you have a website? If so, paste the URL — I'll use it to learn about your services. Otherwise just type \"skip\".")
          break
        }

        case 'collect_website': {
          const url = value.toLowerCase() === 'skip' ? '' : value
          dispatch({ type: 'SET_WEBSITE', url })

          // Crawling phase
          setStep('crawling')
          await aiReply(`${url ? `Scanning ${url}` : 'No website — no problem'}. Pulling together what I need…`, 1200)

          // Extracting phase
          setStep('extracting')
          await aiReply('Identifying your services and pricing…', 1400)

          dispatch({ type: 'SET_SERVICES', services: STUB_SERVICES })
          dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(STUB_SERVICES.map((s) => s.id)) })

          setStep('confirm_services')
          await aiReply(
            "Here's what I found. Deselect any that don't apply, then hit confirm.",
            600,
            'service_selector'
          )
          break
        }

        default:
          break
      }
    },
    [state.step, addMsg, aiReply, setStep]
  )

  // Service confirmation
  const confirmServices = useCallback(
    async (selectedIds: Set<string>) => {
      dispatch({ type: 'SET_SELECTED_IDS', ids: selectedIds })
      const count = selectedIds.size
      addMsg(userMsg(`${count} service${count !== 1 ? 's' : ''} confirmed`))

      setStep('collect_goal')
      await aiReply("What's the main thing you want your loyalty program to achieve?", 600, 'goal_selector')
    },
    [addMsg, aiReply, setStep]
  )

  // Goal selection
  const selectGoal = useCallback(
    async (goal: LoyaltyGoal) => {
      dispatch({ type: 'SET_GOAL', goal })

      const labels: Record<LoyaltyGoal, string> = {
        retention: 'keep clients coming back',
        referrals: 'grow through referrals',
        frequency: 'increase visit frequency',
      }
      addMsg(userMsg(labels[goal]))

      // Generating phase
      setStep('generating')
      await aiReply('Building your loyalty program…', 2000)

      // Saving phase
      setStep('saving')
      const program = { ...STUB_PROGRAM, business_id: state.businessName }
      dispatch({ type: 'SET_PROGRAM', program })
      await aiReply('Saving your program…', 800)

      setStep('done')
      await aiReply(
        `Your loyalty program is ready, ${state.businessName}! Here's what I put together for you.`,
        400
      )
    },
    [addMsg, aiReply, setStep, state.businessName]
  )

  return {
    state,
    start,
    handleUserInput,
    confirmServices,
    selectGoal,
  }
}

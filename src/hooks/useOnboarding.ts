import { useCallback, useReducer, useRef } from 'react'
import { generateProgram } from '@/services/generateProgram'
import { saveToSupabase } from '@/services/saveToSupabase'
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
// State
// ---------------------------------------------------------------------------


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
  | { type: 'UPDATE_MESSAGE'; id: string; content: string }
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
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, content: action.content } : m,
        ),
      }
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

export function useOnboarding(userName = 'there') {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Always-fresh state ref — prevents stale closures in async callbacks
  const stateRef = useRef(state)
  stateRef.current = state

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

  // Shows a typing indicator then adds an assistant message after a short delay
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
    [addMsg, setTyping],
  )

  // Start the flow
  const start = useCallback(async () => {
    setStep('greeting')
    await aiReply(`Hello ${userName}, 👋`, 600)
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
          dispatch({ type: 'SET_CATEGORY', category: 'other' })
          setStep('collect_website')
          await aiReply("What's your website? I'll take a quick peek to understand your services.")
          break
        }

        case 'collect_website': {
          const url = value.toLowerCase() === 'skip' ? '' : value
          dispatch({ type: 'SET_WEBSITE', url })

          // TODO: replace with live Jina + Claude extraction
          const services: Service[] = [
            {
              id: '1',
              name: 'Haircut & style',
              description: 'Precision cut and blow-dry tailored to your hair type.',
              duration_minutes: 60,
              price_cents: 8500,
              subscription_price_cents: 7500,
              category: 'hair',
            },
            {
              id: '2',
              name: 'Color treatment',
              description: 'Full color or highlights with conditioning finish.',
              duration_minutes: 120,
              price_cents: 15000,
              subscription_price_cents: 13500,
              category: 'hair',
            },
            {
              id: '3',
              name: 'Deep conditioning',
              description: 'Intensive moisture treatment for damaged or dry hair.',
              duration_minutes: 45,
              price_cents: 5500,
              subscription_price_cents: 4900,
              category: 'hair',
            },
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

        default:
          break
      }
    },
    [state.step, addMsg, aiReply, setStep, setTyping],
  )

  // Service confirmation
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

  // Continue to goal selection after service confirmation
  const continueToGoal = useCallback(async () => {
    addMsg(userMsg('Continue'))
    await aiReply("What's the main thing you want your loyalty program to achieve?", 600, 'goal_selector')
  }, [addMsg, aiReply])

  // Redo service selection
  const redoServices = useCallback(async () => {
    addMsg(userMsg('Redo'))
    setStep('confirm_services')
    await aiReply(
      "No problem — here are your services again. Make your changes and hit Done.",
      400,
      'service_selector',
    )
  }, [addMsg, aiReply, setStep])

  // Goal selection
  const selectGoal = useCallback(
    async (goal: LoyaltyGoal) => {
      dispatch({ type: 'SET_GOAL', goal })

      const labels: Record<LoyaltyGoal, string> = {
        retention: 'Retain customers',
        referrals: 'Gain new members',
        frequency: 'Increase recurring revenue',
      }
      addMsg(userMsg(labels[goal]))

      // Generating phase — streaming happens internally but not shown in chat
      setStep('generating')

      const statusMsgId = makeId()
      addMsg({
        id: statusMsgId,
        role: 'assistant',
        content: 'Designing your loyalty program…',
        timestamp: new Date(),
      })

      const selectedServices = stateRef.current.services.filter((s) =>
        stateRef.current.selectedServiceIds.has(s.id),
      )

      let program: LoyaltyProgram
      try {
        program = await generateProgram(
          stateRef.current.businessName,
          stateRef.current.businessCategory!,
          goal,
          selectedServices,
        )
      } catch (err) {
        console.error('Program generation failed:', err)
        dispatch({
          type: 'UPDATE_MESSAGE',
          id: statusMsgId,
          content: 'Something went wrong generating your program. Please refresh and try again.',
        })
        return
      }

      // Saving phase
      dispatch({ type: 'UPDATE_MESSAGE', id: statusMsgId, content: 'Almost there — saving your program…' })
      setStep('saving')
      try {
        const { business_id, program_id } = await saveToSupabase(
          stateRef.current.businessName,
          stateRef.current.businessCategory!,
          stateRef.current.websiteUrl,
          goal,
          selectedServices,
          program,
        )
        program = { ...program, id: program_id, business_id }
      } catch (err) {
        console.error('Supabase save failed:', err)
        dispatch({
          type: 'UPDATE_MESSAGE',
          id: statusMsgId,
          content: `Warning: your program was generated but could not be saved (${err instanceof Error ? err.message : 'unknown error'}). You can still review it below.`,
        })
      }

      dispatch({ type: 'SET_PROGRAM', program })

      // Update status, then show program sections inline in chat
      dispatch({ type: 'UPDATE_MESSAGE', id: statusMsgId, content: "Here's what I put together for you." })
      addMsg(assistantMsg('', 'program_overview'))
      addMsg(assistantMsg('', 'program_name'))
      addMsg(assistantMsg('', 'program_earn'))
      addMsg(assistantMsg('', 'program_tiers'))
      addMsg(assistantMsg('What do you think?'))
      addMsg(assistantMsg('', 'program_done'))

      setStep('reviewing')
    },
    [addMsg, setStep],
  )

  const reviewDone = useCallback(() => {
    setStep('done')
  }, [setStep])

  return {
    state,
    start,
    handleUserInput,
    confirmServices,
    continueToGoal,
    redoServices,
    selectGoal,
    reviewDone,
  }
}

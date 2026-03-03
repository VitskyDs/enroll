import { useCallback, useReducer, useRef } from 'react'
import { fetchPageContent } from '@/lib/jina'
import { extractServices } from '@/services/extractServices'
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

export function useOnboarding() {
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
    await aiReply(
      "Hey! I'm Enroll. I'll help you set up a loyalty program tailored to your business — it takes about 2 minutes.",
      600,
    )
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
          await aiReply(
            'Do you have a website? If so, paste the URL — I\'ll use it to learn about your services. Otherwise just type "skip".',
          )
          break
        }

        case 'collect_website': {
          const url = value.toLowerCase() === 'skip' ? '' : value
          dispatch({ type: 'SET_WEBSITE', url })

          // Crawling phase — live Jina fetch
          setStep('crawling')
          let pageContent = ''
          if (url) {
            setTyping(true)
            try {
              pageContent = await fetchPageContent(url)
              setTyping(false)
              addMsg(assistantMsg('Got your site. Identifying your services…'))
            } catch (err) {
              console.error('Jina fetch failed:', err)
              setTyping(false)
              addMsg(assistantMsg("Couldn't load your website — no problem, I'll continue without it."))
            }
          } else {
            addMsg(assistantMsg("No website — no problem. Let's continue."))
          }

          // Extracting phase — live Claude call
          setStep('extracting')
          let services: Service[] = []
          if (pageContent) {
            setTyping(true)
            try {
              services = await extractServices(stateRef.current.businessName, pageContent)
            } catch (err) {
              console.error('Service extraction failed:', err)
            }
            setTyping(false)
          }

          dispatch({ type: 'SET_SERVICES', services })
          dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(services.map((s) => s.id)) })

          setStep('confirm_services')
          await aiReply(
            services.length > 0
              ? "Here's what I found. Deselect any that don't apply, then hit confirm."
              : "I couldn't extract specific services from your site. You can proceed and I'll still build a great program.",
            400,
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
      await aiReply("What's the main thing you want your loyalty program to achieve?", 600, 'goal_selector')
    },
    [addMsg, aiReply, setStep],
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

      // Generating phase — live streaming Claude call
      setStep('generating')

      const streamMsgId = makeId()
      addMsg({
        id: streamMsgId,
        role: 'assistant',
        content: 'Designing your loyalty program…',
        timestamp: new Date(),
      })

      const selectedServices = stateRef.current.services.filter((s) =>
        stateRef.current.selectedServiceIds.has(s.id),
      )

      let program: LoyaltyProgram
      let accumulated = ''
      try {
        program = await generateProgram(
          stateRef.current.businessName,
          stateRef.current.businessCategory!,
          goal,
          selectedServices,
          (delta) => {
            accumulated += delta
            dispatch({ type: 'UPDATE_MESSAGE', id: streamMsgId, content: accumulated })
          },
        )
      } catch (err) {
        console.error('Program generation failed:', err)
        dispatch({
          type: 'UPDATE_MESSAGE',
          id: streamMsgId,
          content: 'Something went wrong generating your program. Please refresh and try again.',
        })
        return
      }

      // Replace streamed JSON with a clean transition message
      dispatch({ type: 'UPDATE_MESSAGE', id: streamMsgId, content: 'Program designed. Saving…' })

      // Saving phase — live Supabase inserts
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
        addMsg(
          assistantMsg("Couldn't save to the database — but your program is ready to preview below."),
        )
      }

      dispatch({ type: 'SET_PROGRAM', program })

      setStep('done')
      await aiReply(
        `Your loyalty program is ready, ${stateRef.current.businessName}! Here's what I put together for you.`,
        400,
      )
    },
    [addMsg, aiReply, setStep],
  )

  return {
    state,
    start,
    handleUserInput,
    confirmServices,
    selectGoal,
  }
}

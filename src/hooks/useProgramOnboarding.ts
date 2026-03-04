import { useCallback, useReducer, useRef } from 'react'
import { saveToSupabase } from '@/services/saveToSupabase'
import type {
  BusinessCategory,
  ChatMessage,
  LoyaltyGoal,
  LoyaltyProgram,
  OnboardingStep,
  Service,
} from '@/types'

// TODO: replace with live generateProgram + saveToSupabase
const DUMMY_PROGRAM: LoyaltyProgram = {
  id: 'dummy',
  business_id: 'dummy',
  program_name: 'The Glow Rewards Club',
  currency_name: 'Glow Points',
  earn_rules: [
    { label: 'Per visit', points_per_dollar: null, points_per_visit: 10, description: 'Earn 10 Glow Points every time you visit.' },
    { label: 'Per dollar spent', points_per_dollar: 1, points_per_visit: null, description: 'Earn 1 Glow Point for every dollar you spend.' },
  ],
  reward_tiers: [
    { name: 'Silver', points_required: 0, reward_description: 'Access to exclusive member discounts.' },
    { name: 'Gold', points_required: 100, reward_description: '10% off all services + priority booking.' },
    { name: 'Platinum', points_required: 300, reward_description: '20% off all services + free birthday treatment.' },
  ],
  bonus_rules: [
    { label: 'Referral bonus', description: 'Earn 25 Glow Points when a friend books their first appointment.', multiplier: null },
  ],
  referral_description: 'Share your unique referral code and earn Glow Points when your friends visit for the first time.',
  brand_voice_summary: 'Warm, approachable, and professional — like a trusted friend who happens to be a beauty expert.',
  created_at: new Date().toISOString(),
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

interface ProgramState {
  step: OnboardingStep
  reviewStep: number // -1 = not reviewing yet, 0-3 = section steps, 4 = conclusion
  goal: LoyaltyGoal | null
  programDraft: LoyaltyProgram | null
  messages: ChatMessage[]
  isTyping: boolean
}

const INITIAL_STATE: ProgramState = {
  step: 'collect_goal',
  reviewStep: -1,
  goal: null,
  programDraft: null,
  messages: [],
  isTyping: false,
}

type Action =
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; id: string; content: string }
  | { type: 'SET_TYPING'; value: boolean }
  | { type: 'SET_STEP'; step: OnboardingStep }
  | { type: 'SET_GOAL'; goal: LoyaltyGoal }
  | { type: 'SET_PROGRAM'; program: LoyaltyProgram }
  | { type: 'SET_REVIEW_STEP'; step: number }

function reducer(state: ProgramState, action: Action): ProgramState {
  switch (action.type) {
    case 'ADD_MESSAGE': return { ...state, messages: [...state.messages, action.message] }
    case 'UPDATE_MESSAGE': return {
      ...state,
      messages: state.messages.map((m) => m.id === action.id ? { ...m, content: action.content } : m),
    }
    case 'SET_TYPING': return { ...state, isTyping: action.value }
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_GOAL': return { ...state, goal: action.goal }
    case 'SET_PROGRAM': return { ...state, programDraft: action.program }
    case 'SET_REVIEW_STEP': return { ...state, reviewStep: action.step }
    default: return state
  }
}

interface Props {
  businessName: string
  businessCategory: BusinessCategory
  websiteUrl: string
  services: Service[]
}

export function useProgramOnboarding({ businessName, businessCategory, websiteUrl, services }: Props) {
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
    await aiReply("What's the main thing you want your loyalty program to achieve?", 600, 'goal_selector')
  }, [aiReply])

  const selectGoal = useCallback(
    async (goal: LoyaltyGoal) => {
      const labels: Record<LoyaltyGoal, string> = {
        retention: 'Retain customers',
        referrals: 'Gain new members',
        frequency: 'Increase recurring revenue',
      }
      addMsg(userMsg(labels[goal]))
      dispatch({ type: 'SET_GOAL', goal })
      setStep('generating')

      const statusMsgId = makeId()
      addMsg({ id: statusMsgId, role: 'assistant', content: 'Designing your loyalty program…', timestamp: new Date() })

      // TODO (TASK-9): replace DUMMY_PROGRAM with live generateProgram call
      await new Promise<void>((resolve) => setTimeout(resolve, 1200))
      let program: LoyaltyProgram = DUMMY_PROGRAM

      // Save to Supabase
      dispatch({ type: 'UPDATE_MESSAGE', id: statusMsgId, content: 'Almost there — saving your program…' })
      let saveError = false
      try {
        const { business_id, program_id } = await saveToSupabase(
          businessName,
          businessCategory,
          websiteUrl,
          goal,
          services,
          program,
        )
        program = { ...program, id: program_id, business_id }
      } catch (err) {
        console.error('Supabase save failed:', err)
        saveError = true
        dispatch({
          type: 'UPDATE_MESSAGE',
          id: statusMsgId,
          content: `Warning: your program was generated but could not be saved (${err instanceof Error ? err.message : 'unknown error'}). You can still review it below.`,
        })
      }

      dispatch({ type: 'SET_PROGRAM', program })
      if (!saveError) {
        dispatch({ type: 'UPDATE_MESSAGE', id: statusMsgId, content: "Here's what I put together for you." })
      }
      addMsg(assistantMsg('', 'program_overview'))
      dispatch({ type: 'SET_REVIEW_STEP', step: 0 })
      setStep('reviewing')
    },
    [addMsg, setStep],
  )

  const advanceReview = useCallback(() => {
    const next = stateRef.current.reviewStep + 1
    dispatch({ type: 'SET_REVIEW_STEP', step: next })
    switch (next) {
      case 1: addMsg(assistantMsg('', 'program_name')); break
      case 2: addMsg(assistantMsg('', 'program_earn')); break
      case 3: addMsg(assistantMsg('', 'program_tiers')); break
      case 4:
        addMsg(assistantMsg('What do you think?'))
        addMsg(assistantMsg('', 'program_done'))
        break
    }
  }, [addMsg])

  return { state, start, selectGoal, advanceReview }
}

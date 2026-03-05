import { useCallback, useReducer, useRef } from 'react'
import { generateProgram } from '@/services/generateProgram'
import { validateInput } from '@/lib/validateProgram'
import type {
  BusinessCategory,
  ChatMessage,
  LoyaltyGoal,
  LoyaltyProgram,
  OnboardingStep,
  Service,
} from '@/types'

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
  goal?: LoyaltyGoal
}

export function useProgramOnboarding({ businessName, businessCategory, services, goal: goalProp }: Props) {
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

  const selectGoal = useCallback(
    async (goal: LoyaltyGoal) => {
      const labels: Record<LoyaltyGoal, string> = {
        retention: 'Retain customers',
        referrals: 'Gain new members',
        frequency: 'Increase recurring revenue',
      }
      // Only add user message when goal wasn't pre-provided (i.e. user clicked GoalSelector)
      if (!goalProp) {
        addMsg(userMsg(labels[goal]))
      }
      dispatch({ type: 'SET_GOAL', goal })

      // Input validation
      const inputCheck = validateInput(businessName, businessCategory, services, goal)
      if (!inputCheck.valid) {
        addMsg(assistantMsg(`Sorry, I can't generate a program: ${inputCheck.error}`))
        return
      }

      setStep('generating')
      const statusMsgId = makeId()
      addMsg({ id: statusMsgId, role: 'assistant', content: 'Designing your loyalty program…', timestamp: new Date() })

      let program: LoyaltyProgram | null = null
      try {
        program = await generateProgram(businessName, businessCategory, goal, services)
      } catch (err) {
        dispatch({
          type: 'UPDATE_MESSAGE',
          id: statusMsgId,
          content: `Could not generate the program: ${err instanceof Error ? err.message : 'unknown error'}. Please try again.`,
        })
        setTyping(false)
        return
      }

      dispatch({ type: 'SET_PROGRAM', program })
      dispatch({ type: 'UPDATE_MESSAGE', id: statusMsgId, content: "Here's what I put together for you." })
      addMsg(assistantMsg('', 'program_overview'))
      dispatch({ type: 'SET_REVIEW_STEP', step: 0 })
      setStep('reviewing')
    },
    [addMsg, setStep, goalProp, businessName, businessCategory, services],
  )

  const start = useCallback(async () => {
    if (goalProp) {
      // Goal already collected in BasicsPage — skip GoalSelector and generate immediately
      await selectGoal(goalProp)
    } else {
      await aiReply('What is your primary goal you want the loyalty program to help you achieve?', 600, 'goal_selector')
    }
  }, [aiReply, goalProp, selectGoal])

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

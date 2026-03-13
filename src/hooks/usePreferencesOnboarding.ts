import { useCallback, useReducer } from 'react'
import type { ChatMessage, OnboardingStep, PrimaryGoal, SpendVariance, VisitFrequency } from '@/types'

function makeId() {
  return Math.random().toString(36).slice(2)
}

interface PreferencesState {
  step: OnboardingStep
  primary_goal: PrimaryGoal | null
  visit_frequency: VisitFrequency | null
  spend_variance: SpendVariance | null
  messages: ChatMessage[]
  isTyping: boolean
}

const INITIAL_STATE: PreferencesState = {
  step: 'collect_primary_goal',
  primary_goal: null,
  visit_frequency: null,
  spend_variance: null,
  messages: [],
  isTyping: false,
}

type Action =
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_TYPING'; value: boolean }
  | { type: 'SET_STEP'; step: OnboardingStep }
  | { type: 'SET_PRIMARY_GOAL'; goal: PrimaryGoal }
  | { type: 'SET_VISIT_FREQUENCY'; frequency: VisitFrequency }
  | { type: 'SET_SPEND_VARIANCE'; variance: SpendVariance }

function reducer(state: PreferencesState, action: Action): PreferencesState {
  switch (action.type) {
    case 'ADD_MESSAGE': return { ...state, messages: [...state.messages, action.message] }
    case 'SET_TYPING': return { ...state, isTyping: action.value }
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_PRIMARY_GOAL': return { ...state, primary_goal: action.goal }
    case 'SET_VISIT_FREQUENCY': return { ...state, visit_frequency: action.frequency }
    case 'SET_SPEND_VARIANCE': return { ...state, spend_variance: action.variance }
    default: return state
  }
}

function addMsg(dispatch: React.Dispatch<Action>, content: string, widget?: ChatMessage['widget']) {
  const id = makeId()
  dispatch({
    type: 'ADD_MESSAGE',
    message: { id, role: 'assistant', content, timestamp: new Date(), widget },
  })
  return id
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface PreferencesCompleteData {
  primary_goal: PrimaryGoal
  visit_frequency: VisitFrequency
  spend_variance: SpendVariance
}

export function usePreferencesOnboarding(onComplete?: (data: PreferencesCompleteData) => void) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const start = useCallback(async () => {
    dispatch({ type: 'SET_STEP', step: 'collect_primary_goal' })
    dispatch({ type: 'SET_TYPING', value: true })
    await delay(800)
    dispatch({ type: 'SET_TYPING', value: false })
    addMsg(
      dispatch,
      "Great! Now let's figure out the right loyalty program for you. **What's your main goal?**",
      'primary_goal_selector',
    )
  }, [])

  const selectPrimaryGoal = useCallback(async (goal: PrimaryGoal) => {
    dispatch({ type: 'SET_PRIMARY_GOAL', goal })
    dispatch({
      type: 'ADD_MESSAGE',
      message: { id: makeId(), role: 'user', content: PRIMARY_GOAL_LABELS[goal], timestamp: new Date() },
    })
    dispatch({ type: 'SET_STEP', step: 'collect_visit_frequency' })
    dispatch({ type: 'SET_TYPING', value: true })
    await delay(700)
    dispatch({ type: 'SET_TYPING', value: false })
    addMsg(
      dispatch,
      '**How often does a typical customer visit or buy from you?**',
      'visit_frequency_selector',
    )
  }, [])

  const selectVisitFrequency = useCallback(async (frequency: VisitFrequency) => {
    dispatch({ type: 'SET_VISIT_FREQUENCY', frequency })
    dispatch({
      type: 'ADD_MESSAGE',
      message: { id: makeId(), role: 'user', content: VISIT_FREQUENCY_LABELS[frequency], timestamp: new Date() },
    })
    dispatch({ type: 'SET_STEP', step: 'collect_spend_variance' })
    dispatch({ type: 'SET_TYPING', value: true })
    await delay(700)
    dispatch({ type: 'SET_TYPING', value: false })
    addMsg(
      dispatch,
      '**Last one — do your customers vary a lot in how much they spend?**',
      'spend_variance_selector',
    )
  }, [])

  const selectSpendVariance = useCallback((variance: SpendVariance, currentState: PreferencesState) => {
    dispatch({ type: 'SET_SPEND_VARIANCE', variance })
    dispatch({
      type: 'ADD_MESSAGE',
      message: { id: makeId(), role: 'user', content: SPEND_VARIANCE_LABELS[variance], timestamp: new Date() },
    })
    dispatch({ type: 'SET_STEP', step: 'show_recommendation' })

    onComplete?.({
      primary_goal: currentState.primary_goal!,
      visit_frequency: currentState.visit_frequency!,
      spend_variance: variance,
    })
  }, [onComplete])

  return {
    state,
    start,
    selectPrimaryGoal,
    selectVisitFrequency,
    selectSpendVariance,
  }
}

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
  acquire: 'Gain new members',
  retain: 'Retain existing customers',
  revenue: 'Increase recurring revenue',
}

export const VISIT_FREQUENCY_LABELS: Record<VisitFrequency, string> = {
  high: 'Weekly or more',
  medium: '2–3 times a month',
  low: 'Once a month or less',
}

export const SPEND_VARIANCE_LABELS: Record<SpendVariance, string> = {
  consistent: 'Pretty consistent',
  varied: 'Varies a lot',
}

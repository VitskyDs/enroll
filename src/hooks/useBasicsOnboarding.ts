import { useCallback, useReducer, useRef } from 'react'
import { anthropic } from '@/lib/anthropic'
import { fetchPageContent } from '@/lib/jina'
import { extractServices } from '@/services/extractServices'
import { ONBOARDING_SYSTEM_PROMPT, ONBOARDING_TOOLS } from '@/prompts/onboardingAgent'
import type Anthropic from '@anthropic-ai/sdk'
import type { BusinessCategory, ChatMessage, LoyaltyGoal, OnboardingStep, Service } from '@/types'

function makeId() {
  return Math.random().toString(36).slice(2)
}

function userMsg(content: string): ChatMessage {
  return { id: makeId(), role: 'user', content, timestamp: new Date() }
}

interface BasicsState {
  step: OnboardingStep
  businessName: string
  businessCategory: BusinessCategory | null
  websiteUrl: string
  services: Service[]
  selectedServiceIds: Set<string>
  goal: LoyaltyGoal | null
  messages: ChatMessage[]
  isTyping: boolean
}

const INITIAL_STATE: BasicsState = {
  step: 'greeting',
  businessName: '',
  businessCategory: null,
  websiteUrl: '',
  services: [],
  selectedServiceIds: new Set(),
  goal: null,
  messages: [],
  isTyping: false,
}

type Action =
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; id: string; content: string }
  | { type: 'SET_MESSAGE_WIDGET'; id: string; widget: ChatMessage['widget'] }
  | { type: 'SET_TYPING'; value: boolean }
  | { type: 'SET_STEP'; step: OnboardingStep }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_CATEGORY'; category: BusinessCategory }
  | { type: 'SET_WEBSITE'; url: string }
  | { type: 'SET_SERVICES'; services: Service[] }
  | { type: 'SET_SELECTED_IDS'; ids: Set<string> }
  | { type: 'SET_GOAL'; goal: LoyaltyGoal }

function reducer(state: BasicsState, action: Action): BasicsState {
  switch (action.type) {
    case 'ADD_MESSAGE': return { ...state, messages: [...state.messages, action.message] }
    case 'UPDATE_MESSAGE': return {
      ...state,
      messages: state.messages.map((m) => m.id === action.id ? { ...m, content: action.content } : m),
    }
    case 'SET_MESSAGE_WIDGET': return {
      ...state,
      messages: state.messages.map((m) => m.id === action.id ? { ...m, widget: action.widget } : m),
    }
    case 'SET_TYPING': return { ...state, isTyping: action.value }
    case 'SET_STEP': return { ...state, step: action.step }
    case 'SET_NAME': return { ...state, businessName: action.name }
    case 'SET_CATEGORY': return { ...state, businessCategory: action.category }
    case 'SET_WEBSITE': return { ...state, websiteUrl: action.url }
    case 'SET_SERVICES': return { ...state, services: action.services }
    case 'SET_SELECTED_IDS': return { ...state, selectedServiceIds: action.ids }
    case 'SET_GOAL': return { ...state, goal: action.goal }
    default: return state
  }
}

export interface OnCompleteData {
  businessName: string
  businessCategory: BusinessCategory
  websiteUrl: string
  services: Service[]
  goal: LoyaltyGoal
}

export function useBasicsOnboarding(
  userName = 'there',
  onComplete?: (data: OnCompleteData) => void,
) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const stateRef = useRef(state)
  stateRef.current = state

  // LLM conversation history — separate from display messages
  const llmMessagesRef = useRef<Anthropic.MessageParam[]>([])
  // Widget to attach to the next end_turn assistant message
  const pendingWidgetRef = useRef<ChatMessage['widget'] | undefined>(undefined)
  // Set by submit_goal handler; triggers onComplete after the loop finishes
  const shouldNavigateRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const handleToolCall = useCallback(async (block: Anthropic.ToolUseBlock): Promise<string> => {
    const input = block.input as Record<string, unknown>

    switch (block.name) {
      case 'submit_business_name': {
        dispatch({ type: 'SET_NAME', name: input.business_name as string })
        dispatch({ type: 'SET_STEP', step: 'collect_type' })
        return 'Business name recorded.'
      }

      case 'submit_business_type': {
        dispatch({ type: 'SET_CATEGORY', category: input.business_type as BusinessCategory })
        dispatch({ type: 'SET_STEP', step: 'collect_website' })
        return 'Business type recorded.'
      }

      case 'submit_services': {
        const websiteUrl = input.website_url as string | undefined
        const rawServices = input.services as Array<{ name: string; price_cents?: number }> | undefined

        if (websiteUrl) {
          dispatch({ type: 'SET_WEBSITE', url: websiteUrl })
          dispatch({ type: 'SET_STEP', step: 'crawling' })
          try {
            const pageContent = await fetchPageContent(websiteUrl)
            dispatch({ type: 'SET_STEP', step: 'extracting' })
            const extracted = await extractServices(stateRef.current.businessName, pageContent)
            dispatch({ type: 'SET_SERVICES', services: extracted })
            dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(extracted.map((s) => s.id)) })
            dispatch({ type: 'SET_STEP', step: 'confirm_services' })
            pendingWidgetRef.current = 'service_selector'
            const names = extracted.map((s) => s.name).join(', ') || 'none found'
            return `Services extracted from website: ${names}. Showing confirmation UI to user. Do not ask further questions — wait for the user to confirm.`
          } catch (err) {
            dispatch({ type: 'SET_STEP', step: 'collect_website' })
            return `Failed to extract services from website (${err instanceof Error ? err.message : 'unknown error'}). Ask the user to list their services manually.`
          }
        }

        if (rawServices && rawServices.length > 0) {
          const services: Service[] = rawServices.map((s, i) => ({
            id: String(i + 1),
            name: s.name,
            price_cents: s.price_cents ?? null,
            subscription_price_cents: null,
          }))
          dispatch({ type: 'SET_SERVICES', services })
          dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(services.map((s) => s.id)) })
          dispatch({ type: 'SET_STEP', step: 'confirm_services' })
          pendingWidgetRef.current = 'service_selector'
          const names = services.map((s) => s.name).join(', ')
          return `Services recorded: ${names}. Showing confirmation UI to user. Do not ask further questions — wait for the user to confirm.`
        }

        return 'No services or URL provided. Ask the user again for their services or website.'
      }

      case 'submit_goal': {
        dispatch({ type: 'SET_GOAL', goal: input.goal as LoyaltyGoal })
        shouldNavigateRef.current = true
        return 'Goal recorded. Tell the user you are now setting up their loyalty program.'
      }

      default:
        return 'Unknown tool.'
    }
  }, [])

  // Core LLM turn: streams Claude's response, handles tool calls in a loop.
  // userText: visible text to add to conversation (null if continuing from tool results only)
  // extraMessages: additional messages to prepend before calling Claude (used by confirmServices)
  const runLLMTurn = useCallback(async (
    userText: string | null,
    extraMessages?: Anthropic.MessageParam[],
  ) => {
    const newLLMMessages = [...llmMessagesRef.current]

    if (extraMessages) {
      newLLMMessages.push(...extraMessages)
    }
    if (userText !== null) {
      newLLMMessages.push({ role: 'user', content: userText })
    }

    dispatch({ type: 'SET_TYPING', value: true })

    let currentMessages = newLLMMessages

    // Add placeholder for the first assistant message
    let assistantMsgId = makeId()
    dispatch({ type: 'ADD_MESSAGE', message: { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() } })

    try {
      while (true) {
        let accumulated = ''

        const stream = anthropic.messages.stream({
          model: 'claude-opus-4-6',
          max_tokens: 1024,
          system: ONBOARDING_SYSTEM_PROMPT,
          messages: currentMessages,
          tools: ONBOARDING_TOOLS,
        })

        stream.on('text', (delta) => {
          accumulated += delta
          dispatch({ type: 'UPDATE_MESSAGE', id: assistantMsgId, content: accumulated })
        })

        const finalMessage = await stream.finalMessage()
        currentMessages = [...currentMessages, { role: 'assistant', content: finalMessage.content }]

        if (finalMessage.stop_reason === 'tool_use') {
          const toolResults: Anthropic.ToolResultBlockParam[] = []

          for (const block of finalMessage.content) {
            if (block.type === 'tool_use') {
              const result = await handleToolCall(block)
              toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result })
            }
          }

          currentMessages = [...currentMessages, { role: 'user', content: toolResults }]

          // New placeholder for Claude's response to the tool results
          assistantMsgId = makeId()
          dispatch({ type: 'ADD_MESSAGE', message: { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() } })
        } else {
          // end_turn — attach pending widget to this message
          if (pendingWidgetRef.current) {
            dispatch({ type: 'SET_MESSAGE_WIDGET', id: assistantMsgId, widget: pendingWidgetRef.current })
            pendingWidgetRef.current = undefined
          }
          break
        }
      }
    } catch (err) {
      dispatch({
        type: 'UPDATE_MESSAGE',
        id: assistantMsgId,
        content: `Something went wrong: ${err instanceof Error ? err.message : 'unknown error'}. Please try again.`,
      })
    }

    llmMessagesRef.current = currentMessages
    dispatch({ type: 'SET_TYPING', value: false })

    if (shouldNavigateRef.current) {
      shouldNavigateRef.current = false
      const s = stateRef.current
      onCompleteRef.current?.({
        businessName: s.businessName,
        businessCategory: s.businessCategory ?? 'other',
        websiteUrl: s.websiteUrl,
        services: s.services.filter((sv) => s.selectedServiceIds.has(sv.id)),
        goal: s.goal!,
      })
    }
  }, [handleToolCall])

  const start = useCallback(() => {
    // Bootstrap message tells Claude to open the conversation
    const name = userName !== 'there' ? userName : null
    const greeting = name ? `Greet the user by name (${name}) and ask for their business name.` : 'Greet the user and ask for their business name.'
    runLLMTurn(`[${greeting}]`)
  }, [runLLMTurn, userName])

  const handleUserInput = useCallback((value: string) => {
    dispatch({ type: 'ADD_MESSAGE', message: userMsg(value) })
    runLLMTurn(value)
  }, [runLLMTurn])

  const confirmServices = useCallback((selectedIds: Set<string>) => {
    dispatch({ type: 'SET_SELECTED_IDS', ids: selectedIds })
    const count = selectedIds.size
    dispatch({ type: 'ADD_MESSAGE', message: userMsg(`${count} service${count !== 1 ? 's' : ''} confirmed`) })
    dispatch({ type: 'SET_STEP', step: 'collect_goal' })
    pendingWidgetRef.current = 'goal_selector'
    // Continue the LLM conversation from the current history, with a user message about services
    runLLMTurn(`Services confirmed (${count} selected). Now ask about the loyalty goal.`)
  }, [runLLMTurn])

  const selectGoal = useCallback((goal: LoyaltyGoal) => {
    const labels: Record<LoyaltyGoal, string> = {
      retention: 'Retain customers',
      referrals: 'Gain new members',
      frequency: 'Increase recurring revenue',
    }
    dispatch({ type: 'ADD_MESSAGE', message: userMsg(labels[goal]) })
    runLLMTurn(labels[goal])
  }, [runLLMTurn])

  const selectedServices = state.services.filter((s) => state.selectedServiceIds.has(s.id))

  return {
    state,
    start,
    handleUserInput,
    confirmServices,
    selectGoal,
    selectedServices,
  }
}

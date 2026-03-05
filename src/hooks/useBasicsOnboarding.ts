import { useCallback, useReducer, useRef } from 'react'
import { anthropic } from '@/lib/anthropic'
import { searchBusiness } from '@/services/searchBusiness'
import { extractFromUrl } from '@/services/extractFromUrl'
import { ONBOARDING_SYSTEM_PROMPT, ONBOARDING_TOOLS } from '@/prompts/onboardingAgent'
import type Anthropic from '@anthropic-ai/sdk'
import type { BusinessCategory, ChatMessage, LoyaltyGoal, OnboardingStep, Service } from '@/types'
import type { BusinessSearchResult } from '@/services/searchBusiness'

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
  candidateUrls: BusinessSearchResult[]
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
  candidateUrls: [],
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
  | { type: 'SET_CANDIDATE_URLS'; urls: BusinessSearchResult[] }
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
    case 'SET_CANDIDATE_URLS': return { ...state, candidateUrls: action.urls }
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

  const llmMessagesRef = useRef<Anthropic.MessageParam[]>([])
  const pendingWidgetRef = useRef<ChatMessage['widget'] | undefined>(undefined)
  const shouldNavigateRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const handleToolCall = useCallback(async (block: Anthropic.ToolUseBlock): Promise<string> => {
    const input = block.input as Record<string, unknown>

    switch (block.name) {
      case 'search_business': {
        const name = input.name as string
        dispatch({ type: 'SET_STEP', step: 'searching' })
        try {
          const results = await searchBusiness(name)
          if (results.length === 0) {
            dispatch({ type: 'SET_STEP', step: 'collect_url_or_name' })
            return 'No results found. Ask the user to provide their website URL directly or enter details manually.'
          }
          dispatch({ type: 'SET_CANDIDATE_URLS', urls: results })
          dispatch({ type: 'SET_STEP', step: 'collect_url_or_name' })
          pendingWidgetRef.current = 'url_selector'
          const list = results.map((r, i) => `${i + 1}. ${r.title} (${r.url})`).join('\n')
          return `Found ${results.length} results. Showing URL picker to user:\n${list}\nWait for the user to select one, then call submit_url with the chosen URL.`
        } catch {
          dispatch({ type: 'SET_STEP', step: 'collect_url_or_name' })
          return 'Search failed. Ask the user to provide their website URL directly or enter details manually.'
        }
      }

      case 'submit_url': {
        const url = input.url as string
        dispatch({ type: 'SET_WEBSITE', url })
        dispatch({ type: 'SET_STEP', step: 'extracting' })
        try {
          const extracted = await extractFromUrl(url)
          dispatch({ type: 'SET_NAME', name: extracted.name })
          dispatch({ type: 'SET_CATEGORY', category: extracted.type })
          dispatch({ type: 'SET_SERVICES', services: extracted.services })
          dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(extracted.services.map((s) => s.id)) })
          dispatch({ type: 'SET_STEP', step: 'confirm_services' })
          pendingWidgetRef.current = 'service_selector'
          const names = extracted.services.map((s) => s.name).join(', ') || 'none found'
          return `Extracted: business "${extracted.name}" (${extracted.type}), services: ${names}. Service selector shown to user. Summarize what you found in a friendly message, then wait for the user to confirm services.`
        } catch (err) {
          dispatch({ type: 'SET_STEP', step: 'manual_entry' })
          return `Could not extract data from ${url} (${err instanceof Error ? err.message : 'unknown error'}). Tell the user extraction failed and ask them to enter their business name, type, and top services manually. Then call submit_manual.`
        }
      }

      case 'submit_manual': {
        const name = input.business_name as string
        const type = input.business_type as BusinessCategory
        const rawServices = input.services as Array<{ name: string; price_cents?: number }> | undefined
        const services: Service[] = (rawServices ?? []).map((s, i) => ({
          id: String(i + 1),
          name: s.name,
          price_cents: s.price_cents ?? null,
          subscription_price_cents: null,
        }))
        dispatch({ type: 'SET_NAME', name })
        dispatch({ type: 'SET_CATEGORY', category: type })
        dispatch({ type: 'SET_SERVICES', services })
        dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(services.map((s) => s.id)) })
        dispatch({ type: 'SET_STEP', step: 'confirm_services' })
        pendingWidgetRef.current = 'service_selector'
        const names = services.map((s) => s.name).join(', ')
        return `Recorded: ${name} (${type}), services: ${names}. Service selector shown. Wait for the user to confirm.`
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
    let assistantMsgId = makeId()
    let hasAddedMessage = false

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
          if (!hasAddedMessage) {
            dispatch({ type: 'ADD_MESSAGE', message: { id: assistantMsgId, role: 'assistant', content: delta, timestamp: new Date() } })
            dispatch({ type: 'SET_TYPING', value: false })
            hasAddedMessage = true
            accumulated = delta
          } else {
            accumulated += delta
            dispatch({ type: 'UPDATE_MESSAGE', id: assistantMsgId, content: accumulated })
          }
        })

        const finalMessage = await stream.finalMessage()
        currentMessages = [...currentMessages, { role: 'assistant', content: finalMessage.content }]

        if (finalMessage.stop_reason === 'tool_use') {
          dispatch({ type: 'SET_TYPING', value: true })

          const toolResults: Anthropic.ToolResultBlockParam[] = []

          for (const block of finalMessage.content) {
            if (block.type === 'tool_use') {
              const result = await handleToolCall(block)
              toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result })
            }
          }

          currentMessages = [...currentMessages, { role: 'user', content: toolResults }]

          assistantMsgId = makeId()
          hasAddedMessage = false
        } else {
          if (pendingWidgetRef.current) {
            dispatch({ type: 'SET_MESSAGE_WIDGET', id: assistantMsgId, widget: pendingWidgetRef.current })
            pendingWidgetRef.current = undefined
          }
          break
        }
      }
    } catch (err) {
      const errorContent = `Something went wrong: ${err instanceof Error ? err.message : 'unknown error'}. Please try again.`
      if (!hasAddedMessage) {
        dispatch({ type: 'ADD_MESSAGE', message: { id: assistantMsgId, role: 'assistant', content: errorContent, timestamp: new Date() } })
      } else {
        dispatch({ type: 'UPDATE_MESSAGE', id: assistantMsgId, content: errorContent })
      }
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
    dispatch({ type: 'SET_STEP', step: 'collect_url_or_name' })
    const name = userName !== 'there' ? userName : null
    const greeting = name
      ? `Greet the user by name (${name}) and ask for their business name or website URL.`
      : 'Greet the user and ask for their business name or website URL.'
    runLLMTurn(`[${greeting}]`)
  }, [runLLMTurn, userName])

  const handleUserInput = useCallback((value: string) => {
    dispatch({ type: 'ADD_MESSAGE', message: userMsg(value) })
    runLLMTurn(value)
  }, [runLLMTurn])

  const selectUrl = useCallback((url: string) => {
    dispatch({ type: 'ADD_MESSAGE', message: userMsg(url) })
    runLLMTurn(`Use this URL: ${url}`)
  }, [runLLMTurn])

  const confirmServices = useCallback((selectedIds: Set<string>) => {
    dispatch({ type: 'SET_SELECTED_IDS', ids: selectedIds })
    const count = selectedIds.size
    dispatch({ type: 'ADD_MESSAGE', message: userMsg(`${count} service${count !== 1 ? 's' : ''} confirmed`) })
    dispatch({ type: 'SET_STEP', step: 'collect_goal' })
    pendingWidgetRef.current = 'goal_selector'
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
    selectUrl,
    confirmServices,
    selectGoal,
    selectedServices,
  }
}

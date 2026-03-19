import { useCallback, useReducer, useRef } from 'react'
import { anthropic } from '@/lib/anthropic'
import { searchBusiness } from '@/services/searchBusiness'
import { extractFromUrl } from '@/services/extractFromUrl'
import { ONBOARDING_SYSTEM_PROMPT, ONBOARDING_TOOLS } from '@/prompts/onboardingAgent'
import { DEMO_SERVICES, DEMO_ONBOARDING_DATA } from '@/data/demoData'
import type Anthropic from '@anthropic-ai/sdk'
import type { BrandPersonality, BusinessCategory, ChatMessage, OfferingType, OnboardingStep, Service } from '@/types'
import type { BusinessSearchResult } from '@/services/searchBusiness'

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

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
  // New extracted fields
  offering_type: OfferingType | null
  industry: string | null
  brand_personality: BrandPersonality | null
  services_and_products: string | null
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
  offering_type: null,
  industry: null,
  brand_personality: null,
  services_and_products: null,
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
  | { type: 'SET_EXTRACTED_FIELDS'; offering_type: OfferingType; industry: string; brand_personality: BrandPersonality | null; services_and_products: string }

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
    case 'SET_EXTRACTED_FIELDS': return {
      ...state,
      offering_type: action.offering_type,
      industry: action.industry,
      brand_personality: action.brand_personality,
      services_and_products: action.services_and_products,
    }
    default: return state
  }
}

export interface OnCompleteData {
  businessName: string
  businessCategory: BusinessCategory
  websiteUrl: string
  services: Service[]
  offering_type: OfferingType
  industry: string
  brand_personality: BrandPersonality | null
  services_and_products: string
}

export function useBasicsOnboarding(
  userName = 'there',
  onComplete?: (data: OnCompleteData) => void,
  demoMode = false,
) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const stateRef = useRef(state)
  stateRef.current = state

  const llmMessagesRef = useRef<Anthropic.MessageParam[]>([])
  const pendingWidgetRef = useRef<ChatMessage['widget'] | undefined>(undefined)
  const shouldNavigateRef = useRef(false)
  const hasStartedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Tracks which step of the pre-scripted demo turn we're on
  const demoStepRef = useRef(0)

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
          // Deduplicate by domain — keep only the first result per hostname
          const seenDomains = new Set<string>()
          const uniqueResults = results.filter((r) => {
            try {
              const domain = new URL(r.url).hostname
              if (seenDomains.has(domain)) return false
              seenDomains.add(domain)
              return true
            } catch {
              return true
            }
          })
          dispatch({ type: 'SET_CANDIDATE_URLS', urls: uniqueResults })
          dispatch({ type: 'SET_STEP', step: 'collect_url_or_name' })
          pendingWidgetRef.current = 'url_selector'
          const list = uniqueResults.map((r, i) => `${i + 1}. ${r.title} (${r.url})`).join('\n')
          return `Found ${uniqueResults.length} results. Showing URL picker to user:\n${list}\nWait for the user to select one, then call submit_url with the chosen URL.`
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
          dispatch({
            type: 'SET_EXTRACTED_FIELDS',
            offering_type: extracted.offering_type,
            industry: extracted.industry,
            brand_personality: extracted.brand_personality,
            services_and_products: extracted.services_and_products,
          })
          dispatch({ type: 'SET_STEP', step: 'confirm_services' })
          pendingWidgetRef.current = 'service_selector'
          const names = extracted.services.map((s) => s.name).join(', ') || 'none found'
          return `Extracted: "${extracted.name}" — ${extracted.type}, services: ${names}. Service selector is now shown. Send exactly two short messages: (1) identify the business and name 2–3 services, (2) tell the user to use the selector and hit Continue.`
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
        const industry = (input.industry as string) ?? 'other'
        const offering_type = (input.offering_type as OfferingType) ?? 'service'
        const services_and_products = (input.services_and_products as string) ?? services.map((s) => s.name).join(', ')
        dispatch({ type: 'SET_NAME', name })
        dispatch({ type: 'SET_CATEGORY', category: type })
        dispatch({ type: 'SET_SERVICES', services })
        dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(services.map((s) => s.id)) })
        dispatch({ type: 'SET_EXTRACTED_FIELDS', offering_type, industry, brand_personality: null, services_and_products })
        dispatch({ type: 'SET_STEP', step: 'confirm_services' })
        pendingWidgetRef.current = 'service_selector'
        const names = services.map((s) => s.name).join(', ')
        return `Recorded: "${name}" — ${type}, services: ${names}. Service selector is now shown. Send exactly two short messages: (1) identify the business and name 2–3 services, (2) tell the user to use the selector and hit Continue.`
      }

      default:
        return 'Unknown tool.'
    }
  }, [])

  // Pre-scripted turn runner for demo mode — no LLM calls made
  const runDemoTurn = useCallback(async (userText: string | null) => {
    if (userText === null) return

    const step = demoStepRef.current

    if (step === 0) {
      // User typed their business name or URL → mock search_business
      demoStepRef.current = 1
      dispatch({ type: 'SET_TYPING', value: true })
      await delay(1200)

      const msgId = makeId()
      dispatch({
        type: 'ADD_MESSAGE',
        message: { id: msgId, role: 'assistant', content: `Looking up **${userText}**…`, timestamp: new Date() },
      })
      dispatch({ type: 'SET_TYPING', value: false })

      const mockUrls: BusinessSearchResult[] = [
        { title: 'Lumière Studio', url: 'https://lumierestudio.com', description: 'Premium hair salon in San Francisco' },
      ]
      dispatch({ type: 'SET_CANDIDATE_URLS', urls: mockUrls })
      dispatch({ type: 'SET_STEP', step: 'collect_url_or_name' })
      dispatch({ type: 'SET_MESSAGE_WIDGET', id: msgId, widget: 'url_selector' })

    } else if (step === 1) {
      // User selected URL → mock submit_url with DEMO_ONBOARDING_DATA
      demoStepRef.current = 2
      dispatch({ type: 'SET_TYPING', value: true })
      dispatch({ type: 'SET_STEP', step: 'extracting' })
      await delay(1500)

      const msgId = makeId()
      dispatch({
        type: 'ADD_MESSAGE',
        message: {
          id: msgId,
          role: 'assistant',
          content: 'I found **Lumière Studio** — a premium hair salon. Here are the services I pulled from your site:',
          timestamp: new Date(),
        },
      })

      dispatch({ type: 'SET_NAME', name: 'Lumière Studio' })
      dispatch({ type: 'SET_CATEGORY', category: 'salon' })
      dispatch({ type: 'SET_WEBSITE', url: 'https://lumierestudio.com' })
      dispatch({ type: 'SET_SERVICES', services: DEMO_SERVICES })
      dispatch({ type: 'SET_SELECTED_IDS', ids: new Set(DEMO_SERVICES.map((s) => s.id)) })
      dispatch({
        type: 'SET_EXTRACTED_FIELDS',
        offering_type: DEMO_ONBOARDING_DATA.offering_type,
        industry: DEMO_ONBOARDING_DATA.industry,
        brand_personality: DEMO_ONBOARDING_DATA.brand_personality,
        services_and_products: DEMO_ONBOARDING_DATA.services_and_products,
      })
      dispatch({ type: 'SET_STEP', step: 'confirm_services' })
      dispatch({ type: 'SET_TYPING', value: false })
      dispatch({ type: 'SET_MESSAGE_WIDGET', id: msgId, widget: 'service_selector' })
    }
  }, [])

  const runLLMTurn = useCallback(async (
    userText: string | null,
    extraMessages?: Anthropic.MessageParam[],
  ) => {
    // In demo mode, use pre-scripted responses instead of calling Claude
    if (demoMode) {
      await runDemoTurn(userText)
      return
    }

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
      let errorContent = 'Something went wrong. Please try again.'
      if (err instanceof Error) {
        const match = err.message.match(/"message":"([^"]+)"/)
        if (match) {
          errorContent = `${match[1]}`
        }
      }
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
        offering_type: s.offering_type ?? 'service',
        industry: s.industry ?? 'other',
        brand_personality: s.brand_personality,
        services_and_products: s.services_and_products ?? '',
      })
    }
  }, [demoMode, handleToolCall, runDemoTurn])

  const start = useCallback(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    dispatch({ type: 'SET_STEP', step: 'collect_url_or_name' })
    const name = userName && userName !== 'there' ? userName : null
    const greetingContent = name ? `Hi ${name}!` : 'Hi there!'
    const introContent = "I'm here to help you set up your loyalty program in just a few minutes. To get started, **what's your business name or website URL?**"

    dispatch({ type: 'ADD_MESSAGE', message: { id: makeId(), role: 'assistant', content: greetingContent, timestamp: new Date() } })
    dispatch({ type: 'SET_TYPING', value: true })
    setTimeout(() => {
      dispatch({ type: 'SET_TYPING', value: false })
      dispatch({ type: 'ADD_MESSAGE', message: { id: makeId(), role: 'assistant', content: introContent, timestamp: new Date() } })
      llmMessagesRef.current = [
        { role: 'user', content: '[Begin onboarding]' },
        { role: 'assistant', content: `${greetingContent}\n\n${introContent}` },
      ]
    }, 1200)
  }, [userName])

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
    dispatch({ type: 'SET_STEP', step: 'confirm_services' })
    dispatch({
      type: 'ADD_MESSAGE',
      message: {
        id: makeId(),
        role: 'assistant',
        content: "Your services are set. Next, let's figure out what kind of loyalty program fits your business best.",
        timestamp: new Date(),
        widget: 'service_actions',
      },
    })
  }, [])

  const continueToProgram = useCallback(() => {
    const s = stateRef.current
    onCompleteRef.current?.({
      businessName: s.businessName,
      businessCategory: s.businessCategory ?? 'other',
      websiteUrl: s.websiteUrl,
      services: s.services.filter((sv) => s.selectedServiceIds.has(sv.id)),
      offering_type: s.offering_type ?? 'service',
      industry: s.industry ?? 'other',
      brand_personality: s.brand_personality,
      services_and_products: s.services_and_products ?? '',
    })
  }, [])

  const selectedServices = state.services.filter((s) => state.selectedServiceIds.has(s.id))

  return {
    state,
    start,
    handleUserInput,
    selectUrl,
    confirmServices,
    continueToProgram,
    selectedServices,
  }
}

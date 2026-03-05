import { anthropic } from '@/lib/anthropic'
import type Anthropic from '@anthropic-ai/sdk'
import type { BusinessCategory, Service } from '@/types'

export interface ExtractedBusiness {
  name: string
  type: BusinessCategory
  services: Service[]
}

/**
 * Visits a URL using Claude's web_search tool and extracts structured business info:
 * business name, category, and up to 8 services with names/prices.
 */
export async function extractFromUrl(url: string): Promise<ExtractedBusiness> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Visit ${url} and extract the following information about the business. Return ONLY a JSON object — no markdown, no code fences, no explanation:

{
  "name": "Business Name",
  "type": "salon",
  "services": [
    {
      "name": "Service Name",
      "description": "One sentence, max 12 words",
      "duration_minutes": 60,
      "price_cents": 5000,
      "category": "hair"
    }
  ]
}

Rules:
- "type" must be one of: salon, spa, barbershop, clinic, fitness, wellness, other
- Include up to 8 representative services
- "price_cents" is the price in cents (e.g. 5000 = $50), null if not listed
- "duration_minutes" is null if not mentioned
- "description" is null if not available
- "category" is a short label like "hair", "nails", "massage", "skin", etc.`,
    },
  ]

  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as unknown as Anthropic.Tool],
      messages,
    })

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse extraction response')

      const raw = JSON.parse(match[0]) as {
        name: string
        type: string
        services: Array<{
          name: string
          description?: string | null
          duration_minutes?: number | null
          price_cents?: number | null
          category?: string
        }>
      }

      const validTypes: BusinessCategory[] = ['salon', 'spa', 'barbershop', 'clinic', 'fitness', 'wellness', 'other']
      const type: BusinessCategory = validTypes.includes(raw.type as BusinessCategory)
        ? (raw.type as BusinessCategory)
        : 'other'

      const services: Service[] = (raw.services ?? []).map((s, i) => ({
        id: String(i + 1),
        name: s.name,
        description: s.description ?? undefined,
        duration_minutes: s.duration_minutes ?? null,
        price_cents: s.price_cents ?? null,
        subscription_price_cents: null,
        category: s.category,
      }))

      return { name: raw.name, type, services }
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      .map((b) => ({ type: 'tool_result', tool_use_id: b.id, content: 'executed' }))

    if (toolResults.length > 0) {
      messages.push({ role: 'user', content: toolResults })
    } else {
      throw new Error('Unexpected response from extraction model')
    }
  }
}

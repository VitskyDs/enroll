import { anthropic } from '@/lib/anthropic'
import type Anthropic from '@anthropic-ai/sdk'
import type { BrandPersonality, BusinessCategory, OfferingType, Service } from '@/types'

export interface ExtractedBusiness {
  name: string
  type: BusinessCategory
  services: Service[]
  services_and_products: string
  offering_type: OfferingType
  industry: string
  brand_personality: BrandPersonality | null
}

/**
 * Visits a URL using Claude's web_search tool and extracts structured business info.
 */
export async function extractFromUrl(url: string): Promise<ExtractedBusiness> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Visit ${url} and extract the following information. Return ONLY a JSON object — no markdown, no code fences, no explanation:

{
  "name": "Business Name",
  "type": "salon",
  "services_and_products": "1-2 sentence summary of the core offering",
  "offering_type": "service",
  "industry": "health & beauty",
  "brand_personality": {
    "tone": "warm",
    "identity_keywords": ["handcrafted", "neighborhood"],
    "price_positioning": "mid-market",
    "customer_relationship_model": "community"
  },
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
- "offering_type" must be one of: product, service, both
- "industry" must be one of: food & beverage, retail — specialty, retail — general, e-commerce, health & beauty, fitness & wellness, hospitality & travel, professional services, automotive, grocery & pharmacy, financial services, entertainment, other
- "brand_personality.tone" must be one of: playful, warm, premium, clinical, irreverent, minimalist, bold, community-driven
- "brand_personality.price_positioning" must be one of: budget, mid-market, premium, luxury
- "brand_personality.customer_relationship_model" must be one of: transactional, community, membership, expert-to-customer
- "brand_personality.identity_keywords" is 2-4 short words from site copy; derive from industry if unavailable
- "services_and_products" is a 1-2 sentence plain description of the core offering
- Include up to 8 representative services
- "price_cents" in cents (5000 = $50), null if not listed
- "duration_minutes" null if not mentioned
- "description" null if not available
- "category" short label: "hair", "nails", "massage", "skin", etc.`,
    },
  ]

  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as unknown as Anthropic.Tool],
      messages,
    }, { headers: { 'anthropic-beta': 'web-search-2025-03-05' } })

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse extraction response')

      const raw = JSON.parse(match[0]) as {
        name: string
        type: string
        services_and_products?: string
        offering_type?: string
        industry?: string
        brand_personality?: {
          tone?: string
          identity_keywords?: string[]
          price_positioning?: string
          customer_relationship_model?: string
        } | null
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

      const validOfferingTypes: OfferingType[] = ['product', 'service', 'both']
      const offering_type: OfferingType = validOfferingTypes.includes(raw.offering_type as OfferingType)
        ? (raw.offering_type as OfferingType)
        : 'service'

      const services: Service[] = (raw.services ?? []).map((s, i) => ({
        id: String(i + 1),
        name: s.name,
        description: s.description ?? undefined,
        duration_minutes: s.duration_minutes ?? null,
        price_cents: s.price_cents ?? null,
        subscription_price_cents: null,
        category: s.category,
      }))

      const validTones = ['playful', 'warm', 'premium', 'clinical', 'irreverent', 'minimalist', 'bold', 'community-driven']
      const validPositioning = ['budget', 'mid-market', 'premium', 'luxury']
      const validModels = ['transactional', 'community', 'membership', 'expert-to-customer']

      let brand_personality: BrandPersonality | null = null
      if (raw.brand_personality) {
        const bp = raw.brand_personality
        brand_personality = {
          tone: (validTones.includes(bp.tone ?? '') ? bp.tone : 'warm') as BrandPersonality['tone'],
          identity_keywords: Array.isArray(bp.identity_keywords) ? bp.identity_keywords.slice(0, 4) : [],
          price_positioning: (validPositioning.includes(bp.price_positioning ?? '') ? bp.price_positioning : 'mid-market') as BrandPersonality['price_positioning'],
          customer_relationship_model: (validModels.includes(bp.customer_relationship_model ?? '') ? bp.customer_relationship_model : 'community') as BrandPersonality['customer_relationship_model'],
        }
      }

      return {
        name: raw.name,
        type,
        services,
        services_and_products: raw.services_and_products ?? services.map((s) => s.name).join(', '),
        offering_type,
        industry: raw.industry ?? 'other',
        brand_personality,
      }
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

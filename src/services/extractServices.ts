import { anthropic } from '@/lib/anthropic'
import { buildExtractServicesPrompt } from '@/prompts/extractServices'
import type { Service } from '@/types'

interface RawService {
  name: string
  description: string
  duration_minutes: number | null
  price: number | null
  category: string
}

/**
 * Calls Claude to extract services from a Jina-scraped page content string.
 * Returns a Service[] ready for use in the onboarding state.
 */
export async function extractServices(businessName: string, pageContent: string): Promise<Service[]> {
  const prompt = buildExtractServicesPrompt(businessName, pageContent)

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]'
  const raw: RawService[] = JSON.parse(text)

  return raw.map((s, i) => ({
    id: String(i + 1),
    name: s.name,
    price_cents: s.price != null ? Math.round(s.price * 100) : null,
    description: s.description,
    duration_minutes: s.duration_minutes,
    category: s.category,
  }))
}

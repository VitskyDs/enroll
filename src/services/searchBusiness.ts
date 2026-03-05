import { anthropic } from '@/lib/anthropic'
import type Anthropic from '@anthropic-ai/sdk'

export interface BusinessSearchResult {
  url: string
  title: string
  snippet: string
}

/**
 * Searches for the official website of a business by name.
 * Uses Claude with the web_search tool to find up to 3 candidate URLs.
 */
export async function searchBusiness(name: string): Promise<BusinessSearchResult[]> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Search for the official website of a service business called "${name}". Return ONLY a JSON array of up to 3 most relevant results. No markdown, no explanation, just the JSON array:\n[{"url":"https://...","title":"...","snippet":"..."}]`,
    },
  ]

  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as unknown as Anthropic.Tool],
      messages,
    })

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? '[]'
      const match = text.match(/\[[\s\S]*\]/)
      if (!match) return []
      return JSON.parse(match[0]) as BusinessSearchResult[]
    }

    // Feed tool results back so the loop can continue
    const toolResults: Anthropic.ToolResultBlockParam[] = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      .map((b) => ({ type: 'tool_result', tool_use_id: b.id, content: 'executed' }))

    if (toolResults.length > 0) {
      messages.push({ role: 'user', content: toolResults })
    } else {
      // No tool use and not end_turn — shouldn't happen, bail out
      return []
    }
  }
}

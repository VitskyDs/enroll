import { anthropic } from '@/lib/anthropic'
import { supabase } from '@/lib/supabase'
import { buildGenerateProgramPrompt } from '@/prompts/generateProgram'
import type { BusinessCategory, LoyaltyGoal, LoyaltyProgram, Service } from '@/types'

/**
 * Generates a loyalty program using Claude with streaming.
 * Fetches loyalty_program_examples from Supabase for context.
 * Calls onChunk with each text delta so the caller can show live progress.
 */
export async function generateProgram(
  businessName: string,
  businessCategory: BusinessCategory,
  goal: LoyaltyGoal,
  services: Service[],
  onChunk: (delta: string) => void,
): Promise<LoyaltyProgram> {
  const { data: examples } = await supabase.from('loyalty_program_examples').select('*').limit(3)

  const prompt = buildGenerateProgramPrompt(
    businessName,
    businessCategory,
    goal,
    services,
    examples ?? [],
  )

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  stream.on('text', (delta) => {
    onChunk(delta)
  })

  const finalMessage = await stream.finalMessage()
  const text = finalMessage.content[0].type === 'text' ? finalMessage.content[0].text.trim() : ''

  const parsed = JSON.parse(text)

  return {
    id: '',
    business_id: '',
    created_at: new Date().toISOString(),
    ...parsed,
  }
}

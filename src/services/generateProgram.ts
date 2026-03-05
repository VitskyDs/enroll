import { anthropic } from '@/lib/anthropic'
import { supabase } from '@/lib/supabase'
import { buildGenerateProgramPrompt } from '@/prompts/generateProgram'
import { validateOutput, moderateContent } from '@/lib/validateProgram'
import type { BusinessCategory, LoyaltyGoal, LoyaltyProgram, Service } from '@/types'

async function runGeneration(
  prompt: string,
  onChunk?: (delta: string) => void,
): Promise<LoyaltyProgram> {
  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  stream.on('text', (delta) => {
    onChunk?.(delta)
  })

  const finalMessage = await stream.finalMessage()
  const text = finalMessage.content[0].type === 'text' ? finalMessage.content[0].text.trim() : ''

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Generated output is not valid JSON. Please try again.')
  }

  const outputCheck = validateOutput(parsed)
  if (!outputCheck.valid) {
    throw new Error(outputCheck.error)
  }

  // validateOutput confirmed shape is correct; cast to merge with metadata fields
  const program = {
    id: '',
    business_id: '',
    created_at: new Date().toISOString(),
    ...(parsed as Record<string, unknown>),
  } as LoyaltyProgram

  const modCheck = moderateContent(program)
  if (!modCheck.safe) {
    throw new Error(modCheck.reason)
  }

  return program
}

/**
 * Generates a loyalty program using Claude with streaming.
 * Validates and moderates the output; retries once automatically on failure.
 */
export async function generateProgram(
  businessName: string,
  businessCategory: BusinessCategory,
  goal: LoyaltyGoal,
  services: Service[],
  onChunk?: (delta: string) => void,
): Promise<LoyaltyProgram> {
  const { data: examples } = await supabase.from('loyalty_program_examples').select('*').limit(3)

  const prompt = buildGenerateProgramPrompt(
    businessName,
    businessCategory,
    goal,
    services,
    examples ?? [],
  )

  try {
    return await runGeneration(prompt, onChunk)
  } catch {
    // Retry once without streaming to avoid duplicate chunks
    return await runGeneration(prompt)
  }
}

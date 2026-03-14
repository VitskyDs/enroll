import { anthropic } from '@/lib/anthropic'
import { buildGenerateProgramPrompt } from '@/prompts/generateProgram'
import { getArchetype } from '@/data/loyaltyProgramArchetypes'
import type { BusinessOnboardingData, LoyaltyProgram, ProgramRecommendation } from '@/types'

function moderateText(text: string): boolean {
  const blocklist = ['kill', 'murder', 'suicide', 'rape', 'cocaine', 'heroin', 'methamphetamine', 'fuck', 'shit', 'porn', 'nude', 'naked']
  const lower = text.toLowerCase()
  return !blocklist.some((term) => lower.includes(term))
}

async function runGeneration(prompt: string): Promise<LoyaltyProgram> {
  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  })

  const finalMessage = await stream.finalMessage()
  const text = finalMessage.content[0].type === 'text' ? finalMessage.content[0].text.trim() : ''

  // Strip markdown code fences if present
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Generated output is not valid JSON. Please try again.')
  }

  const p = parsed as Record<string, unknown>

  // Basic required field check
  const required = ['program_type', 'program_type_reason', 'program_name', 'program_name_explanation', 'currency_name', 'currency_name_explanation', 'earn_rules', 'redemption_rules', 'bonus_rule', 'program_purpose', 'referral_rules', 'brand_voice_summary', 'terms_and_conditions']
  for (const field of required) {
    if (p[field] === undefined) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  if (typeof p.program_name !== 'string' || p.program_name.trim().length === 0) {
    throw new Error('program_name must be a non-empty string')
  }

  // Content moderation on key text fields
  const textToCheck = [p.program_name, p.currency_name, p.brand_voice_summary, p.program_purpose].join(' ')
  if (typeof textToCheck === 'string' && !moderateText(textToCheck)) {
    throw new Error('Generated content contains inappropriate language')
  }

  return {
    id: '',
    business_id: '',
    created_at: new Date().toISOString(),
    ...(p as object),
  } as LoyaltyProgram
}

/**
 * Generates a loyalty program using the archetype + customization instructions.
 * Retries once on failure.
 */
export async function generateProgram(
  onboardingData: BusinessOnboardingData,
  recommendation: ProgramRecommendation,
): Promise<LoyaltyProgram> {
  const archetype = getArchetype(recommendation.program_type)
  if (!archetype) throw new Error(`No archetype found for program type: ${recommendation.program_type}`)

  const prompt = buildGenerateProgramPrompt(onboardingData, recommendation, archetype)

  try {
    return await runGeneration(prompt)
  } catch {
    // Retry once
    return await runGeneration(prompt)
  }
}

import { PROGRAM_GUIDELINES } from './programGuidelines'
import type { BusinessCategory, LoyaltyGoal, Service } from '@/types'

const GOAL_DESCRIPTIONS: Record<LoyaltyGoal, string> = {
  retention: 'retaining existing clients and increasing lifetime value',
  referrals: 'growing the customer base through word-of-mouth referrals',
  frequency: 'increasing how often customers visit',
}

/**
 * Builds the prompt for generating a tailored loyalty program.
 * Uses selected services, business profile, and Supabase examples as context.
 */
export function buildGenerateProgramPrompt(
  businessName: string,
  businessCategory: BusinessCategory,
  goal: LoyaltyGoal,
  services: Service[],
  examples: unknown[],
): string {
  const goalDesc = GOAL_DESCRIPTIONS[goal]

  const servicesText =
    services.length > 0
      ? services
          .map((s) => `- ${s.name}${s.price_cents ? ` ($${(s.price_cents / 100).toFixed(0)})` : ''}`)
          .join('\n')
      : '(no specific services listed)'

  const examplesSection =
    examples.length > 0
      ? `\nReference examples of effective loyalty programs for similar businesses:\n${JSON.stringify(examples, null, 2)}\n`
      : ''

  return `You are a loyalty program strategist specializing in service businesses.

${PROGRAM_GUIDELINES}

---

Business: ${businessName}
Type: ${businessCategory}
Primary goal: ${goalDesc}

Services offered:
${servicesText}
${examplesSection}
Generate a tailored loyalty program for this business. Return JSON only — no markdown, no code fences, no explanation. All generated content must be professional, appropriate for business use, and free from offensive, harmful, or inappropriate language.

Use this exact structure:
{
  "program_name": "creative name for the loyalty program",
  "currency_name": "name for the points currency (e.g. 'Glow Points', 'Studio Credits')",
  "earn_rules": [
    { "label": "string", "points_per_dollar": number_or_null, "points_per_visit": number_or_null, "description": "string" }
  ],
  "reward_tiers": [
    { "name": "string", "points_required": number, "reward_description": "string" }
  ],
  "bonus_rules": [
    { "label": "string", "description": "string", "multiplier": number_or_null }
  ],
  "referral_description": "string",
  "brand_voice_summary": "string"
}

Include 2–3 earn rules, 3–4 reward tiers (first tier at 0 points for all members), and 2–3 bonus rules. Make the program feel specific to this business — use their service names, align rewards with their goal of ${goalDesc}.`
}

import type { BusinessCategory, LoyaltyGoal, LoyaltyProgram, Service } from '@/types'

const VALID_CATEGORIES: BusinessCategory[] = [
  'salon', 'spa', 'barbershop', 'clinic', 'fitness', 'wellness', 'other',
]
const VALID_GOALS: LoyaltyGoal[] = ['retention', 'referrals', 'frequency']

const BLOCKLIST = [
  'kill', 'murder', 'suicide', 'rape', 'cocaine', 'heroin', 'methamphetamine',
  'fuck', 'shit', 'porn', 'nude', 'naked',
]

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

export function validateInput(
  businessName: string,
  businessCategory: BusinessCategory,
  services: Service[],
  goal: LoyaltyGoal,
): { valid: boolean; error?: string } {
  if (!businessName || businessName.trim().length === 0) {
    return { valid: false, error: 'Business name is required.' }
  }
  if (businessName.trim().length > 100) {
    return { valid: false, error: 'Business name must be 100 characters or fewer.' }
  }
  if (!VALID_CATEGORIES.includes(businessCategory)) {
    return { valid: false, error: `Unrecognized business category: "${businessCategory}".` }
  }
  if (!services || services.filter((s) => s.name.trim().length > 0).length === 0) {
    return { valid: false, error: 'At least one service with a name is required.' }
  }
  if (!VALID_GOALS.includes(goal)) {
    return { valid: false, error: `Invalid loyalty goal: "${goal}".` }
  }
  return { valid: true }
}

// ---------------------------------------------------------------------------
// Output validation
// ---------------------------------------------------------------------------

export function validateOutput(raw: unknown): { valid: boolean; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Generated output is not a valid object.' }
  }
  const p = raw as Record<string, unknown>

  const requiredText = [
    'program_name', 'currency_name', 'referral_description', 'brand_voice_summary',
  ]
  for (const field of requiredText) {
    if (typeof p[field] !== 'string' || (p[field] as string).trim().length === 0) {
      return { valid: false, error: `Field "${field}" must be a non-empty string.` }
    }
  }

  const earnRules = p.earn_rules
  if (!Array.isArray(earnRules) || earnRules.length < 1) {
    return { valid: false, error: 'earn_rules must have at least 1 entry.' }
  }
  for (const rule of earnRules) {
    const r = rule as Record<string, unknown>
    const ppd = r.points_per_dollar as number | null
    const ppv = r.points_per_visit as number | null
    if ((ppd == null || ppd <= 0) && (ppv == null || ppv <= 0)) {
      return {
        valid: false,
        error: 'Each earn rule must have a positive points_per_dollar or points_per_visit.',
      }
    }
  }

  const rewardTiers = p.reward_tiers
  if (!Array.isArray(rewardTiers) || rewardTiers.length < 2) {
    return { valid: false, error: 'reward_tiers must have at least 2 entries.' }
  }
  let lastPoints = -1
  for (const tier of rewardTiers) {
    const t = tier as Record<string, unknown>
    if (typeof t.points_required !== 'number' || t.points_required <= lastPoints) {
      return { valid: false, error: 'reward_tiers points_required must be strictly ascending.' }
    }
    if (typeof t.reward_description !== 'string' || t.reward_description.trim().length === 0) {
      return { valid: false, error: 'Each reward tier must have a non-empty reward_description.' }
    }
    lastPoints = t.points_required as number
  }

  const bonusRules = p.bonus_rules
  if (!Array.isArray(bonusRules)) {
    return { valid: false, error: 'bonus_rules must be an array.' }
  }
  for (const rule of bonusRules) {
    const r = rule as Record<string, unknown>
    if (r.multiplier != null && typeof r.multiplier === 'number' && r.multiplier <= 1) {
      return { valid: false, error: 'Each bonus rule multiplier must be greater than 1 if present.' }
    }
  }

  return { valid: true }
}

// ---------------------------------------------------------------------------
// Content moderation
// ---------------------------------------------------------------------------

function collectProgramText(program: LoyaltyProgram): string {
  return [
    program.program_name,
    program.currency_name,
    program.brand_voice_summary,
    program.referral_description,
    ...program.earn_rules.map((r) => `${r.label} ${r.description}`),
    ...program.reward_tiers.map((t) => `${t.name} ${t.reward_description}`),
    ...program.bonus_rules.map((b) => `${b.label} ${b.description}`),
  ].join(' ').toLowerCase()
}

export function moderateContent(program: LoyaltyProgram): { safe: boolean; reason?: string } {
  const combined = collectProgramText(program)
  for (const term of BLOCKLIST) {
    if (combined.includes(term)) {
      return { safe: false, reason: `Generated content contains inappropriate term: "${term}".` }
    }
  }
  return { safe: true }
}

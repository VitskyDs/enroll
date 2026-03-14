import type { BusinessOnboardingData, PrimaryGoal, ProgramRecommendation, ProgramType } from '@/types'

// Industry group definitions from onboarding_schema.json
const HIGH_FREQUENCY_PRODUCT = ['food & beverage', 'grocery & pharmacy', 'automotive']
const EXPERIENCE_AND_STATUS = ['hospitality & travel', 'health & beauty', 'fitness & wellness', 'entertainment']
const PRICE_SENSITIVE = ['grocery & pharmacy', 'financial services', 'e-commerce', 'retail — general']
const SINGLE_SKU_SERVICE = ['food & beverage', 'health & beauty', 'fitness & wellness', 'automotive']

function isPunchCardEligible(data: BusinessOnboardingData): boolean {
  const isSingleOffering = data.offering_type !== 'both'
  const inEligibleIndustry = [...HIGH_FREQUENCY_PRODUCT, ...SINGLE_SKU_SERVICE].includes(data.industry)
  return isSingleOffering && inEligibleIndustry
}

/**
 * Deterministic implementation of the 8 decision rules from onboarding_schema.json.
 * First matching rule wins.
 */
export function recommendProgram(data: BusinessOnboardingData): ProgramRecommendation {
  const { primary_goal, visit_frequency, spend_variance, industry } = data

  // R1: High frequency + varied spend
  if (visit_frequency === 'high' && spend_variance === 'varied') {
    const industryConfirms = ['food & beverage', 'health & beauty', 'fitness & wellness', 'retail — specialty'].includes(industry)
    return {
      program_type: 'points_tiers',
      confidence: industryConfirms ? 'high' : 'medium',
      rationale: `High visit frequency creates habit, and varied spending means your top customers are worth recognizing — a points-plus-tiers program rewards everyone while giving your best customers faster rewards and exclusive status.`,
    }
  }

  // R2: High frequency + consistent spend + acquire goal
  if (visit_frequency === 'high' && spend_variance === 'consistent' && primary_goal === 'acquire') {
    const eligible = isPunchCardEligible(data)
    if (eligible) {
      const industryConfirms = ['food & beverage', 'automotive'].includes(industry)
      return {
        program_type: 'punch_card',
        confidence: industryConfirms ? 'high' : 'medium',
        rationale: `A punch card is the simplest and most recognizable loyalty mechanic for a high-frequency single-service business — customers understand it instantly, which makes it the best acquisition tool.`,
      }
    }
    return {
      program_type: 'points',
      confidence: 'medium',
      rationale: `Flat points work well for frequent, consistent buyers who want to grow new members — the welcome bonus and referral mechanics are natural acquisition hooks.`,
    }
  }

  // R3: High frequency + consistent spend + retain or revenue goal
  if (visit_frequency === 'high' && spend_variance === 'consistent' && (['retain', 'revenue'] as PrimaryGoal[]).includes(primary_goal)) {
    const industryConfirms = ['food & beverage', 'grocery & pharmacy', 'retail — specialty'].includes(industry)
    return {
      program_type: 'points',
      confidence: industryConfirms ? 'high' : 'medium',
      rationale: `Frequent, consistent visitors are ideal for a points program — they accumulate quickly enough to feel rewarding, and a well-structured flat rate is simpler and more engaging than adding tier complexity when spend is uniform.`,
    }
  }

  // R4: Medium frequency + varied spend + revenue goal
  if (visit_frequency === 'medium' && spend_variance === 'varied' && primary_goal === 'revenue') {
    const industryConfirms = ['retail — specialty', 'health & beauty', 'fitness & wellness', 'hospitality & travel'].includes(industry)
    return {
      program_type: 'points_tiers',
      confidence: industryConfirms ? 'high' : 'medium',
      rationale: `Tiers motivate mid-frequency customers to spend more to reach the next level — when spend varies, that tier gap is a powerful pull that directly drives revenue.`,
    }
  }

  // R5: Medium frequency + consistent spend
  if (visit_frequency === 'medium' && spend_variance === 'consistent') {
    if (PRICE_SENSITIVE.includes(industry)) {
      return {
        program_type: 'cashback',
        confidence: 'high',
        rationale: `Price-sensitive industries see higher signup and engagement with immediate cash back than delayed points — customers can see the value instantly in dollar terms.`,
      }
    }
    const industryConfirms = ['retail — specialty', 'food & beverage'].includes(industry)
    return {
      program_type: 'points',
      confidence: industryConfirms ? 'high' : 'medium',
      rationale: `Moderate frequency with uniform spend is the classic points program use case — predictable earning keeps customers engaged without the complexity of tiers.`,
    }
  }

  // R6: Low frequency + varied spend + retain goal
  if (visit_frequency === 'low' && spend_variance === 'varied' && primary_goal === 'retain') {
    const industryConfirms = ['hospitality & travel', 'health & beauty', 'retail — specialty', 'professional services'].includes(industry)
    return {
      program_type: 'tiered',
      confidence: industryConfirms ? 'high' : 'medium',
      rationale: `Low frequency with high spend variance signals a small VIP cohort driving most of your revenue — a tiered program rewards and retains those top customers without wasting budget on occasional buyers.`,
    }
  }

  // R7: Low frequency + acquire goal
  if (visit_frequency === 'low' && primary_goal === 'acquire') {
    if (EXPERIENCE_AND_STATUS.includes(industry)) {
      return {
        program_type: 'tiered',
        confidence: 'high',
        rationale: `In experience-driven industries, the aspirational pull of tier status is a stronger acquisition hook than cash back — customers join to unlock exclusive access, not just a discount.`,
      }
    }
    const industryConfirms = ['grocery & pharmacy', 'financial services', 'e-commerce'].includes(industry)
    return {
      program_type: 'cashback',
      confidence: industryConfirms ? 'high' : 'medium',
      rationale: `Immediate tangible value is the most effective acquisition tool when customers visit infrequently — cash back shows value right away without requiring repeated visits to feel meaningful.`,
    }
  }

  // R8: Coalition — multi-brand context (only surfaced when other signals are weak)
  // Not recommended as a primary — fall through to default

  // Default: points-based (most versatile)
  const isHighStatus = EXPERIENCE_AND_STATUS.includes(industry)
  if (isHighStatus && spend_variance === 'varied') {
    return {
      program_type: 'tiered',
      confidence: 'medium',
      rationale: `Your industry and customer spend patterns suggest a tiered program will resonate most — it signals exclusivity and rewards your best customers in a way that fits your brand.`,
    }
  }

  return {
    program_type: 'points',
    confidence: 'medium',
    rationale: `A points-based program is a flexible and proven starting point — it rewards every purchase, scales easily, and works across a wide range of business types and goals.`,
  }
}

// Human-readable labels for program types
export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  points: 'Points-based',
  tiered: 'Tiered membership',
  cashback: 'Cash back',
  punch_card: 'Punch card',
  coalition: 'Coalition',
  points_tiers: 'Points + tiers',
}

export const PROGRAM_TYPE_DESCRIPTIONS: Record<ProgramType, string> = {
  points: 'Customers earn points per dollar spent and redeem them for rewards.',
  tiered: 'Members are grouped into levels with better perks at higher tiers based on annual spend.',
  cashback: 'Customers earn a percentage of every purchase back as store credit.',
  punch_card: 'Customers collect a stamp per visit — after a set number they earn a free item.',
  coalition: 'A shared rewards network across multiple brands.',
  points_tiers: 'All members earn points, but earn rate and perks accelerate at higher tiers.',
}

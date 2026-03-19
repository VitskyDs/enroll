/**
 * Demo data for dev-mode testing — skips all API calls.
 * Only imported in DEV via the demo shortcut buttons.
 */
import type { BusinessOnboardingData, LoyaltyProgram, ProgramRecommendation, Service } from '@/types'

export const DEMO_SERVICES: Service[] = [
  { id: 'demo-1', name: 'Signature cut & style', price_cents: 8500, duration_minutes: 60, category: 'Haircut', subscription_price_cents: null },
  { id: 'demo-2', name: 'Full color & highlights', price_cents: 18000, duration_minutes: 150, category: 'Color', subscription_price_cents: null },
  { id: 'demo-3', name: 'Blowout & finish', price_cents: 5500, duration_minutes: 45, category: 'Styling', subscription_price_cents: null },
  { id: 'demo-4', name: 'Deep conditioning treatment', price_cents: 4500, duration_minutes: 30, category: 'Treatment', subscription_price_cents: null },
]

export const DEMO_ONBOARDING_DATA: BusinessOnboardingData & { services: Service[] } = {
  business_name: 'Lumière Studio',
  website: 'https://lumierestudio.com',
  services_and_products: 'Signature cut & style, Full color & highlights, Blowout & finish, Deep conditioning treatment',
  offering_type: 'service',
  industry: 'salon',
  brand_personality: {
    tone: 'premium',
    identity_keywords: ['luxury', 'modern', 'elevated'],
    price_positioning: 'premium',
    customer_relationship_model: 'expert-to-customer',
  },
  primary_goal: 'retain',
  visit_frequency: 'medium',
  spend_variance: 'varied',
  services: DEMO_SERVICES,
}

export const DEMO_RECOMMENDATION: ProgramRecommendation = {
  program_type: 'points_tiers',
  confidence: 'high',
  rationale:
    'Your premium positioning and retention goal pair perfectly with a tiered points program — tiers reward your most loyal guests with status they can see, while points make every visit feel like progress.',
}

export const DEMO_PROGRAM: LoyaltyProgram = {
  id: 'demo-program',
  business_id: 'demo-business',
  created_at: new Date().toISOString(),
  program_type: 'points_tiers',
  program_type_reason: 'Points with tiers incentivize repeat visits and aspirational upgrades for a premium salon.',
  industry: 'salon',
  program_name: 'Lumière Rewards',
  program_name_explanation: 'Evokes the studio brand while feeling aspirational.',
  currency_name: 'Lumière Points',
  currency_name_explanation: 'Reinforces the premium brand identity on every transaction.',
  earn_rules: {
    dollar_spend: {
      points_per_dollar: 10,
    },
    rebook_on_spot: {
      bonus_points: 50,
    },
  },
  redemption_rules: {
    minimum_to_redeem: 200,
    redemption_value: '200 Lumière Points = $5 off any service',
    partial_redemption_allowed: false,
  },
  reward_tiers: [
    {
      tier_name: 'Pearl',
      tier_rank: 1,
      qualification_threshold: '0 points — all enrolled members',
      perks: ['Priority booking'],
    },
    {
      tier_name: 'Gold',
      tier_rank: 2,
      qualification_threshold: '500 Lumière Points annual',
      perks: ['Priority booking', '10% off retail products'],
    },
    {
      tier_name: 'Diamond',
      tier_rank: 3,
      qualification_threshold: '1,500 Lumière Points annual',
      perks: ['Priority booking', '15% off retail', 'Complimentary treatment annually'],
    },
  ],
  tier_progression_rules: {
    starting_tier: 'Pearl',
    upgrade_timing: 'Upgrade applies immediately when threshold is reached',
    downgrade_policy: 'Tier status evaluated on a rolling 12-month basis',
    downgrade_warning: 'Members notified 30 days before potential downgrade',
    qualification_period: 'Rolling 12 months',
  },
  points_expiry_rules: {
    expiry_policy: 'rolling',
    expires_after_inactivity_days: 365,
    warning_notification_days_before: 30,
  },
  bonus_rule: {
    trigger: 'anniversary_of_enrollment',
    value: 200,
    unit: 'bonus_points',
  },
  program_purpose:
    'Retain loyal guests and deepen the relationship through recognition and meaningful reward.',
  referral_rules: {
    referrer_reward: 150,
    referee_reward: 100,
    description: 'Earn 150 points when a friend books their first visit',
  },
  brand_voice_summary:
    'Sophisticated warmth — we celebrate your beauty journey with quiet confidence and genuine care.',
  llm_customization_hints: {},
  terms_and_conditions:
    'LUMIÈRE REWARDS — TERMS AND CONDITIONS\n\n1. Members earn 10 Lumière Points per $1 spent on qualifying services at Lumière Studio.\n2. Points may be redeemed once a balance of 200 has accumulated. 200 Lumière Points = $5 off any service.\n3. Pearl tier (0+ points): Priority booking.\n4. Gold tier (500+ points): Priority booking + 10% off retail products.\n5. Diamond tier (1,500+ points): Priority booking + 15% off retail + complimentary treatment annually.\n6. Tier status is evaluated on a rolling 12-month basis. Downgrade applies if points fall below tier threshold.\n7. Points expire after 12 months of account inactivity. Members will be notified 30 days before expiry.\n8. Birthday month bonus: 200 bonus Lumière Points credited automatically.\n9. Referral rewards: referring member earns 150 points; referred friend earns 100 points upon their first visit.\n10. Points have no cash value and cannot be transferred or sold.\n11. Lumière Studio reserves the right to modify or terminate the program with 30 days notice.',
}

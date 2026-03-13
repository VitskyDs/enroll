/**
 * Demo data for dev-mode testing — skips all API calls.
 * Only imported in DEV via the demo shortcut buttons.
 */
import type { BusinessOnboardingData, LoyaltyProgram, ProgramRecommendation, Service } from '@/types'

export const DEMO_SERVICES: Service[] = [
  { id: 'demo-1', name: 'Haircut & Blowout', price_cents: 8500, duration_minutes: 60, category: 'hair', subscription_price_cents: null },
  { id: 'demo-2', name: 'Color & Highlights', price_cents: 16000, duration_minutes: 120, category: 'hair', subscription_price_cents: null },
  { id: 'demo-3', name: 'Keratin Treatment', price_cents: 22000, duration_minutes: 150, category: 'hair', subscription_price_cents: null },
  { id: 'demo-4', name: 'Blow Dry & Style', price_cents: 5500, duration_minutes: 45, category: 'hair', subscription_price_cents: null },
]

export const DEMO_ONBOARDING_DATA: BusinessOnboardingData & { services: Service[] } = {
  business_name: 'Luxe Studio',
  website: 'https://luxestudio.com',
  services_and_products: 'Haircut & Blowout, Color & Highlights, Keratin Treatment, Blow Dry & Style',
  offering_type: 'service',
  industry: 'health & beauty',
  brand_personality: {
    tone: 'premium',
    identity_keywords: ['luxurious', 'modern', 'personalized'],
    price_positioning: 'premium',
    customer_relationship_model: 'expert-to-customer',
  },
  primary_goal: 'retain',
  visit_frequency: 'medium',
  spend_variance: 'consistent',
  services: DEMO_SERVICES,
}

export const DEMO_RECOMMENDATION: ProgramRecommendation = {
  program_type: 'points',
  confidence: 'high',
  rationale:
    'Your clients visit regularly and spend consistently — a points program rewards every visit, builds habit, and is simple enough to explain at the chair.',
}

export const DEMO_PROGRAM: LoyaltyProgram = {
  id: 'demo-program',
  business_id: 'demo-business',
  created_at: new Date().toISOString(),
  program_type: 'points',
  industry: 'health & beauty',
  program_name: 'Luxe Rewards',
  currency_name: 'Luxe Points',
  earn_rules: {
    base_rate: '1 Luxe Point per $1 spent',
    qualifying_actions: [
      { action: 'purchase', rate: '1 Luxe Point per $1', notes: 'rounded down to nearest dollar' },
      { action: 'account_signup', bonus_sips: 100, notes: 'one-time welcome bonus' },
      { action: 'birthday_month_purchase', multiplier: 2, notes: 'double points on any service in birthday month' },
      { action: 'review_submission', bonus_sips: 50, notes: 'one per customer lifetime' },
    ],
    minimum_spend_to_earn: 10,
  },
  redemption_rules: {
    minimum_to_redeem: 200,
    redemption_value: '200 Luxe Points = $10 reward',
    redemption_rate_display: 'earn $10 for every $200 spent',
    redeemable_on: ['any service', 'retail products'],
    cannot_redeem_on: ['gift cards'],
    partial_redemption_allowed: true,
    notes: 'reward applied as credit at checkout',
  },
  reward_tiers: null,
  tier_progression_rules: null,
  points_expiry_rules: {
    expiry_policy: 'rolling',
    expires_after_inactivity_days: 180,
    warning_notification_days_before: 30,
    notes: 'expiry resets on any qualifying service purchase',
  },
  bonus_rules: [
    { trigger: 'double_points_day', multiplier: 2, frequency: 'once per month', stackable: false },
    { trigger: 'first_purchase', bonus_sips: 100, notes: 'applied automatically on first visit post-signup' },
    { trigger: 'referral_friend_joins', bonus_sips: 50, notes: 'awarded when referred friend books first appointment' },
  ],
  referral_description:
    'Share your referral link. Earn 50 Luxe Points when your friend books their first appointment. Your friend gets 100 points to start.',
  brand_voice_summary:
    'Elevated, warm, and personal. The program should feel like a natural extension of the studio experience — understated but rewarding. Celebrate milestones quietly and make every client feel like a regular.',
  llm_customization_hints: {},
  terms_and_conditions:
    'LUXE REWARDS — TERMS AND CONDITIONS\n\n1. Members earn 1 Luxe Point per $1 spent on qualifying services.\n2. Points may be redeemed once a balance of 200 has accumulated.\n3. Points expire after 180 days of account inactivity.\n4. The program may be modified or terminated at any time.',
}

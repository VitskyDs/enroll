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
  program_type_reason:
    'A points program is the right fit for Luxe Studio because your clients visit on a predictable schedule and spend consistently each time. Points create a clear, tangible reason to come back — every service moves them closer to a reward they can see accumulating. For a retention-focused salon at your price point, this structure rewards loyalty without devaluing the experience.',
  industry: 'health & beauty',
  program_name: 'Luxe Rewards',
  program_name_explanation:
    'Luxe Rewards takes its name from the studio itself — a program that feels as considered and elevated as the services you deliver. It signals that loyalty here comes with a premium experience, not just a discount.',
  currency_name: 'Luxe Points',
  currency_name_explanation:
    'Luxe Points are the currency you earn at Luxe Studio. You earn 1 Luxe Point for every dollar you spend on any service — they accumulate quietly and are ready to redeem whenever you choose.',
  earn_rules: {
    dollar_spend: {
      points_per_dollar: 1,
      explanation: 'Earn 1 Luxe Point for every dollar you spend on any service at Luxe Studio.',
    },
    rebook_on_spot: {
      bonus_points: 50,
      explanation:
        'Book your next appointment before you leave and earn 50 bonus Luxe Points — a small thank-you for planning ahead.',
    },
  },
  redemption_rules: {
    minimum_to_redeem: 200,
    redemption_value: '200 Luxe Points = $10',
    partial_redemption_allowed: true,
    explanation:
      'Once you've collected 200 Luxe Points, you can redeem them for $10 off any service. You can use points in any increment of 200 — they never expire as long as you visit within 90 days.',
  },
  reward_tiers: null,
  tier_progression_rules: null,
  points_expiry_rules: {
    expiry_policy: 'rolling',
    expires_after_inactivity_days: 90,
    warning_notification_days_before: 14,
    explanation:
      'Your Luxe Points stay active as long as you visit at least once every 90 days. We'll remind you before they expire so you never lose what you've earned.',
  },
  bonus_rule: {
    trigger: 'birthday_month',
    value: 2,
    unit: 'multiplier',
    explanation:
      'Earn double Luxe Points on any service booked during your birthday month — our way of making sure you treat yourself.',
  },
  program_purpose:
    'Luxe Studio's clients are regulars who return every four to eight weeks and spend consistently on premium services. A points program keeps retention front and center — every visit has a reward signal attached, which is exactly what drives rebooking behaviour in appointment-based businesses. The earn-on-spend mechanic is simple enough to explain at checkout, and the 200-point threshold maps naturally to two or three visits, creating a satisfying, attainable loop.',
  referral_rules: {
    referrer_reward: 100,
    referee_reward: 50,
    trigger: 'referee_first_visit',
    explanation:
      'Know someone who would love Luxe Studio? Share your referral link — when they book and complete their first appointment, you earn 100 Luxe Points and they start with 50.',
  },
  brand_voice_summary:
    'Elevated, warm, and personal. The program should feel like a natural extension of the studio experience — understated but rewarding. Celebrate milestones quietly and make every client feel like a regular. Example notification: "You've earned enough for a reward. Book your next appointment and let us apply it."',
  llm_customization_hints: {},
  terms_and_conditions:
    'LUXE REWARDS — TERMS AND CONDITIONS\n\n1. Members earn 1 Luxe Point per $1 spent on qualifying services at Luxe Studio.\n2. 50 bonus Luxe Points are awarded when a member rebooks their next appointment before leaving.\n3. Points may be redeemed once a balance of 200 has accumulated. 200 Luxe Points = $10 off any service.\n4. Partial redemption is allowed in increments of 200 points.\n5. Points expire after 90 days of account inactivity. Members will be notified 14 days before expiry.\n6. Birthday month bonus: members earn 2× Luxe Points on all services during their birthday month.\n7. Referral rewards: referring member earns 100 Luxe Points; referred friend earns 50 Luxe Points upon completing their first appointment.\n8. Points have no cash value and cannot be transferred, sold, or combined with other offers.\n9. Luxe Studio reserves the right to modify or terminate the program at any time with reasonable notice.\n10. For questions, contact us at [Email] or visit us at [Address].',
}

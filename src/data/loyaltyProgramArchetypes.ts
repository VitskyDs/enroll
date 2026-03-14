import type { ProgramType } from '@/types'

export interface Archetype {
  program_type: ProgramType
  program_type_reason: string
  industry: string
  program_name: string
  program_name_explanation: string
  currency_name: string
  currency_name_explanation: string
  earn_rules: object
  redemption_rules: object
  reward_tiers: object[] | null
  tier_progression_rules: object | null
  points_expiry_rules: object
  bonus_rule: object
  referral_rules: object
  brand_voice_summary: string
  llm_customization_hints: object
  terms_and_conditions: string
}

export const ARCHETYPES: Archetype[] = [
  {
    program_type: 'points',
    program_type_reason: 'A points-based program suits high-frequency businesses with consistent spend — customers visit often enough to accumulate points quickly, and flat points reward every transaction without requiring complex tier tracking.',
    industry: 'food & beverage',
    program_name: 'Sip Rewards',
    program_name_explanation: 'Sip Rewards ties the program name to the core product — a drink. It is short, on-brand, and immediately tells customers what they are earning toward.',
    currency_name: 'Sips',
    currency_name_explanation: 'Sips are the points you earn at this business. You earn 1 Sip for every dollar you spend on any qualifying purchase.',
    earn_rules: {
      dollar_spend: {
        points_per_dollar: 1,
        explanation: 'Earn 1 Sip for every dollar you spend.',
      },
      rebook_on_spot: {
        bonus_points: 20,
        explanation: 'Book your next visit before you leave and earn 20 bonus Sips.',
      },
    },
    redemption_rules: {
      minimum_to_redeem: 100,
      redemption_value: '100 Sips = $5 reward',
      redemption_rate_display: 'earn $5 for every $100 spent',
      redeemable_on: ['any purchase', 'in-store and online'],
      cannot_redeem_on: ['alcohol', 'gift cards'],
      partial_redemption_allowed: true,
      explanation: 'Once you have 100 Sips, you can redeem them for $5 off any qualifying purchase.',
    },
    reward_tiers: null,
    tier_progression_rules: null,
    points_expiry_rules: {
      expiry_policy: 'rolling',
      expires_after_inactivity_days: 180,
      warning_notification_days_before: 30,
      explanation: 'Your Sips are valid as long as you make at least one qualifying purchase every 180 days. We\'ll remind you 30 days before any points are set to expire.',
    },
    bonus_rule: {
      trigger: 'birthday_month',
      value: 2,
      unit: 'multiplier',
      explanation: 'Earn double Sips on any purchase made during your birthday month.',
    },
    referral_rules: {
      referrer_reward: 30,
      referee_reward: 20,
      trigger: 'referee_first_purchase',
      explanation: 'Share your referral link or code. When a friend makes their first purchase, you earn 30 Sips and they start with 20.',
    },
    brand_voice_summary: 'Warm, community-focused, and approachable. The program should feel like a thank-you from a local business, not a corporate scheme. Use first-name messaging and celebrate milestones.',
    llm_customization_hints: {
      vary_by_industry: 'Adjust earn_rules.dollar_spend and earn_rules.rebook_on_spot to match the business — a salon earns on appointments, a gym earns on class check-ins. Keep exactly these two earn mechanisms.',
      vary_by_goal: {
        acquire: 'Increase referral_rules.referee_reward and referral_rules.referrer_reward; lower redemption_rules.minimum_to_redeem to show value faster.',
        retain: 'Tighten points_expiry_rules.expires_after_inactivity_days to 90 to create urgency.',
        revenue: 'Increase rebook_on_spot.bonus_points to strongly incentivize rebooking.',
      },
      vary_currency_name: "Rename 'Sips' to something on-brand — a bookshop might use 'Pages', a pet store might use 'Paws'. Update currency_name_explanation accordingly.",
      keep_fixed: [
        'Exactly two earn mechanisms: dollar_spend and rebook_on_spot — no others.',
        'Base redemption rate (100 pts = $5 is a 5% return — adjust only if margin allows).',
        'partial_redemption_allowed must stay true.',
        'bonus_rule is a single object, not an array — pick one trigger only.',
      ],
    },
    terms_and_conditions: 'PROGRAM NAME REWARDS — TERMS AND CONDITIONS\n\nLast Updated: [DATE]\n\n1. PROGRAM OVERVIEW\n[Business Name] ("Company," "we," "us," or "our") operates the [Program Name] loyalty rewards program ("Program"). By enrolling in the Program, you ("Member," "you," or "your") agree to be bound by these Terms and Conditions ("Terms").\n\n2. ELIGIBILITY AND ENROLLMENT\n2.1 The Program is open to individuals who are 18 years of age or older.\n2.2 Enrollment requires a valid name and email address.\n2.3 One account is permitted per individual.\n\n3. EARNING [CURRENCY NAME]\n3.1 Members earn [X] [Currency Name] for every $1.00 spent on qualifying purchases.\n3.2 Bonus [Currency Name] may be awarded for rebooking on the spot, qualifying referrals, and promotional events.\n3.3 [Currency Name] have no cash value and may not be transferred.\n\n4. REDEMPTION\n4.1 Members may redeem [Currency Name] once a minimum balance of [X] has accumulated.\n4.2 A redemption value of [X] [Currency Name] equals $[X] in store credit.\n\n5. EXPIRATION\n5.1 [Currency Name] expire after [X] consecutive days of account inactivity.\n5.2 The Company will notify Members 30 days prior to expiration.\n\n6. PROGRAM MODIFICATIONS\n6.1 The Company reserves the right to modify or terminate the Program at any time.\n\n7. GOVERNING LAW\nThese Terms shall be governed by the laws of [State/Jurisdiction].\n\n8. CONTACT\n[Business Name], [Address], [Email], [Phone].',
  },
  {
    program_type: 'tiered',
    program_type_reason: 'A tiered program suits businesses where customer spend varies significantly. Tiers recognize and retain high-value clients with meaningful perks while still rewarding casual visitors — and the spend-based structure naturally encourages customers to increase visits to reach the next level.',
    industry: 'retail — specialty',
    program_name: 'The Inner Circle',
    program_name_explanation: 'The Inner Circle positions the program as exclusive membership rather than a transactional points scheme. It signals that higher tiers represent genuine recognition, not just accumulated discounts.',
    currency_name: 'annual spend (no named points currency — tier is spend-based)',
    currency_name_explanation: 'This program does not use points. Your tier is determined by how much you spend with us over a rolling 12-month period. The more you spend, the higher your tier and the better your perks.',
    earn_rules: {
      dollar_spend: {
        spend_tracked: true,
        explanation: 'Every dollar you spend counts toward your annual total and determines your tier.',
      },
      rebook_on_spot: {
        spend_credit_multiplier: 1.25,
        explanation: 'Book your next appointment before you leave — your spend counts at 1.25× toward your annual tier total.',
      },
    },
    redemption_rules: {
      mechanism: 'perks are automatic and tier-based, not redeemed manually',
      explanation: 'You do not redeem anything — your benefits activate automatically based on your current tier. Discounts apply at checkout without any action needed from you.',
    },
    reward_tiers: [
      {
        tier_name: 'Member',
        tier_rank: 1,
        qualification_threshold: '$0 — all enrolled customers',
        perks: [
          'Birthday discount: 15% off one purchase in birthday month',
          'Early access to sale events (24 hours before public)',
          'Free standard shipping on orders over $75',
        ],
        explanation: 'Member is the entry tier — every customer who enrolls starts here automatically.',
      },
      {
        tier_name: 'Insider',
        tier_rank: 2,
        qualification_threshold: '$500 annual spend',
        perks: [
          'Everything in Member',
          '10% off every purchase',
          'Free standard shipping on all orders (no minimum)',
          'Exclusive insider-only product drops',
          'Dedicated customer service line',
        ],
        explanation: 'Insider unlocks once you spend $500 in a rolling 12-month period. You keep this tier as long as you maintain that spend level.',
      },
      {
        tier_name: 'Icon',
        tier_rank: 3,
        qualification_threshold: '$1,500 annual spend',
        perks: [
          'Everything in Insider',
          '15% off every purchase',
          'Free expedited shipping on all orders',
          'Quarterly gift with purchase',
          'Invitation to private events and product previews',
          'Personal consultant access',
        ],
        explanation: 'Icon is the top tier, reserved for our most valued customers. It unlocks at $1,500 in annual spend and comes with the highest level of perks and recognition.',
      },
    ],
    tier_progression_rules: {
      qualification_period: 'rolling 12 months',
      upgrade_timing: 'Tier upgrades immediately when spend threshold is crossed.',
      downgrade_policy: 'Tier is re-evaluated annually. If spend drops below threshold, customer drops one tier (not to bottom), with a 90-day grace period after renewal date.',
      downgrade_warning: 'Notification sent 60 days before renewal date showing spend needed to maintain current tier.',
      starting_tier: 'Member — all enrollees start here regardless of prior spend history.',
      explanation: 'Your tier updates automatically — upgrades happen the moment you cross a threshold, and downgrades come with a 90-day grace period so you have time to maintain your status.',
    },
    points_expiry_rules: {
      expiry_policy: 'not applicable — this is a spend-based tier program with no points currency',
      tier_status_expiry: 'See tier_progression_rules for how tier status is maintained or lost.',
      explanation: 'There are no points to expire in this program. Your tier status is based on your 12-month rolling spend and is reviewed annually.',
    },
    bonus_rule: {
      trigger: 'tier_upgrade',
      reward_description: 'one-time welcome discount at new tier',
      value: 20,
      unit: 'percent_off_next_purchase',
      explanation: 'When you reach a new tier, you get 20% off your next purchase as a welcome to that level — applied automatically.',
    },
    referral_rules: {
      referrer_reward_credit_cents: 2500,
      referee_reward_discount_percent: 10,
      trigger: 'referee_reaches_insider',
      explanation: 'Refer a friend and earn a $25 store credit when they reach Insider status. Your friend starts at Member with a 10% welcome discount on their first order.',
    },
    brand_voice_summary: 'Elevated, aspirational, and insider-feeling. The program should make customers feel recognized and chosen, not just discounted. Language should be warm but polished.',
    llm_customization_hints: {
      vary_by_industry: {
        'hospitality & travel': 'Replace spend thresholds with nights stayed or flights taken; replace product perks with room upgrades, late checkout, lounge access.',
        'health & beauty': 'Replace product drops with early access to new treatments or product lines; add consultation perks at top tier.',
        'professional services': 'Replace product perks with priority scheduling, dedicated account manager, reduced rates on premium services.',
      },
      vary_by_goal: {
        acquire: 'Lower the Member → Insider threshold to make first upgrade feel achievable quickly.',
        retain: 'Tighten downgrade grace period; add a spend nudge 60 days before renewal.',
        revenue: 'Widen the gap between Insider and Icon to stretch high-value customers further.',
      },
      vary_tier_names: "Rename tiers to match brand identity — a spa might use 'Glow / Radiance / Luminous'; a wine shop might use 'Explorer / Connoisseur / Sommelier'.",
      vary_threshold_amounts: 'Calibrate thresholds to average order value — Icon tier should be reachable by roughly the top 10–15% of customers.',
      keep_fixed: [
        'Exactly two earn mechanisms: dollar_spend and rebook_on_spot — no others.',
        'Downgrade grace period (90 days minimum).',
        'Automatic upgrade timing — never make customers claim their upgrade manually.',
        'bonus_rule is a single object, not an array — pick one trigger only.',
      ],
    },
    terms_and_conditions: 'PROGRAM NAME MEMBERSHIP — TERMS AND CONDITIONS\n\nLast Updated: [DATE]\n\n1. PROGRAM OVERVIEW\n[Business Name] ("Company") operates [Program Name] ("Program"), a tiered membership program that rewards customers based on annual qualifying spend.\n\n2. TIER STRUCTURE\n2.1 Tier qualification is based on cumulative qualifying spend within a rolling 12-month period.\n2.2 Tier upgrades take effect immediately when spend threshold is crossed.\n2.3 A grace period of 90 days from the Renewal Date is provided before any downgrade takes effect.\n\n3. PROGRAM MODIFICATIONS\n3.1 The Company reserves the right to modify or terminate the Program at any time.\n\n4. GOVERNING LAW\nThese Terms are governed by the laws of [State/Jurisdiction].\n\n5. CONTACT\n[Business Name], [Address], [Email], [Phone]',
  },
  {
    program_type: 'cashback',
    program_type_reason: 'A cashback program suits value-conscious customers who visit infrequently. Immediate, tangible cashback gives new customers a clear reason to return without asking them to accumulate abstract points over a long period. It is also the easiest program type to communicate.',
    industry: 'grocery & pharmacy',
    program_name: 'Cart Credit',
    program_name_explanation: 'Cart Credit directly describes what the program does — you fill your cart and earn credit back. It is plain, honest, and works for a value-conscious audience.',
    currency_name: 'store credit (displayed as $ value, not points)',
    currency_name_explanation: 'This program gives you real dollar credit back on every qualifying purchase. Your balance is always displayed as a dollar amount — no points to convert or track.',
    earn_rules: {
      dollar_spend: {
        cashback_percent: 2,
        explanation: 'Earn 2% back as store credit on every dollar you spend.',
      },
      rebook_on_spot: {
        bonus_credit_cents: 500,
        explanation: 'Schedule your next visit before you leave and earn $5 in bonus store credit.',
      },
    },
    redemption_rules: {
      minimum_to_redeem: 5.0,
      redemption_method: 'Applied automatically at checkout or manually via app toggle.',
      auto_apply_default: true,
      redeemable_on: ['any in-store or online purchase'],
      cannot_redeem_on: ['alcohol where restricted by law', 'lottery tickets', 'gift cards'],
      partial_redemption_allowed: true,
      explanation: 'Once you have $5 in store credit, it is applied automatically at your next checkout. You can turn off auto-apply in your account settings if you prefer to save it for a larger purchase.',
    },
    reward_tiers: null,
    tier_progression_rules: null,
    points_expiry_rules: {
      expiry_policy: 'rolling',
      expires_after_inactivity_days: 365,
      warning_notification_days_before: 45,
      explanation: 'Your store credit stays active as long as you make at least one qualifying purchase per year. We will remind you 45 days before any credit is set to expire.',
    },
    bonus_rule: {
      trigger: 'first_purchase',
      bonus_credit_cents: 500,
      unit: 'flat_credit',
      explanation: 'Earn $5 in store credit instantly on your first qualifying purchase after signing up.',
    },
    referral_rules: {
      referrer_reward_credit_cents: 500,
      referee_reward_credit_cents: 500,
      trigger: 'referee_first_purchase',
      minimum_referee_spend_cents: 1000,
      explanation: 'Refer a friend and you both get $5 in store credit when they make their first purchase of $10 or more. There is no limit to how many friends you can refer.',
    },
    brand_voice_summary: "Straightforward, honest, and value-focused. Never use jargon or gamification language. The program should communicate 'you save real money every time you shop here'.",
    llm_customization_hints: {
      vary_by_industry: {
        'e-commerce': 'Increase base cashback_percent to 3–5% to compete with credit card cashback.',
        'fuel & automotive': 'Tie earn to fuel fill-up frequency.',
        'financial services': 'Frame as statement credit rather than store credit.',
      },
      vary_by_goal: {
        acquire: 'Lead with the first-purchase bonus_rule in all acquisition messaging.',
        retain: 'Increase rebook_on_spot.bonus_credit_cents to strongly incentivize return visits.',
        revenue: 'Increase dollar_spend.cashback_percent to shift basket composition toward higher-margin visits.',
      },
      vary_cashback_rate: '2% is sustainable at 30%+ gross margin. For lower-margin businesses, 1% base is safer.',
      keep_fixed: [
        'Exactly two earn mechanisms: dollar_spend and rebook_on_spot — no others.',
        'Always display value in dollars, never in points.',
        'auto_apply_default must stay true.',
        'minimum_to_redeem must stay at $5 or below.',
        'bonus_rule is a single object, not an array — pick one trigger only.',
      ],
    },
    terms_and_conditions: "PROGRAM NAME CREDIT — TERMS AND CONDITIONS\n\nLast Updated: [DATE]\n\n1. PROGRAM OVERVIEW\n[Business Name] (\"Company\") operates [Program Name] (\"Program\"), a cashback rewards program that returns a percentage of qualifying purchases as store credit.\n\n2. EARNING STORE CREDIT\n2.1 Members earn store credit equal to [X]% of the pre-tax subtotal of each qualifying purchase.\n2.2 Store credit is posted to the Member's account within 24 hours of a qualifying transaction.\n2.3 Store credit has no cash value and may not be transferred.\n\n3. REDEMPTION\n3.1 Store credit may be applied toward qualifying purchases once a minimum balance of $[X] has accumulated.\n3.2 Store credit is applied automatically at checkout by default.\n\n4. EXPIRATION\n4.1 Store credit expires after 365 consecutive days of account inactivity.\n\n5. PROGRAM MODIFICATIONS\n5.1 The Company may modify or terminate the Program at any time.\n\n6. GOVERNING LAW\nThese Terms are governed by the laws of [State/Jurisdiction].\n\n7. CONTACT\n[Business Name], [Address], [Email], [Phone]",
  },
]

export function getArchetype(programType: ProgramType): Archetype | null {
  // Map points_tiers to points archetype as closest match
  const lookupType = programType === 'points_tiers' ? 'points' : programType
  return ARCHETYPES.find((a) => a.program_type === lookupType) ?? ARCHETYPES[0]
}

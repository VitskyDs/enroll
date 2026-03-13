import type { ProgramType } from '@/types'

export interface Archetype {
  program_type: ProgramType
  industry: string
  program_name: string
  currency_name: string
  earn_rules: object
  redemption_rules: object
  reward_tiers: object[] | null
  tier_progression_rules: object | null
  points_expiry_rules: object
  bonus_rules: object[]
  referral_description: string
  brand_voice_summary: string
  llm_customization_hints: object
  terms_and_conditions: string
}

export const ARCHETYPES: Archetype[] = [
  {
    program_type: 'points',
    industry: 'food & beverage',
    program_name: 'Sip Rewards',
    currency_name: 'Sips',
    earn_rules: {
      base_rate: '1 Sip per $1 spent',
      qualifying_actions: [
        { action: 'purchase', rate: '1 Sip per $1', notes: 'rounds down to nearest dollar' },
        { action: 'account_signup', bonus_sips: 50, notes: 'one-time welcome bonus' },
        { action: 'birthday_month_purchase', multiplier: 2, notes: 'double Sips on any purchase in birthday month' },
        { action: 'review_submission', bonus_sips: 20, notes: 'one per customer lifetime' },
      ],
      minimum_spend_to_earn: 1.0,
    },
    redemption_rules: {
      minimum_to_redeem: 100,
      redemption_value: '100 Sips = $5 reward',
      redemption_rate_display: 'earn $5 for every $100 spent',
      redeemable_on: ['any purchase', 'in-store and online'],
      cannot_redeem_on: ['alcohol', 'gift cards'],
      partial_redemption_allowed: true,
      notes: 'reward issued as store credit applied at checkout',
    },
    reward_tiers: null,
    tier_progression_rules: null,
    points_expiry_rules: {
      expiry_policy: 'rolling',
      expires_after_inactivity_days: 180,
      warning_notification_days_before: 30,
      notes: 'inactivity = no purchase activity. expiry resets on any qualifying purchase.',
    },
    bonus_rules: [
      { trigger: 'double_points_day', multiplier: 2, frequency: 'once per month, merchant-defined date', stackable: false },
      { trigger: 'first_purchase', bonus_sips: 50, notes: 'applied automatically on first transaction post-signup' },
      { trigger: 'referral_friend_joins', bonus_sips: 30, notes: 'awarded when referred friend completes first purchase' },
    ],
    referral_description: 'share a personal referral link or code. earn 30 Sips when your friend signs up and makes their first purchase. your friend gets 20 Sips to start.',
    brand_voice_summary: 'warm, community-focused, and approachable. the program should feel like a thank-you from a local business, not a corporate scheme. use first-name messaging and celebrate milestones.',
    llm_customization_hints: {
      vary_by_industry: "adjust qualifying_actions to match what the business sells — a bakery might award bonus points on weekend purchases; a gym might award points for class check-ins",
      vary_by_goal: {
        acquire: 'increase welcome bonus and referral reward; lower minimum_to_redeem to show value faster',
        retain: 'add a streak bonus (e.g. 3 visits in a week = 2x points); tighten expiry to 90 days to drive urgency',
        revenue: 'add a spend-threshold bonus (e.g. earn 50 bonus Sips when total spend exceeds $200/month)',
      },
      vary_currency_name: "rename 'Sips' to something on-brand for the business — a bookshop might use 'Pages', a pet store might use 'Paws'",
      keep_fixed: [
        'base redemption rate (100 pts = $5 is a 5% return — adjust only if margin allows)',
        'partial redemption should stay true for ease of use',
      ],
    },
    terms_and_conditions: 'PROGRAM NAME REWARDS — TERMS AND CONDITIONS\n\nLast Updated: [DATE]\n\n1. PROGRAM OVERVIEW\n[Business Name] ("Company," "we," "us," or "our") operates the [Program Name] loyalty rewards program ("Program"). By enrolling in the Program, you ("Member," "you," or "your") agree to be bound by these Terms and Conditions ("Terms").\n\n2. ELIGIBILITY AND ENROLLMENT\n2.1 The Program is open to individuals who are 18 years of age or older.\n2.2 Enrollment requires a valid name and email address.\n2.3 One account is permitted per individual.\n\n3. EARNING [CURRENCY NAME]\n3.1 Members earn [X] [Currency Name] for every $1.00 spent on qualifying purchases.\n3.2 Bonus [Currency Name] may be awarded for account creation, birthday month purchases, qualifying referrals, and promotional events.\n3.3 [Currency Name] have no cash value and may not be transferred.\n\n4. REDEMPTION\n4.1 Members may redeem [Currency Name] once a minimum balance of [X] has accumulated.\n4.2 A redemption value of [X] [Currency Name] equals $[X] in store credit.\n\n5. EXPIRATION\n5.1 [Currency Name] expire after 180 consecutive days of account inactivity.\n5.2 The Company will notify Members 30 days prior to expiration.\n\n6. PROGRAM MODIFICATIONS\n6.1 The Company reserves the right to modify or terminate the Program at any time.\n\n7. GOVERNING LAW\nThese Terms shall be governed by the laws of [State/Jurisdiction].\n\n8. CONTACT\n[Business Name], [Address], [Email], [Phone].',
  },
  {
    program_type: 'tiered',
    industry: 'retail — specialty',
    program_name: 'The Inner Circle',
    currency_name: 'annual spend (no named points currency — tier is spend-based)',
    earn_rules: {
      base_rate: 'no points — tier status determined by cumulative annual spend',
      qualifying_actions: [
        { action: 'purchase', notes: 'all purchases count toward annual spend total' },
        { action: 'purchase_via_brand_credit_card', notes: 'if applicable: spend counts at 1.5x toward tier qualification' },
      ],
      spend_tracking_period: 'rolling 12 months',
      notes: 'customers are always aware of their spend-to-next-tier gap via app or receipt',
    },
    redemption_rules: {
      mechanism: 'perks are automatic and tier-based, not redeemed manually',
      notes: 'unlike points programs, customers do not redeem anything — benefits activate based on current tier. discounts apply at checkout automatically.',
    },
    reward_tiers: [
      {
        tier_name: 'Member',
        tier_rank: 1,
        qualification_threshold: '$0 — all enrolled customers',
        perks: [
          'birthday discount: 15% off one purchase in birthday month',
          'early access to sale events (24 hours before public)',
          'free standard shipping on orders over $75',
        ],
      },
      {
        tier_name: 'Insider',
        tier_rank: 2,
        qualification_threshold: '$500 annual spend',
        perks: [
          'everything in Member',
          '10% off every purchase',
          'free standard shipping on all orders (no minimum)',
          'exclusive insider-only product drops',
          'dedicated customer service line',
        ],
      },
      {
        tier_name: 'Icon',
        tier_rank: 3,
        qualification_threshold: '$1,500 annual spend',
        perks: [
          'everything in Insider',
          '15% off every purchase',
          'free expedited shipping on all orders',
          'quarterly gift with purchase (surprise product)',
          'invitation to private events and product previews',
          'personal stylist or product consultant access',
        ],
      },
    ],
    tier_progression_rules: {
      qualification_period: 'rolling 12 months',
      upgrade_timing: 'tier upgrades immediately when spend threshold is crossed',
      downgrade_policy: 'tier is re-evaluated annually. if spend drops below threshold, customer drops one tier (not to bottom). given a 90-day grace period after renewal date before downgrade takes effect.',
      downgrade_warning: 'notification sent 60 days before renewal date showing spend needed to maintain current tier',
      starting_tier: 'Member — all enrollees start here regardless of spend history',
    },
    points_expiry_rules: {
      expiry_policy: 'not applicable — this is a spend-based tier program with no points currency',
      tier_status_expiry: 'see tier_progression_rules.downgrade_policy',
    },
    bonus_rules: [
      { trigger: 'tier_upgrade', reward: 'one-time 20% off welcome discount at new tier', notes: 'applied automatically on first purchase after upgrade' },
      { trigger: 'anniversary_of_enrollment', reward: 'bonus gift or exclusive offer', frequency: 'annual' },
      { trigger: 'referral_friend_reaches_insider', reward: 'one free product or $25 credit', notes: 'rewards the referrer when the referred friend reaches Insider tier' },
    ],
    referral_description: 'refer a friend and earn a $25 store credit when they reach Insider status. your friend starts at Member with a 10% welcome discount on their first order.',
    brand_voice_summary: 'elevated, aspirational, and insider-feeling. the program should make customers feel recognized and chosen, not just discounted. language should be warm but polished.',
    llm_customization_hints: {
      vary_by_industry: {
        'hospitality & travel': 'replace spend thresholds with nights stayed or flights taken; replace product perks with room upgrades, late checkout, lounge access',
        'health & beauty': 'replace product drops with early access to new treatments or product lines; add consultation perks at top tier',
        'professional services': 'replace product perks with priority scheduling, dedicated account manager, reduced rates on premium services',
      },
      vary_by_goal: {
        acquire: "lower the Member→Insider threshold to make first upgrade feel achievable quickly; add a visible progress tracker in onboarding",
        retain: "tighten downgrade grace period; add a 'stay at your tier' spend nudge 60 days before renewal",
        revenue: 'widen the gap between Insider and Icon to stretch high-value customers further; add a spend incentive event mid-year',
      },
      vary_tier_names: "rename tiers to match brand identity — a spa might use 'Glow / Radiance / Luminous'; a wine shop might use 'Explorer / Connoisseur / Sommelier'",
      vary_threshold_amounts: 'calibrate thresholds to average order value — Icon tier should be reachable by roughly the top 10-15% of customers based on historical spend data',
      keep_fixed: [
        'downgrade grace period (90 days minimum — sudden downgrades cause churn)',
        'automatic upgrade timing — never make customers claim their tier upgrade manually',
      ],
    },
    terms_and_conditions: 'PROGRAM NAME MEMBERSHIP — TERMS AND CONDITIONS\n\nLast Updated: [DATE]\n\n1. PROGRAM OVERVIEW\n[Business Name] ("Company") operates [Program Name] ("Program"), a tiered membership program that rewards customers based on annual qualifying spend.\n\n2. TIER STRUCTURE\n2.1 Tier qualification is based on cumulative qualifying spend within a rolling 12-month period.\n2.2 Tier upgrades take effect immediately when spend threshold is crossed.\n2.3 A grace period of 90 days from the Renewal Date is provided before any downgrade takes effect.\n\n3. PROGRAM MODIFICATIONS\n3.1 The Company reserves the right to modify or terminate the Program at any time.\n\n4. GOVERNING LAW\nThese Terms are governed by the laws of [State/Jurisdiction].\n\n5. CONTACT\n[Business Name], [Address], [Email], [Phone]',
  },
  {
    program_type: 'cashback',
    industry: 'grocery & pharmacy',
    program_name: 'Cart Credit',
    currency_name: 'store credit (displayed as $ value, not points)',
    earn_rules: {
      base_rate: '2% back on every dollar spent',
      qualifying_actions: [
        { action: 'purchase', rate: '2% of transaction total', notes: 'calculated on pre-tax subtotal' },
        { action: 'purchase_own_brand_products', rate: '5% back', notes: 'higher rate on store-brand or house-label items' },
        { action: 'digital_coupon_activation', bonus_credit: 0.25, notes: 'small credit for engaging with the digital coupon system' },
      ],
      minimum_spend_to_earn: 5.0,
      credit_posting_delay: 'credit posts to account within 24 hours of purchase',
      notes: 'cashback is always displayed in dollar value, never converted to abstract points',
    },
    redemption_rules: {
      minimum_to_redeem: 5.0,
      redemption_method: 'applied automatically at checkout or manually via app toggle',
      auto_apply_default: true,
      redeemable_on: ['any in-store or online purchase'],
      cannot_redeem_on: ['alcohol where restricted by law', 'lottery tickets', 'gift cards'],
      partial_redemption_allowed: true,
      maximum_redemption_per_transaction: 'no cap — full balance can be applied to a single transaction',
      notes: 'customer can toggle auto-apply off in app settings if they prefer to save credit for larger purchases',
    },
    reward_tiers: null,
    tier_progression_rules: null,
    points_expiry_rules: {
      expiry_policy: 'rolling',
      expires_after_inactivity_days: 365,
      warning_notification_days_before: 45,
      notes: 'longer expiry window than points programs — cashback customers are price-sensitive and longer windows reduce frustration.',
    },
    bonus_rules: [
      { trigger: 'category_bonus_week', rate: '5% back on a rotating product category', frequency: 'monthly, merchant-defined', notes: 'drives category exploration.' },
      { trigger: 'spend_threshold_monthly', bonus_credit: 3.0, threshold: '$150 spent in calendar month', notes: 'small flat bonus for hitting a monthly spend milestone' },
      { trigger: 'first_purchase', bonus_credit: 5.0, notes: 'instant $5 credit on first qualifying purchase' },
      { trigger: 'referral_friend_first_purchase', bonus_credit: 5.0, notes: 'both referrer and new member receive $5 credit after friend\'s first purchase' },
    ],
    referral_description: "refer a friend and you both get $5 in store credit when they make their first purchase of $10 or more. there is no limit to how many friends you can refer.",
    brand_voice_summary: "straightforward, honest, and value-focused. never use jargon or gamification language. the program should communicate 'you save real money every time you shop here'.",
    llm_customization_hints: {
      vary_by_industry: {
        'e-commerce': 'increase base rate to 3-5% to compete with credit card cashback; add a higher rate for repeat category purchases',
        'fuel & automotive': 'tie bonus rate to fuel fill-up frequency; add a fleet or multi-vehicle account option',
        'financial services': 'frame as statement credit rather than store credit; integrate with card spend',
      },
      vary_by_goal: {
        acquire: 'lead with the first-purchase bonus ($5 or 10% back on first order) in all acquisition messaging',
        retain: "add the monthly spend threshold bonus and surface a 'you're $X away from your $3 bonus' nudge",
        revenue: 'increase the own-brand product rate (5%→8%) to shift basket composition toward higher-margin items',
      },
      vary_cashback_rate: '2% is sustainable at 30%+ GM. for lower-margin businesses, 1% base with targeted 5% category bonuses is safer',
      keep_fixed: [
        'always display value in dollars, never in points',
        'auto-apply default should stay true',
        'minimum redemption threshold should stay at $5 or below',
      ],
    },
    terms_and_conditions: 'PROGRAM NAME CREDIT — TERMS AND CONDITIONS\n\nLast Updated: [DATE]\n\n1. PROGRAM OVERVIEW\n[Business Name] ("Company") operates [Program Name] ("Program"), a cashback rewards program that returns a percentage of qualifying purchases as store credit.\n\n2. EARNING STORE CREDIT\n2.1 Members earn store credit equal to [X]% of the pre-tax subtotal of each qualifying purchase.\n2.2 Store credit is posted to the Member\'s account within 24 hours of a qualifying transaction.\n2.3 Store credit has no cash value and may not be transferred.\n\n3. REDEMPTION\n3.1 Store credit may be applied toward qualifying purchases once a minimum balance of $[X] has accumulated.\n3.2 Store credit is applied automatically at checkout by default.\n\n4. EXPIRATION\n4.1 Store credit expires after 365 consecutive days of account inactivity.\n\n5. PROGRAM MODIFICATIONS\n5.1 The Company may modify or terminate the Program at any time.\n\n6. GOVERNING LAW\nThese Terms are governed by the laws of [State/Jurisdiction].\n\n7. CONTACT\n[Business Name], [Address], [Email], [Phone]',
  },
]

export function getArchetype(programType: ProgramType): Archetype | null {
  // Map points_tiers to points archetype as closest match
  const lookupType = programType === 'points_tiers' ? 'points' : programType
  return ARCHETYPES.find((a) => a.program_type === lookupType) ?? ARCHETYPES[0]
}

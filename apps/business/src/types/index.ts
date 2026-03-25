// Matches DB column names

export type BusinessCategory =
  | 'salon'
  | 'spa'
  | 'barbershop'
  | 'clinic'
  | 'fitness'
  | 'wellness'
  | 'other'

/** Legacy goal type — kept for DB compat on businesses.goal column */
export type LoyaltyGoal = 'retention' | 'referrals' | 'frequency'

export interface Service {
  id: string
  name: string
  price_cents: number | null
  subscription_price_cents: number | null
  description?: string
  duration_minutes?: number | null
  category?: string
  status?: 'active' | 'draft' | 'inactive'
  image_url?: string | null
  note?: string | null
  points_value?: number | null
  business_id?: string
  created_at?: string
}

export interface BusinessProfile {
  id: string
  name: string
  category: BusinessCategory
  website_url: string | null
  services: Service[]
  goal: LoyaltyGoal
  created_at: string
}

// ---------------------------------------------------------------------------
// Onboarding schema types (from onboarding_schema.json)
// ---------------------------------------------------------------------------

export type OfferingType = 'product' | 'service' | 'both'
export type PrimaryGoal = 'acquire' | 'retain' | 'revenue'
export type VisitFrequency = 'high' | 'medium' | 'low'
export type SpendVariance = 'consistent' | 'varied'
export type ProgramType = 'points' | 'tiered' | 'cashback' | 'punch_card' | 'coalition' | 'points_tiers'

export interface BrandPersonality {
  tone: 'playful' | 'warm' | 'premium' | 'clinical' | 'irreverent' | 'minimalist' | 'bold' | 'community-driven'
  identity_keywords: string[]
  price_positioning: 'budget' | 'mid-market' | 'premium' | 'luxury'
  customer_relationship_model: 'transactional' | 'community' | 'membership' | 'expert-to-customer'
}

export interface BusinessOnboardingData {
  business_name: string
  website?: string
  services_and_products: string
  offering_type: OfferingType
  industry: string
  brand_personality: BrandPersonality | null
  primary_goal: PrimaryGoal
  visit_frequency: VisitFrequency
  spend_variance: SpendVariance
}

export interface ProgramRecommendation {
  program_type: ProgramType
  confidence: 'high' | 'medium' | 'low'
  rationale: string
}

// ---------------------------------------------------------------------------
// Loyalty program (new schema matching loyalty_program_archetypes.json)
// ---------------------------------------------------------------------------

export interface LoyaltyProgram {
  id: string
  business_id: string
  program_type: ProgramType
  program_type_reason: string
  industry: string
  program_name: string
  program_name_explanation: string
  currency_name: string
  currency_name_explanation: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  earn_rules: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redemption_rules: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reward_tiers: Record<string, any>[] | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tier_progression_rules: Record<string, any> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  points_expiry_rules: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bonus_rule: Record<string, any>
  program_purpose: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  referral_rules: Record<string, any>
  brand_voice_summary: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  llm_customization_hints: Record<string, any>
  terms_and_conditions: string
  created_at: string
}

// Products

export type ProductKind = 'physical' | 'digital' | 'service_addon'
export type ProductStatus = 'active' | 'draft' | 'archived'

export interface ProductOption {
  id: string
  product_id: string
  name: string
  position: number
  values: string[]
}

export interface ProductVariant {
  id: string
  created_at: string
  product_id: string
  name: string
  sku: string | null
  barcode: string | null
  price_cents: number | null       // null = inherit from parent
  compare_at_price_cents: number | null
  cost_cents: number | null
  inventory_quantity: number | null
  option1_value: string | null
  option2_value: string | null
  option3_value: string | null
  image_url: string | null
  sort_order: number
  subscription_price_cents: number | null  // null = inherit from parent / no subscription
}

export interface Product {
  id: string
  created_at: string
  updated_at: string
  business_id: string
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  category: string | null
  tags: string[]
  kind: ProductKind
  price_cents: number
  compare_at_price_cents: number | null
  cost_cents: number | null
  track_inventory: boolean
  inventory_quantity: number | null
  low_stock_threshold: number | null
  has_variants: boolean
  image_urls: string[]
  status: ProductStatus
  featured: boolean
  sort_order: number
  points_eligible: boolean
  points_override: number | null
  subscription_price_cents: number | null  // null = no subscription option
}

// ---------------------------------------------------------------------------
// Onboarding state machine
// ---------------------------------------------------------------------------

export type OnboardingStep =
  // Phase 1 — Your business
  | 'greeting'
  | 'collect_url_or_name'
  | 'searching'
  | 'extracting'
  | 'confirm_services'
  | 'manual_entry'
  // Phase 2 — Program inputs
  | 'collect_primary_goal'
  | 'collect_visit_frequency'
  | 'collect_spend_variance'
  // Phase 3 — Recommendation (used in ChatShell context)
  | 'show_recommendation'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  widget?:
    | 'url_selector'
    | 'service_selector'
    | 'service_actions'
    | 'primary_goal_selector'
    | 'visit_frequency_selector'
    | 'spend_variance_selector'
}

export interface OnboardingState {
  step: OnboardingStep
  businessName: string
  businessCategory: BusinessCategory | null
  websiteUrl: string
  services: Service[]
  selectedServiceIds: Set<string>
  messages: ChatMessage[]
  isTyping: boolean
}

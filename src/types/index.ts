// Matches DB column names

export type BusinessCategory =
  | 'salon'
  | 'spa'
  | 'barbershop'
  | 'clinic'
  | 'fitness'
  | 'wellness'
  | 'other'

export type LoyaltyGoal = 'retention' | 'referrals' | 'frequency'

export interface Service {
  id: string
  name: string
  price_cents: number | null
  description?: string
  duration_minutes?: number | null
  category?: string
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

export interface EarnRule {
  label: string
  points_per_dollar: number | null
  points_per_visit: number | null
  description: string
}

export interface RewardTier {
  name: string
  points_required: number
  reward_description: string
}

export interface BonusRule {
  label: string
  description: string
  multiplier: number | null
}

export interface LoyaltyProgram {
  id: string
  business_id: string
  program_name: string
  currency_name: string
  earn_rules: EarnRule[]
  reward_tiers: RewardTier[]
  bonus_rules: BonusRule[]
  referral_description: string
  brand_voice_summary: string
  created_at: string
}

// Onboarding state machine

export type OnboardingStep =
  | 'greeting'
  | 'collect_name'
  | 'collect_type'
  | 'collect_website'
  | 'crawling'
  | 'extracting'
  | 'confirm_services'
  | 'collect_goal'
  | 'generating'
  | 'saving'
  | 'done'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  widget?: 'service_selector' | 'goal_selector'
}

export interface OnboardingState {
  step: OnboardingStep
  businessName: string
  businessCategory: BusinessCategory | null
  websiteUrl: string
  services: Service[]
  selectedServiceIds: Set<string>
  goal: LoyaltyGoal | null
  programDraft: LoyaltyProgram | null
  messages: ChatMessage[]
  isTyping: boolean
}

import { supabase } from '@/lib/supabase'
import type { BusinessOnboardingData, LoyaltyProgram, Service } from '@/types'

/**
 * Persists a completed onboarding session to Supabase:
 * 1. Insert businesses row → capture id
 * 2. Batch insert services rows with business_id
 * 3. Insert loyalty_programs row
 * 4. Update businesses.loyalty_program_id with the new program id
 */
export async function saveToSupabase(
  onboardingData: BusinessOnboardingData,
  services: Service[],
  program: LoyaltyProgram,
): Promise<{ business_id: string; program_id: string }> {
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .insert({
      name: onboardingData.business_name,
      website_url: onboardingData.website || null,
      offering_type: onboardingData.offering_type,
      industry: onboardingData.industry,
      brand_personality: onboardingData.brand_personality,
      primary_goal: onboardingData.primary_goal,
      visit_frequency: onboardingData.visit_frequency,
      spend_variance: onboardingData.spend_variance,
      // Legacy columns — set defaults for DB compat
      category: 'other',
      goal: onboardingData.primary_goal === 'acquire' ? 'referrals' : onboardingData.primary_goal === 'retain' ? 'retention' : 'frequency',
    })
    .select('id')
    .single()

  if (bizError) throw new Error(`Failed to save business: ${bizError.message}`)

  const business_id = business.id

  if (services.length > 0) {
    const { error: svcError } = await supabase.from('services').insert(
      services.map((s) => ({
        business_id,
        name: s.name,
        price_cents: s.price_cents,
        description: s.description ?? null,
        duration_minutes: s.duration_minutes ?? null,
        category: s.category ?? null,
        source: 'ai_extracted',
        status: 'draft',
      })),
    )
    if (svcError) console.error('Failed to save services:', svcError)
  }

  const { data: savedProgram, error: progError } = await supabase
    .from('loyalty_programs')
    .insert({
      business_id,
      program_type: program.program_type,
      program_type_reason: program.program_type_reason,
      industry: program.industry,
      program_name: program.program_name,
      program_name_explanation: program.program_name_explanation,
      currency_name: program.currency_name,
      currency_name_explanation: program.currency_name_explanation,
      earn_rules: program.earn_rules,
      redemption_rules: program.redemption_rules,
      reward_tiers: program.reward_tiers,
      tier_progression_rules: program.tier_progression_rules,
      points_expiry_rules: program.points_expiry_rules,
      bonus_rule: program.bonus_rule,
      program_purpose: program.program_purpose,
      referral_rules: program.referral_rules,
      brand_voice_summary: program.brand_voice_summary,
      llm_customization_hints: program.llm_customization_hints,
      terms_and_conditions: program.terms_and_conditions,
      ai_generated: true,
    })
    .select('id')
    .single()

  if (progError) throw new Error(`Failed to save program: ${progError.message}`)

  const program_id = savedProgram.id

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ loyalty_program_id: program_id })
    .eq('id', business_id)

  if (updateError) console.error('Failed to link program to business:', updateError)

  return { business_id, program_id }
}

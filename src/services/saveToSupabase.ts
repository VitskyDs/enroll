import { supabase } from '@/lib/supabase'
import type { BusinessCategory, LoyaltyGoal, LoyaltyProgram, Service } from '@/types'

/**
 * Persists a completed onboarding session to Supabase:
 * 1. Insert businesses row → capture id
 * 2. Batch insert services rows with business_id
 * 3. Insert loyalty_programs row
 * 4. Update businesses.loyalty_program_id with the new program id
 */
export async function saveToSupabase(
  businessName: string,
  businessCategory: BusinessCategory,
  websiteUrl: string,
  goal: LoyaltyGoal,
  services: Service[],
  program: LoyaltyProgram,
): Promise<{ business_id: string; program_id: string }> {
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .insert({ name: businessName, category: businessCategory, website_url: websiteUrl || null, goal })
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
      program_name: program.program_name,
      currency_name: program.currency_name,
      earn_rules: program.earn_rules,
      reward_tiers: program.reward_tiers,
      bonus_rules: program.bonus_rules,
      referral_description: program.referral_description,
      brand_voice_summary: program.brand_voice_summary,
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

import { supabase } from '@/lib/supabase'

const DEV_EMAIL = 'robert.enroll@gmail.com'

const DUMMY_BUSINESS = {
  name: 'Lumière Studio',
  website_url: 'https://lumierestudio.com',
  offering_type: 'service',
  industry: 'salon',
  brand_personality: {
    tone: 'sophisticated',
    identity_keywords: ['luxury', 'modern', 'elevated'],
    price_positioning: 'premium',
    customer_relationship_model: 'expert',
  },
  primary_goal: 'retention',
  visit_frequency: 'monthly',
  spend_variance: 'high',
}

const DUMMY_SERVICES = [
  { name: 'Signature cut & style', price_cents: 8500, duration_minutes: 60, category: 'Haircut', status: 'active' },
  { name: 'Full color & highlights', price_cents: 18000, duration_minutes: 150, category: 'Color', status: 'active' },
  { name: 'Blowout & finish', price_cents: 5500, duration_minutes: 45, category: 'Styling', status: 'active' },
  { name: 'Deep conditioning treatment', price_cents: 4500, duration_minutes: 30, category: 'Treatment', status: 'draft' },
]

const DUMMY_PROGRAM = {
  program_type: 'points_tiers',
  program_type_reason: 'Points with tiers incentivize repeat visits and aspirational upgrades.',
  industry: 'salon',
  program_name: 'Lumière Rewards',
  program_name_explanation: 'Evokes the studio brand while feeling aspirational.',
  currency_name: 'Lumière Points',
  currency_name_explanation: 'Reinforces the premium brand identity on every transaction.',
  earn_rules: {
    dollar_spend: { points_per_dollar: 10 },
  },
  redemption_rules: {
    min_points: 200,
    redemption_rate: { points: 200, value_cents: 500 },
  },
  reward_tiers: [
    { name: 'Pearl', min_points: 0, benefits: ['Priority booking'] },
    { name: 'Gold', min_points: 500, benefits: ['Priority booking', '10% off retail products'] },
    { name: 'Diamond', min_points: 1500, benefits: ['Priority booking', '15% off retail', 'Complimentary treatment annually'] },
  ],
  tier_progression_rules: {
    evaluation_period: 'rolling_12_months',
    downgrade: true,
  },
  points_expiry_rules: {
    months_inactive: 12,
    warning_days: 30,
  },
  bonus_rule: {
    trigger: 'birthday',
    bonus_points: 200,
    description: '200 bonus points credited in your birthday month',
  },
  referral_rules: {
    referrer_reward: 150,
    referee_reward: 100,
    description: 'Earn 150 points when a friend books their first visit',
  },
  brand_voice_summary:
    'Sophisticated warmth — we celebrate your beauty journey with quiet confidence and genuine care.',
  program_purpose:
    'Retain loyal guests and deepen the relationship through recognition and meaningful reward.',
  terms_and_conditions:
    'Points expire after 12 months of inactivity. Tier status is evaluated on a rolling 12-month basis. Lumière Studio reserves the right to modify the program with 30 days notice.',
  llm_customization_hints: null,
  ai_generated: false,
}

const DUMMY_CUSTOMERS = [
  {
    first_name: 'Emma',
    last_name: 'Johnson',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    phone: null,
    points: 450,
    tier: 'Pearl',
    total_spend: 35000,
    status: 'active',
  },
  {
    first_name: 'Marcus',
    last_name: 'Chen',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    phone: '+1 415 555 0182',
    points: 1240,
    tier: 'Gold',
    total_spend: 82000,
    status: 'active',
  },
  {
    first_name: 'Sofia',
    last_name: 'Rodriguez',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@example.com',
    phone: null,
    points: 2100,
    tier: 'Diamond',
    total_spend: 154000,
    status: 'active',
  },
  {
    first_name: 'James',
    last_name: 'Kim',
    name: 'James Kim',
    email: null,
    phone: '+1 650 555 0134',
    points: 50,
    tier: 'Pearl',
    total_spend: 4500,
    status: 'inactive',
  },
]

export async function devSeed(password: string): Promise<void> {
  // 1. Sign out first to clear any stale session that would block signInWithPassword,
  //    then sign in as the dev test account.
  await supabase.auth.signOut()
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: DEV_EMAIL,
    password,
  })
  if (authError) throw new Error(`Sign-in failed: ${authError.message}`)

  const userId = authData.user.id

  // 2. Check for existing fully-seeded business (business + loyalty program)
  const { data: existing } = await supabase
    .from('businesses')
    .select('id, loyalty_program_id')
    .eq('owner_id', userId)
    .maybeSingle()

  if (existing?.loyalty_program_id) {
    // Already fully seeded — nothing to do
    return
  }

  // Use orphaned business from a previous partial run, or create a new one
  let business_id: string
  if (existing) {
    business_id = existing.id
  } else {
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({ owner_id: userId, ...DUMMY_BUSINESS })
      .select('id')
      .single()
    if (bizError) throw new Error(`Failed to create business: ${bizError.message}`)
    business_id = business.id
  }

  // 3. Insert services (skip if already present from a previous partial run)
  const { data: existingServices } = await supabase
    .from('services')
    .select('id')
    .eq('business_id', business_id)
    .limit(1)

  if (!existingServices?.length) {
    const { error: svcError } = await supabase.from('services').insert(
      DUMMY_SERVICES.map(s => ({ ...s, business_id, source: 'ai_extracted', description: null })),
    )
    if (svcError) console.error('Failed to seed services:', svcError.message)
  }

  // 4. Insert loyalty program
  const { data: program, error: progError } = await supabase
    .from('loyalty_programs')
    .insert({ ...DUMMY_PROGRAM, business_id })
    .select('id')
    .single()

  if (progError) throw new Error(`Failed to create program: ${progError.message}`)

  // 5. Link program to business
  await supabase
    .from('businesses')
    .update({ loyalty_program_id: program.id })
    .eq('id', business_id)

  // 6. Insert customers
  const now = new Date()
  const { error: custError } = await supabase.from('customers').insert(
    DUMMY_CUSTOMERS.map((c, i) => ({
      ...c,
      business_id,
      joined_at: new Date(now.getTime() - (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
  )
  if (custError) console.error('Failed to seed customers:', custError)
}

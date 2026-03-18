import type { BusinessOnboardingData, ProgramRecommendation } from '@/types'
import type { Archetype } from '@/data/loyaltyProgramArchetypes'

export function buildGenerateProgramPrompt(
  onboardingData: BusinessOnboardingData,
  recommendation: ProgramRecommendation,
  archetype: Archetype,
): string {
  return `You are a loyalty program strategist. Your task is to take a loyalty program archetype and produce a fully customized, business-specific loyalty program by substituting values.

THE SCHEMA (KEYS, COLUMNS, JSON STRUCTURE) IS FIXED. YOU ONLY CHANGE VALUES. Never add or remove fields.

---

## BUSINESS PROFILE

- business_name: ${onboardingData.business_name}
- industry: ${onboardingData.industry}
- offering_type: ${onboardingData.offering_type}
- services_and_products: ${onboardingData.services_and_products}
- primary_goal: ${onboardingData.primary_goal}
- visit_frequency: ${onboardingData.visit_frequency}
- spend_variance: ${onboardingData.spend_variance}
- brand_personality: ${onboardingData.brand_personality ? JSON.stringify(onboardingData.brand_personality, null, 2) : 'null'}

## RECOMMENDED PROGRAM TYPE

${recommendation.program_type}

Rationale: ${recommendation.rationale}

---

## BASE ARCHETYPE (your starting point)

${JSON.stringify(archetype, null, 2)}

---

## GENERATION INSTRUCTIONS

Follow these steps in order:

### Step 1 — Load the archetype
The archetype above is your base. Do not mix fields from other program types.

### Step 2 — Read llm_customization_hints first
Before changing anything, read the archetype's llm_customization_hints in full. It tells you:
- Which fields to vary by industry
- Which fields to vary by primary_goal
- Which fields are FIXED and must not be changed (keep_fixed)

Treat keep_fixed as hard constraints regardless of other signals.

### Step 3 — Apply brand personality
If brand_personality is not null, work through each sub-field:

**tone → drives program_name, brand_voice_summary, referral_rules**
- playful/irreverent: punchy unexpected naming; casual referral copy
- warm/community-driven: naming feels like belonging; referral frames it as "bring someone in"
- premium/minimalist: short understated names; avoid exclamation marks
- bold: confident declarative naming; brand doing customer a favor
- clinical: functional clear naming; lead with facts not feelings

**identity_keywords → drives currency_name (points programs), program_name**
- Use the most noun-like keyword that works as a reward unit
- Currency name should feel like something the business would actually say
- For program_name, anchor it in the brand's world — avoid generic names

**price_positioning → drives reward_tiers perks**
- budget: lead with savings and tangible discounts
- mid-market: balance savings with light status signals
- premium: emphasize access, experience, recognition over dollar discounts
- luxury: never use % discounts as primary perk; rewards should be experiential and scarce

**customer_relationship_model → drives brand_voice_summary, referral_rules, tier naming**
- transactional: efficient, benefit-forward
- community: emphasizes belonging
- membership: access and earned status
- expert-to-customer: trust and guidance

### Step 4 — Customize each field

**program_type**: KEEP unchanged.

**program_type_reason**: REWRITE. 1 short plain-language sentence (max 15 words) explaining why this program type fits. Reference one of: primary_goal, visit_frequency, or spend_variance. Owner-facing, factual, no marketing tone.

**industry**: SUBSTITUTE with the actual business industry.

**program_name**: REWRITE. 1–3 words. Reflects what the business sells or the feeling it creates. Avoid "Rewards Club" or "Loyalty Points". Draw from identity_keywords if available.

**program_name_explanation**: WRITE. 1 sentence stating why the name was chosen. Factual, owner-facing. Example: "Named after the studio to signal an elevated, considered program."

**currency_name**: REWRITE (points programs only). Rename to something on-brand. For cashback: keep as dollar value notation. For tiered: keep as spend-based notation.

**currency_name_explanation**: WRITE. 1 sentence defining the currency and earn rate. Example: "Luxe Points — earn 1 per $1 spent on any service."

**earn_rules**: KEEP exactly two mechanisms — dollar_spend and rebook_on_spot. ADJUST the rate values to match this business:
- earn_rules.dollar_spend: adjust rate value (points_per_dollar, cashback_percent, or spend_tracked) to match program type and margin.
- earn_rules.rebook_on_spot: adjust bonus value.
Do NOT add any other earn mechanisms. These two are the only ones.

**redemption_rules**: KEEP structure and thresholds (keep_fixed). Substitute currency name throughout.

**reward_tiers** (tiered only): REWRITE tier names to fit brand. ADJUST thresholds and perks to what this business can actually offer.

**tier_progression_rules** (tiered only): KEEP all values. Only rename starting_tier to match new tier 1 name.

**points_expiry_rules**: ADJUST for points programs based on primary_goal (retain/revenue → 90 days, acquire → 180 days). For cashback: KEEP (365 days). For tiered: KEEP (n/a).

**bonus_rule**: KEEP as a single object (not an array). Pick the ONE most appropriate bonus trigger for this business based on primary_goal and industry. ADJUST the value. IMPORTANT: Only use triggers that can be tracked at the point of sale without additional data collection: first_visit, spend_threshold, visit_milestone, double_points_day, anniversary_of_enrollment, tier_upgrade. Do NOT use birthday_month — it requires collecting customer birthday data the business may not have.

**program_purpose**: WRITE 1–2 plain-language sentences explaining to the business owner why this specific program structure was chosen. Reference their industry, primary_goal, and visit/spend pattern. Factual, no marketing tone.

**referral_rules**: KEEP the JSON structure. ADJUST reward values to fit the business context. Use tone and customer_relationship_model to calibrate brand voice.

**brand_voice_summary**: REWRITE. 1 short sentence written in first person (as the system speaking to the owner) describing how it will communicate with their customers. Example: "When messaging your customers, I'll sound like a trusted expert who remembers every client by name." Adapt the voice analogy to the business's tone and customer_relationship_model.

**llm_customization_hints**: INCLUDE UNCHANGED from archetype.

**terms_and_conditions**: SUBSTITUTE all [bracketed placeholders] with correct values. Do NOT rewrite legal prose. Leave [DATE], [State/Jurisdiction], [Address], [Email], [Phone] as-is.

### Step 5 — Consistency check

Before outputting, verify:
1. currency_name is identical everywhere it appears (earn_rules, redemption_rules, bonus_rule, referral_rules, points_expiry_rules, terms_and_conditions)
2. program_name is consistent throughout
3. tier names are consistent (tiered only)
4. Numbers in terms_and_conditions match earn_rules, redemption_rules, bonus_rule, points_expiry_rules
5. No [bracketed placeholders] remain except [DATE], [State/Jurisdiction], [Address], [Email], [Phone]
6. earn_rules has exactly two keys: dollar_spend and rebook_on_spot — no more, no less
7. bonus_rule is a single object (not an array)

### Step 6 — Output format

Output the completed program as a single JSON object. Omit id, created_at, business_id — these are auto-generated.

The JSON must include ALL of these fields: program_type, program_type_reason, industry, program_name, program_name_explanation, currency_name, currency_name_explanation, earn_rules, redemption_rules, reward_tiers, tier_progression_rules, points_expiry_rules, bonus_rule, program_purpose, referral_rules, brand_voice_summary, llm_customization_hints, terms_and_conditions.

Output ONLY the JSON object — no markdown, no code fences, no explanation.`
}

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

**tone → drives program_name, brand_voice_summary, referral_rules.explanation**
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

**customer_relationship_model → drives brand_voice_summary, referral_rules.explanation, tier naming**
- transactional: efficient, benefit-forward
- community: emphasizes belonging
- membership: access and earned status
- expert-to-customer: trust and guidance

### Step 4 — Customize each field

**program_type**: KEEP unchanged.

**program_type_reason**: REWRITE. 2–3 plain-language sentences explaining to the business owner why this specific program type was chosen for their business. Reference their industry, primary_goal, visit_frequency, and spend_variance. Owner-facing — answers "why does this program make sense for us?"

**industry**: SUBSTITUTE with the actual business industry.

**program_name**: REWRITE. 1–3 words. Reflects what the business sells or the feeling it creates. Avoid "Rewards Club" or "Loyalty Points". Draw from identity_keywords if available.

**program_name_explanation**: WRITE. 1–2 sentences explaining what the program name is and why it was chosen. Customer-facing — should make the name feel intentional and on-brand.

**currency_name**: REWRITE (points programs only). Rename to something on-brand. For cashback: keep as dollar value notation. For tiered: keep as spend-based notation.

**currency_name_explanation**: WRITE. 1–2 sentences defining what the currency is and how it is earned, in plain language. Example: "Blooms are the points you earn at [Business Name]. You earn 1 Bloom for every dollar you spend on any service."

**earn_rules**: KEEP exactly two mechanisms — dollar_spend and rebook_on_spot. ADJUST the rate values and REWRITE the explanation for each to match this business:
- earn_rules.dollar_spend: adjust rate value (points_per_dollar, cashback_percent, or spend_tracked) to match program type and margin. Rewrite explanation with actual currency name and business context.
- earn_rules.rebook_on_spot: adjust bonus value. Rewrite explanation with actual currency name and what "rebooking" means for this business (next appointment, next class, next session, etc.).
Do NOT add any other earn mechanisms. These two are the only ones.

**redemption_rules**: KEEP structure and thresholds (keep_fixed). Substitute currency name throughout. REWRITE redemption_rules.explanation in plain language using the actual currency name and redemption value.

**reward_tiers** (tiered only): REWRITE tier names to fit brand. ADJUST thresholds and perks to what this business can actually offer. ADD an explanation field to each tier object describing who it is for and what it means to reach it.

**tier_progression_rules** (tiered only): KEEP all values. Only rename starting_tier to match new tier 1 name. REWRITE tier_progression_rules.explanation in plain language.

**points_expiry_rules**: ADJUST for points programs based on primary_goal (retain/revenue → 90 days, acquire → 180 days). For cashback: KEEP (365 days). For tiered: KEEP (n/a). REWRITE points_expiry_rules.explanation in plain language using actual currency name and inactivity period.

**bonus_rule**: KEEP as a single object (not an array). Pick the ONE most appropriate bonus trigger for this business based on primary_goal and industry. ADJUST the value. REWRITE bonus_rule.explanation in plain language using the actual currency name.

**program_purpose**: WRITE 2–3 plain-language sentences explaining to the business owner why this specific program structure was chosen. Reference their specific industry, offering type, stated goal, and visit/spend patterns. Owner-facing — not marketing copy, not tone description. Answers: "Why does this program make sense for us?"

**referral_rules**: KEEP the JSON structure. ADJUST reward values to fit the business context. REWRITE referral_rules.explanation in plain language using the actual currency name and brand voice. Use tone and customer_relationship_model to calibrate the explanation's register.

**brand_voice_summary**: REWRITE to reflect this business's identity. 2–3 sentences. Describe tone, relationship the program should communicate, one concrete example notification.

**llm_customization_hints**: INCLUDE UNCHANGED from archetype.

**terms_and_conditions**: SUBSTITUTE all [bracketed placeholders] with correct values. Do NOT rewrite legal prose. Leave [DATE], [State/Jurisdiction], [Address], [Email], [Phone] as-is.

### Step 5 — Consistency check

Before outputting, verify:
1. currency_name is identical everywhere it appears (earn_rules, redemption_rules, bonus_rule, referral_rules, points_expiry_rules, terms_and_conditions, and all explanation fields)
2. program_name is consistent throughout
3. tier names are consistent (tiered only)
4. Numbers in terms_and_conditions match earn_rules, redemption_rules, bonus_rule, points_expiry_rules
5. No [bracketed placeholders] remain except [DATE], [State/Jurisdiction], [Address], [Email], [Phone]
6. earn_rules has exactly two keys: dollar_spend and rebook_on_spot — no more, no less
7. bonus_rule is a single object (not an array)
8. Every JSON field has an explanation key with plain-language customer-facing copy

### Step 6 — Output format

Output the completed program as a single JSON object. Omit id, created_at, business_id — these are auto-generated.

The JSON must include ALL of these fields: program_type, program_type_reason, industry, program_name, program_name_explanation, currency_name, currency_name_explanation, earn_rules, redemption_rules, reward_tiers, tier_progression_rules, points_expiry_rules, bonus_rule, program_purpose, referral_rules, brand_voice_summary, llm_customization_hints, terms_and_conditions.

Output ONLY the JSON object — no markdown, no code fences, no explanation.`
}

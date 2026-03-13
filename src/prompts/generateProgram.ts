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

**tone → drives program_name, brand_voice_summary, referral_description**
- playful/irreverent: punchy unexpected naming; casual referral copy
- warm/community-driven: naming feels like belonging; referral frames it as "bring someone in"
- premium/minimalist: short understated names; avoid exclamation marks
- bold: confident declarative naming; brand doing customer a favor
- clinical: functional clear naming; lead with facts not feelings

**identity_keywords → drives currency_name (points programs), program_name**
- Use the most noun-like keyword that works as a reward unit
- Currency name should feel like something the business would actually say
- For program_name, anchor it in the brand's world — avoid generic names

**price_positioning → drives reward_tiers perks, bonus_rules framing**
- budget: lead with savings and tangible discounts
- mid-market: balance savings with light status signals
- premium: emphasize access, experience, recognition over dollar discounts
- luxury: never use % discounts as primary perk; rewards should be experiential and scarce

**customer_relationship_model → drives brand_voice_summary, referral_description, tier naming**
- transactional: efficient, benefit-forward. "share your code, you both save."
- community: emphasizes belonging. "bring a friend into the fold."
- membership: access and earned status. "invite someone you think belongs here."
- expert-to-customer: trust and guidance. "recommend us to someone who'd benefit."

### Step 4 — Customize each field

**program_type**: KEEP unchanged.

**industry**: SUBSTITUTE with the actual business industry from the profile.

**program_name**: REWRITE. 1-3 words. Reflects what the business sells or the feeling it creates. Avoid "Rewards Club" or "Loyalty Points". Draw from identity_keywords if available.

**currency_name**: REWRITE (points programs only). Rename to something on-brand. For cashback: keep as dollar value. For tiered: keep as spend-based notation.

**earn_rules**: ADJUST rates and SUBSTITUTE qualifying actions to match this business's offering type. A service business earns on appointments. A gym earns on class check-ins. Keep welcome bonus and birthday bonus mechanics.

**redemption_rules**: KEEP structure and thresholds (keep_fixed). Substitute currency name throughout.

**reward_tiers** (tiered only): REWRITE tier names to fit brand. ADJUST thresholds and perks to what this business can actually offer.

**tier_progression_rules** (tiered only): KEEP all values. Only rename starting_tier to match new tier 1 name.

**points_expiry_rules**: ADJUST for points programs based on primary_goal:
- retain or revenue goal: tighten to 90 days
- acquire goal: keep at 180 days
For cashback: KEEP (365 days). For tiered: KEEP (n/a).

**bonus_rules**: ADJUST amounts based on primary_goal. REWRITE trigger labels to use new currency name. Keep all trigger types present.

**referral_description**: REWRITE in plain language using new currency name and brand voice. Use tone and customer_relationship_model to calibrate.

**brand_voice_summary**: REWRITE to reflect this business's identity. 2-3 sentences. Describe tone, relationship the program should communicate, one concrete example notification.

**llm_customization_hints**: INCLUDE UNCHANGED from archetype.

**terms_and_conditions**: SUBSTITUTE all [bracketed placeholders] with correct values. Do NOT rewrite legal prose. Leave [DATE], [State/Jurisdiction], [Address], [Email], [Phone] as-is.

### Step 5 — Consistency check

Before outputting, verify:
1. currency_name is identical everywhere it appears
2. program_name is consistent throughout
3. tier names are consistent (tiered only)
4. Numbers in terms_and_conditions match earn_rules, redemption_rules, bonus_rules, points_expiry_rules
5. No [bracketed placeholders] remain except [DATE], [State/Jurisdiction], [Address], [Email], [Phone]

### Step 6 — Output format

Output the completed program as a single JSON object. Omit id, created_at, business_id — these are auto-generated.

The JSON must include ALL of these fields: program_type, industry, program_name, currency_name, earn_rules, redemption_rules, reward_tiers, tier_progression_rules, points_expiry_rules, bonus_rules, referral_description, brand_voice_summary, llm_customization_hints, terms_and_conditions.

Output ONLY the JSON object — no markdown, no code fences, no explanation.`
}

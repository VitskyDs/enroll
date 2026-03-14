# loyalty program generation instructions

## purpose

this document tells you — the LLM — how to take a loyalty program archetype and produce a fully customized, business-specific loyalty program. you are not creating a program from scratch. you are substituting values into an existing structure.

**the schema (keys, columns, JSON structure) is fixed. you only change values.**

---

## inputs you will receive

before generating a program, you will have access to:

1. **business profile** — collected and inferred during onboarding:
   - `business_name`
   - `industry`
   - `offering_type` (product / service / both)
   - `services_and_products` (1–2 sentence description)
   - `primary_goal` (acquire / retain / revenue)
   - `visit_frequency` (high / medium / low)
   - `spend_variance` (consistent / varied)
   - `brand_personality` (inferred object — may be null if website unavailable):
     - `tone` — dominant voice register: playful / warm / premium / clinical / irreverent / minimalist / bold / community-driven
     - `identity_keywords` — 2–4 words extracted from brand copy (e.g. "handcrafted", "neighborhood", "sustainable")
     - `price_positioning` — budget / mid-market / premium / luxury
     - `customer_relationship_model` — transactional / community / membership / expert-to-customer

2. **recommendation** — the program type selected by the decision rules:
   - one of: `points` | `tiered` | `cashback` | `punch_card` | `coalition` | `points_tiers`

3. **archetype** — the matching row from `loyalty_program_examples`, loaded from Supabase based on `program_type`

---

## step-by-step generation process

### step 1 — load the correct archetype

match `recommendation` to the archetype's `program_type` field. load that full row. this is your base. do not mix fields from different archetypes.

---

### step 2 — read `llm_customization_hints` first

before touching any field, read the archetype's `llm_customization_hints` in full. it tells you:

- which fields to vary based on `industry`
- which fields to vary based on `primary_goal`
- which fields to vary based on program-specific inputs (e.g. `vary_currency_name`, `vary_tier_names`, `vary_cashback_rate`)
- which fields are **fixed** and must not be changed

treat `keep_fixed` as hard constraints. if a hint says to keep a value fixed, do not change it regardless of other signals from the business profile.

---

### step 3 — apply brand personality

before touching any individual field, resolve how `brand_personality` will influence the output. do this once, up front, so every field that follows benefits from a consistent brand reading.

if `brand_personality` is null, skip this step entirely and rely on industry-level defaults in `llm_customization_hints`.

if `brand_personality` is present, work through each sub-field and record your intended application:

**`tone` → drives `program_name`, `brand_voice_summary`, `referral_description`**

- playful / irreverent: use punchy, unexpected naming; referral copy should be casual and fun
- warm / community-driven: naming should feel like belonging; referral copy frames it as "bring someone in"
- premium / minimalist: naming should be short and understated; avoid exclamation marks everywhere
- bold: naming can be confident and declarative; voice should feel like the brand is doing the customer a favor by letting them join
- clinical: keep naming functional and clear; voice copy should lead with facts, not feelings

**`identity_keywords` → drives `currency_name` (points programs), `program_name`**

- pick the keyword that is most noun-like and translates well to a reward unit
- the currency name should feel like something the business would actually say, not a generic stand-in
- if no keyword works as a currency noun, derive from the core product (a florist's "Blooms", a butcher's "Cuts")
- for `program_name`, use the keywords to anchor the name in the brand's world — avoid names that could belong to any business

**`price_positioning` → drives `reward_tiers` perks, `bonus_rules` framing**

- budget: perks should lead with savings and tangible discounts; avoid aspirational language like "exclusive" or "curated"
- mid-market: balance savings with light status signals; a free item or early access feels right
- premium: perks should emphasize access, experience, and recognition over dollar discounts; "15% off" as a top-tier perk feels cheap for a premium brand — replace with complimentary services, dedicated support, or first-look access
- luxury: never use percentage discounts as a primary perk at any tier; rewards should be experiential, personal, and scarce

**`customer_relationship_model` → drives `brand_voice_summary`, `referral_description`, tier naming**

- transactional: voice is efficient and benefit-forward. referral copy: "share your code, you both save." tier names should be functional (Basic / Plus / Pro), not aspirational
- community: voice emphasizes belonging. referral copy: "bring a friend into the fold." tier names can reference shared identity (Member / Regular / Local Legend)
- membership: voice emphasizes access and earned status. referral copy: "invite someone you think belongs here." tier names should feel like levels of inner access (Access / Insider / Inner Circle)
- expert-to-customer: voice emphasizes trust and guidance. referral copy: "recommend us to someone who'd benefit." tier names can reflect progression of trust or knowledge (Beginner / Practitioner / Expert)

---

### step 4 — customize each field

work through every field in the archetype in order. for each field, apply one of four actions:

| action         | when to use                                                            |
| -------------- | ---------------------------------------------------------------------- |
| **substitute** | replace a placeholder value with a business-specific one               |
| **adjust**     | modify a number, rate, or threshold to fit the business context        |
| **rewrite**    | reword text to match the business's brand voice                        |
| **keep**       | leave the value exactly as-is (always do this for `keep_fixed` fields) |

field-by-field rules follow.

#### `program_type`

**keep.** never change. this is the structural anchor for the row.

---

#### `program_type_reason`

**write.** 2–3 plain-language sentences explaining to the business owner why this program type was chosen. reference `primary_goal`, `visit_frequency`, and `spend_variance`. owner-facing — answers "why does this program make sense for us?"

never reference the LLM, archetypes, or internal decision logic. write as if a human strategist is explaining the choice.

---

#### `industry`

**substitute.** replace the archetype's example industry with the actual business industry from the onboarding profile.

---

#### `program_name`

**rewrite.** invent a short, branded program name that fits the business. follow these rules:

- 1–3 words
- reflects what the business sells or the feeling it creates
- avoid generic names like "Rewards Club" or "Loyalty Points"
- good patterns: `[Brand] Rewards`, `[Noun] Credits`, `The [Aspirational Word]` (for tiered), `[Product Noun] Back` (for cashback)
- examples: a bookshop → "Dog-Eared Rewards"; a yoga studio → "Flow Credits"; a wine shop → "The Cellar"

if `brand_personality` is available:

- draw the name from `identity_keywords` first — the name should feel native to this brand's vocabulary
- let `tone` shape the register: premium/minimalist brands → short, understated names; playful brands → names with personality; community-driven brands → names that imply belonging
- let `customer_relationship_model` shape the structure: membership models → "The [Word]" works well; transactional models → "[Noun] Rewards" or "[Noun] Back" is cleaner"

---

#### `program_name_explanation`

**write.** 1–2 sentences explaining what the program name is and why it was chosen. customer-facing — should make the name feel intentional and on-brand, not arbitrary.

---

#### `currency_name`

**rewrite** (points programs only). rename the archetype's placeholder currency to something on-brand.

- use a noun related to what the business sells or its identity
- singular form, capitalized (e.g. "Paws", "Pages", "Drops", "Miles")
- for cashback: currency is always displayed as a dollar value — do not rename it
- for tiered: there is no currency — keep the archetype's `currency_name` value noting it is spend-based

if `brand_personality` is available:

- scan `identity_keywords` for the most noun-like term that could work as a reward unit
- if a keyword maps cleanly to a physical thing the business deals in, use it (a tea shop with keyword "leaf" → "Leaves"; a bookshop with keyword "page" → "Pages")
- if no keyword translates, fall back to the core product or service noun
- never use a currency name that sounds corporate or abstract — it should feel like this specific business coined it

---

#### `currency_name_explanation`

**write.** 1–2 sentences defining what the currency is and how it is earned, in plain language. both business and customer facing.

example: "Blooms are the points you earn at [Business Name]. You earn 1 Bloom for every dollar you spend on any service."

update the currency name and earn rate to match the actual values in `earn_rules.dollar_spend`.

---

#### `earn_rules`

**earn_rules has exactly two keys: `dollar_spend` and `rebook_on_spot`. never add or remove mechanisms.**

**`earn_rules.dollar_spend`** — adjust the rate value and rewrite the explanation:
- for points programs: adjust `points_per_dollar` based on margin and `llm_customization_hints`
- for cashback programs: adjust `cashback_percent` based on margin
- for tiered programs: `spend_tracked: true` (no rate — all spend counts toward tier)
- rewrite `explanation` in plain language using the actual currency name. example: "Earn 1 Bloom for every dollar you spend on any service."

**`earn_rules.rebook_on_spot`** — adjust the bonus value and rewrite the explanation:
- for points programs: adjust `bonus_points` based on `primary_goal` (higher for `retain` and `revenue`)
- for cashback programs: adjust `bonus_credit_cents`
- for tiered programs: adjust `spend_credit_multiplier` (e.g. 1.25 means rebooking on the spot makes spend count 1.25× toward tier)
- rewrite `explanation` using the actual currency name and what "rebooking" means for this business (next appointment, next class, next session, etc.)

---

#### `redemption_rules`

**keep** the structure and thresholds fixed for points and cashback (these are in `keep_fixed`).

- substitute the currency name throughout
- for tiered programs, keep the "automatic / no manual redemption" mechanic — do not convert it to a points redemption
- do not change `partial_redemption_allowed` — keep it true
- **rewrite `redemption_rules.explanation`** in plain language using the actual currency name and redemption value. example: "Once you have 100 Blooms, you can redeem them for $5 off any service."

---

#### `reward_tiers` (tiered programs only)

**rewrite** tier names and **adjust** thresholds and perks.

- rename all three tiers to fit the brand (see `vary_tier_names` hint)
- calibrate `qualification_threshold` amounts using this rule: the top tier should be reachable by roughly the top 10–15% of customers. if you have no spend data, use the archetype defaults and note they should be validated post-launch
- rewrite perks to match what this business can actually offer:
  - a product business offers discounts, free items, early product access
  - a service business offers free sessions, priority booking, complimentary add-ons
  - do not include perks the business cannot deliver (e.g. "personal stylist" for a car wash)
- `tier_rank` values and structure: keep fixed
- **add an `explanation` field to each tier object** in plain language describing who it is for and what reaching it means. example: "Insider unlocks once you spend $500 in a rolling 12-month period. You keep this tier as long as you maintain that spend level."

if `brand_personality` is available:

- use `customer_relationship_model` to name the tiers (see step 3 guidance for naming patterns per model)
- use `price_positioning` to determine what kind of perks belong at each level:
  - budget/mid-market: lead with savings — discounts, free items, reduced minimums for free shipping
  - premium: lead with access and experience — early product drops, dedicated service, complimentary consultations
  - luxury: no percentage discounts; perks should be personal, experiential, and feel genuinely scarce — private appointments, bespoke packaging, invitation-only events

---

#### `tier_progression_rules` (tiered programs only)

**keep** all values fixed except `starting_tier` name (rename to match the new tier 1 name).

- do not change the 90-day grace period
- do not change upgrade timing logic (immediate on threshold crossing)
- do not change downgrade policy (one tier down, not to bottom)
- **rewrite `tier_progression_rules.explanation`** in plain language. explain how upgrades happen, how downgrades work, and the grace period. customer-facing.

---

#### `points_expiry_rules`

**keep** for cashback (365 days is intentional for price-sensitive customers).
**adjust** for points programs based on `primary_goal`:

- `retain` or `revenue` goal: tighten to 90 days to create urgency
- `acquire` goal: keep at 180 days to reduce friction for new members
  **not applicable** for tiered — keep the archetype's "not applicable" value.

**rewrite `points_expiry_rules.explanation`** in plain language using the actual currency name and inactivity period. example: "Your Blooms are valid as long as you make at least one qualifying visit every 180 days. We'll remind you 30 days before any points are set to expire."

---

#### `bonus_rule`

**`bonus_rule` is a single JSON object — not an array.** pick the one bonus trigger that best fits the business's `primary_goal` and industry context:

- `acquire` goal → welcome bonus (`first_purchase` or `first_visit`)
- `retain` goal → birthday bonus (`birthday_month`) or visit milestone
- `revenue` goal → spend threshold bonus

**adjust** the bonus value based on margin and program type. **rewrite `bonus_rule.explanation`** in plain language using the actual currency name. example: "Earn double Blooms on any service during your birthday month."

do not output an array. output exactly one object.

---

#### `program_purpose`

**write** 2–3 plain-language sentences for the business owner explaining why this specific program type was chosen for their business.

this field is owner-facing. it is not marketing copy and is not a description of tone. it answers the question: "why does this program make sense for us?"

write it after you have completed all other fields — draw on the actual inputs: their industry, offering type, primary goal, visit frequency, and spend variance.

structure it as:
- sentence 1: state which program type was chosen and the primary reason tied to their goal or behavior pattern
- sentence 2: explain why this type fits their visit/spend pattern or industry context
- sentence 3 (optional): note any bonus mechanics or structural benefits that suit them specifically

**never** reference the LLM, archetypes, or internal decision logic. write as if a human strategist is explaining the choice.

examples by program type:

**points:**
> "A points-based program suits your business because your customers visit frequently and spend consistently. Flat points reward every visit without complex tier tracking, and the welcome and birthday bonuses give you quick wins for new and returning members."

**tiered:**
> "A tiered program makes sense for your business because your customers vary significantly in how much they spend. Tiers let you recognize and retain your highest-value clients with meaningful perks while still rewarding casual visitors at the entry level. The spend-based structure also encourages customers to increase their visits to reach the next tier."

**cashback:**
> "A cashback program works well for your business because your customers are value-conscious and visit infrequently. Immediate, tangible cashback gives new customers a clear reason to return without asking them to accumulate points over a long period. It's also easy to communicate — customers always know exactly what they're getting."

---

#### `referral_rules`

**`referral_rules` is a structured JSON object** — not a plain text string. keep all keys present in the archetype. adjust reward values and rewrite `referral_rules.explanation`.

structure:
```json
{
  "referrer_reward": 100,
  "referee_reward": 50,
  "trigger": "referee_first_visit",
  "explanation": "..."
}
```

- **adjust reward amounts** based on `primary_goal` (`acquire` → increase both rewards; `retain`/`revenue` → use archetype defaults)
- **keep the trigger** (`referee_first_purchase` or `referee_first_visit`) — do not change the mechanic
- **rewrite `referral_rules.explanation`** in plain language in second person ("share your link…"). use the actual currency name and reward amounts.

if `brand_personality` is available, calibrate the explanation's register:
- use `tone`: playful/irreverent → casual and punchy; warm/community → inviting and personal; premium → polished and restrained
- use `customer_relationship_model` to frame the ask:
  - transactional: "share your code. you get [X], they get [X]." — direct, no sentiment
  - community: "know someone who'd love it here? bring them in — you'll both be rewarded."
  - membership: "think someone belongs in [program name]? invite them — and earn [X] when they join."
  - expert-to-customer: "if you know someone who could benefit, pass it on. you'll earn [X] when they make their first purchase."

---

#### `brand_voice_summary`

**rewrite** to reflect this specific business's identity.

- 2–3 sentences
- describe the tone (e.g. playful, premium, clinical, warm, irreverent)
- describe the relationship the program should communicate (thank-you, membership, partnership)
- include one concrete example of how the voice should sound in a notification or email subject line
- do not describe mechanics here — this is tone only

if `brand_personality` is available, this field should be a direct synthesis of it:

- sentence 1: name the tone and what it means in practice for this program — drawn from `tone` + `identity_keywords`
- sentence 2: describe the relationship framing — drawn from `customer_relationship_model`
- sentence 3: give a concrete example notification or subject line that demonstrates the voice in action

example (tone=warm, keywords=["neighborhood","handcrafted"], model=community):

> "the program should feel like a handwritten thank-you note from a neighbor, not a corporate points statement. every touchpoint should reinforce that customers are part of something local and made-by-hand, not just transacting. a push notification might read: 'your Brews are waiting, [first name] — come back and use them.'"

example (tone=premium, keywords=["curated","considered"], model=membership):

> "the program communicates exclusivity through restraint — never shouting about discounts, always signaling access. language should be warm but economical, as if the brand assumes the customer already understands its value. a tier upgrade email might open: 'you've reached Insider. here's what that means for you.'"

if `brand_personality` is null: write the summary based on industry defaults and the archetype's example voice.

---

#### `terms_and_conditions`

**substitute** all `[bracketed placeholders]` with the correct values:

- `[Program Name]` → the new `program_name`
- `[Currency Name]` → the new `currency_name`
- `[Business Name]` → `business_name` from onboarding
- `[X]` values → the corresponding numbers from `earn_rules`, `redemption_rules`, and `points_expiry_rules`
- `[DATE]` → leave as-is (populated at publish time)
- `[State/Jurisdiction]` → leave as-is (populated by the business)
- `[Address]`, `[Email]`, `[Phone]` → leave as-is (populated by the business)

do not rewrite the legal prose. do not change section structure. do not add or remove clauses. only fill in the placeholders.

---

### step 5 — consistency check

before outputting the final program, verify:

1. **currency name is consistent** across `currency_name`, `currency_name_explanation`, `earn_rules`, `redemption_rules`, `bonus_rule`, `referral_rules`, and `terms_and_conditions` — it should be identical everywhere it appears
2. **program name is consistent** across `program_name` and `terms_and_conditions`
3. **tier names are consistent** across `reward_tiers`, `tier_progression_rules`, and `terms_and_conditions` (tiered only)
4. **numbers match** — every rate, threshold, and bonus amount in `terms_and_conditions` matches the corresponding value in `earn_rules`, `redemption_rules`, `bonus_rule`, and `points_expiry_rules`
5. **no placeholder brackets remain** in any field except `[DATE]`, `[State/Jurisdiction]`, `[Address]`, `[Email]`, and `[Phone]`
6. **earn_rules has exactly two keys** — `dollar_spend` and `rebook_on_spot` — no more, no fewer
7. **bonus_rule is a single object** — not an array
8. **every JSON field has an `explanation` key** — `earn_rules.dollar_spend`, `earn_rules.rebook_on_spot`, `redemption_rules`, `points_expiry_rules`, `bonus_rule`, `referral_rules`, each object in `reward_tiers` (tiered only), and `tier_progression_rules` (tiered only)

---

### step 6 — output format

output the completed program as a single JSON object that matches the Supabase row structure. omit `id` and `created_at` — these are auto-generated on insert.

```json
{
  "program_type": "...",
  "program_type_reason": "...",
  "industry": "...",
  "program_name": "...",
  "program_name_explanation": "...",
  "currency_name": "...",
  "currency_name_explanation": "...",
  "earn_rules": {
    "dollar_spend": { "points_per_dollar": 1, "explanation": "..." },
    "rebook_on_spot": { "bonus_points": 50, "explanation": "..." }
  },
  "redemption_rules": { ..., "explanation": "..." },
  "reward_tiers": null,
  "tier_progression_rules": null,
  "points_expiry_rules": { ..., "explanation": "..." },
  "bonus_rule": { "trigger": "...", "value": ..., "unit": "...", "explanation": "..." },
  "program_purpose": "...",
  "referral_rules": { "referrer_reward": ..., "referee_reward": ..., "trigger": "...", "explanation": "..." },
  "brand_voice_summary": "...",
  "llm_customization_hints": { ... },
  "terms_and_conditions": "..."
}
```

include `llm_customization_hints` in the output unchanged — it should be stored in Supabase alongside the program so future edits can reference it.

---

## hard constraints — never violate these

- **never change JSON keys or column names.** only values change.
- **never add fields** not present in the archetype.
- **never remove fields** from the output, even if null.
- **never cross-contaminate archetypes** — a cashback program does not get tier logic; a tiered program does not get a points currency.
- **never rewrite legal prose** in `terms_and_conditions` beyond filling placeholders.
- **never invent a perk or reward** the business cannot plausibly deliver given its industry and offering type.
- **never change `keep_fixed` values** regardless of business inputs.

---

## quick reference — what changes by program type

| field                         | points                               | tiered                               | cashback                             |
| ----------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| `brand_personality`           | apply in step 3 before all fields    | apply in step 3 before all fields    | apply in step 3 before all fields    |
| `program_type_reason`         | write (owner-facing why)             | write (owner-facing why)             | write (owner-facing why)             |
| `program_name`                | rewrite                              | rewrite                              | rewrite                              |
| `program_name_explanation`    | write                                | write                                | write                                |
| `currency_name`               | rewrite                              | keep (spend-based)                   | keep ($ value)                       |
| `currency_name_explanation`   | write                                | write                                | write                                |
| `earn_rules.dollar_spend`     | adjust points_per_dollar             | spend_tracked: true                  | adjust cashback_percent              |
| `earn_rules.rebook_on_spot`   | adjust bonus_points                  | adjust spend_credit_multiplier       | adjust bonus_credit_cents            |
| `redemption_rules`            | keep structure + rewrite explanation | keep as automatic + rewrite exp.     | keep structure + rewrite explanation |
| `reward_tiers`                | null — keep null                     | rewrite names + perks + explanation  | null — keep null                     |
| `tier_progression_rules`      | null — keep null                     | keep, rename tier 1 + rewrite exp.   | null — keep null                     |
| `points_expiry_rules`         | adjust by goal + rewrite explanation | keep (n/a) + rewrite explanation     | keep (365 days) + rewrite explanation |
| `bonus_rule`                  | single object, adjust by goal        | single object, adjust by goal        | single object, adjust by goal        |
| `program_purpose`             | write (owner-facing rationale)       | write (owner-facing rationale)       | write (owner-facing rationale)       |
| `referral_rules`              | adjust values + rewrite explanation  | adjust values + rewrite explanation  | adjust values + rewrite explanation  |
| `brand_voice_summary`         | synthesize from personality          | synthesize from personality          | synthesize from personality          |
| `reward_tiers` perks          | n/a                                  | calibrate to price_positioning       | n/a                                  |
| `terms_and_conditions`        | fill placeholders                    | fill placeholders                    | fill placeholders                    |

/**
 * Loyalty program design guidelines.
 *
 * These are injected into the generation prompt to shape AI output.
 * Edit this file to tune program quality, constraints, and best practices
 * without touching the prompt template itself.
 */

export const PROGRAM_GUIDELINES = `
## Loyalty program design guidelines

### Points economy
- Earn rate: 1–10 points per $1 spent is the standard range for service businesses. Lower rates (1–2 pts/$) work for high-ticket services (e.g. clinics, med spas); higher rates (5–10 pts/$) suit frequent low-ticket visits (e.g. barbershops, nail salons).
- Redemption value: 100–500 points should unlock a meaningful reward (e.g. a free add-on or discount). Avoid making the first reward feel unattainable.
- Visit-based rules: if the business has services under $30, prefer points_per_visit over points_per_dollar for simplicity.

### Tier structure
- Always include a base "member" tier at 0 points — this is the welcome level all customers join.
- Use 3–4 tiers total. Tier names should feel aspirational and brand-appropriate (e.g. Silver / Gold / Platinum, or Seedling / Bloom / Blossom for a wellness brand). The name of the tier should if possible have something to do thematically with the name of the loyalty program.
- Points thresholds should be achievable: tier 2 within 3–5 visits, tier 3 within 10–15 visits.
- Each tier's reward should clearly outvalue the previous one — avoid tiers where the incremental benefit is unclear.

### Simplicity first
- The entire program should be explainable in 1–2 sentences. If a customer can't understand how to earn and redeem, the program will be ignored.
- Never generate more than 3 earn rules total (primary + 2 bonus). Complexity is the #1 cause of program failure.
- Redemption should be intuitive: the customer should never have to calculate whether a reward is worth it.

### Earn rules
- Include a primary earn rule (points per dollar or per visit) that applies to all purchases.
- Add 1–2 bonus earn rules tied to specific behaviors: booking in advance, leaving a review, referring a friend, or purchasing a package. Keep it manageable in terms of implementation and enforcing.
- Non-transactional earn behaviors (profile/intake form completion, registering a birthday, following on social) can be included as one-time bonus point awards — they are low-cost to implement and build engagement without requiring a purchase.
- Bonus multipliers should be 1.5x–3x; avoid multipliers above 5x.

### Bonus rules
- Referral bonuses should reward both the referrer and the new customer (double-sided).
- Birthday or anniversary bonuses are effective for retention-focused programs.
- Keep bonus rules simple enough to explain in one short sentence.

### Brand voice
- brand_voice_summary should be 1–2 sentences capturing the business's personality and what makes their loyalty program feel unique. It should feel warm and human, not corporate. Concise.
- Frame the program as membership in a community, not just points accumulation — rewards should feel like a thank-you, not a rebate. Avoid purely transactional language.
- currency_name should reflect the business's identity (e.g. "Glow Points" for a spa, "Blade Bucks" for a barbershop). Avoid generic names like "Points" or "Credits".

### Common failure modes to avoid
- Overly complex rules: if the earn logic requires a chart to explain, simplify it.
- Low-perceived-value rewards: a 5% discount feels like a coupon, not a reward. Prefer experiential or service-based rewards (free add-on, priority booking, complimentary treatment).
- Points expiry: avoid expiring points unless necessary — it feels punitive and erodes trust.
- Poor communication: the program only works if customers remember it exists. Reward descriptions should be vivid and specific, not vague ("exclusive perks").

### Goal alignment
- retention: emphasize tiered rewards, anniversary bonuses, and frequency multipliers. Rewards should encourage repeat visits.
- referrals: make referral bonuses prominent and generous. Include a double-sided referral rule.
- frequency: focus on visit-based earning, bonus multipliers for consecutive visits, and rewards that unlock quickly.
`.trim()

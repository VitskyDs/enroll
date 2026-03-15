// ---------------------------------------------------------------------------
// Helpers to turn a referral_rules object into human-readable UI strings.
// The rules shape varies by program type; all cases are handled here.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReferralRules = Record<string, any>

/**
 * Returns the reward the referrer (current user) earns, formatted as a
 * short label suitable for the page heading. Examples:
 *   "30 gems"  |  "$25 credit"  |  "$5 credit"
 */
export function formatReferrerReward(rules: ReferralRules, currencyName: string): string {
  if (rules.referrer_reward_credit_cents != null) {
    const dollars = (rules.referrer_reward_credit_cents / 100).toFixed(0)
    return `$${dollars} credit`
  }
  if (rules.referrer_reward != null) {
    return `${rules.referrer_reward} ${currencyName}`
  }
  return 'a reward'
}

/**
 * Returns the reward the referred friend gets, formatted as a short label.
 * Examples: "20 gems"  |  "10% off"  |  "$5 credit"
 */
export function formatRefereeReward(rules: ReferralRules, currencyName: string): string {
  if (rules.referee_reward_credit_cents != null) {
    const dollars = (rules.referee_reward_credit_cents / 100).toFixed(0)
    return `$${dollars} credit`
  }
  if (rules.referee_reward_discount_percent != null) {
    return `${rules.referee_reward_discount_percent}% off their first visit`
  }
  if (rules.referee_reward != null) {
    return `${rules.referee_reward} ${currencyName}`
  }
  return 'a reward'
}

/**
 * Returns an array of plain-language condition strings to display under
 * "Important information", derived directly from the referral rules.
 */
export function getReferralConditions(rules: ReferralRules): string[] {
  const conditions: string[] = []

  // Qualifying action condition
  switch (rules.trigger) {
    case 'referee_first_purchase':
    case 'referee_first_visit':
      conditions.push('Your friend must be a new customer and complete their first visit to qualify.')
      break
    case 'referee_reaches_insider':
      conditions.push(
        'Your friend must complete their first visit and reach the first tier of the loyalty program.',
      )
      break
    default:
      conditions.push('Your friend must complete a qualifying visit to trigger the reward.')
  }

  // Minimum spend condition (cashback programs)
  if (rules.minimum_referee_spend_cents != null) {
    const amount = (rules.minimum_referee_spend_cents / 100).toFixed(0)
    conditions.push(`Your friend must spend a minimum of $${amount} on their qualifying visit.`)
  }

  // Reward credit timeline — always shown
  conditions.push(
    'Your reward is credited to your account within 48 hours of your friend completing their qualifying visit.',
  )

  return conditions
}

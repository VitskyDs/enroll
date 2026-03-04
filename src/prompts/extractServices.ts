/**
 * Builds the prompt for extracting services from a business website's text content.
 * Input is Jina Reader markdown; output is a JSON array of service objects.
 */
export function buildExtractServicesPrompt(businessName: string, pageContent: string): string {
  const truncated = pageContent.slice(0, 12000)

  return `You are analyzing a business website to extract their service offerings.

Business name: ${businessName}

Website content:
${truncated}

Extract exactly 3 representative services offered by this business. Return a JSON array only — no markdown, no code fences, no explanation.

Each object must have these fields:
- name: string (service name)
- description: string (one sentence, max 15 words)
- duration_minutes: number | null (estimated duration in minutes)
- price: number | null (regular price in dollars, e.g. 45 for $45.00, null if not listed)
- subscription_price: number | null (suggested subscription/membership price, ~10% less than regular price, null if not applicable)
- category: string (e.g. "hair", "nails", "skin", "massage")

If fewer than 3 services are found, return what is available. If none, return: []`
}

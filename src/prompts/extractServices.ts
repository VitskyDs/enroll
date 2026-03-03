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

Extract all services offered by this business. Return a JSON array only — no markdown, no code fences, no explanation.

Each object must have these fields:
- name: string (service name)
- description: string (one sentence, max 15 words)
- duration_minutes: number | null (estimated duration)
- price: number | null (price in dollars, e.g. 45 for $45.00, null if not listed)
- category: string (e.g. "hair", "nails", "skin", "massage")

If no services are found, return an empty array: []`
}

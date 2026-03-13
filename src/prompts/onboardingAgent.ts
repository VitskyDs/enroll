import type Anthropic from '@anthropic-ai/sdk'

export const ONBOARDING_SYSTEM_PROMPT = `You are Enroll, an onboarding assistant for small service businesses. Your goal for this phase is to collect basic business information: the business details (name, type, services) and any context that can be inferred from their website.

Flow:
1. Greet the user warmly and ask: "What's your business name or website URL?"
2. If the user gives a URL (starts with http/https, or looks like a domain such as "mysalon.com"):
   - Call submit_url immediately with that URL
3. If the user gives a business name (not a URL):
   - Call search_business with the name
   - After results are shown, wait for the user to pick one
   - When the user selects a URL (they will say something like "use the first one" or paste a URL), call submit_url with it
4. If the user clicks "None of these" or asks to enter details manually:
   - Ask for business name, type, and their top services one at a time
   - Then call submit_manual with everything collected
5. After business details are confirmed (service selector shown), wait for the user to confirm their services
6. Once services are confirmed, the user will click "Continue" — your job in this phase is done

Rules:
- Keep messages short and friendly
- Do not ask for loyalty goals — that happens in the next step
- Do not ask for business name, type, or services separately unless in manual fallback mode
- After submit_url or submit_manual succeeds, summarize what was found briefly and confirm the service selector is shown`

export const ONBOARDING_TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_business',
    description: 'Call this when the user provides a business name (not a URL). Searches for the business website and returns candidate URLs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description: 'The business name to search for',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'submit_url',
    description: 'Call this when you have a URL to extract business info from — either provided directly by the user or selected from search results.',
    input_schema: {
      type: 'object' as const,
      properties: {
        url: {
          type: 'string',
          description: 'The website URL to visit and extract business data from',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'submit_manual',
    description: 'Call this as a fallback when URL extraction fails or the user prefers to enter details manually. Collect business name, type, and services via chat first, then call this tool.',
    input_schema: {
      type: 'object' as const,
      properties: {
        business_name: {
          type: 'string',
          description: 'The business name',
        },
        business_type: {
          type: 'string',
          enum: ['salon', 'spa', 'barbershop', 'clinic', 'fitness', 'wellness', 'other'],
          description: 'The business category',
        },
        industry: {
          type: 'string',
          description: 'Industry vertical — one of: food & beverage, retail — specialty, retail — general, e-commerce, health & beauty, fitness & wellness, hospitality & travel, professional services, automotive, grocery & pharmacy, financial services, entertainment, other',
        },
        offering_type: {
          type: 'string',
          enum: ['product', 'service', 'both'],
          description: 'Whether the business primarily sells products, services, or both',
        },
        services_and_products: {
          type: 'string',
          description: '1-2 sentence plain description of what the business sells or offers',
        },
        services: {
          type: 'array',
          description: 'List of services or products provided by the business',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price_cents: { type: 'number', description: 'Price in cents, e.g. 5000 for $50' },
            },
            required: ['name'],
          },
        },
      },
      required: ['business_name', 'business_type', 'services'],
    },
  },
]

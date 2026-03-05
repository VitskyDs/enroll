import type Anthropic from '@anthropic-ai/sdk'

export const ONBOARDING_SYSTEM_PROMPT = `You are Enroll, an onboarding assistant for small service businesses. Your goal is to collect four pieces of information:

1. The business name
2. The business type (salon, spa, barbershop, clinic, fitness, wellness, or other)
3. The key services they offer (name + optional price)
4. The primary loyalty goal (retention, referrals, or frequency)

Ask for them conversationally — one at a time, in order. Keep your messages short and friendly.

Rules:
- Do not accept clearly invalid answers. Examples of invalid answers: "I don't know", "anything", "whatever", a vague sentence where a name was expected. If the user gives an invalid answer, gently re-ask.
- Once you have a confident answer for a field, call the corresponding tool to record it, then move on to the next field.
- You can answer brief questions about the product, but always steer back to collecting the needed information.
- For services: accept either a list of service names (with optional prices) OR a website URL. If a URL is given, pass it to submit_services and the system will extract services automatically.
- For the loyalty goal: you will present options to the user (retain existing customers, gain new members, increase recurring revenue). After the user indicates their preference, call submit_goal with the matching value.
- Do not ask for all fields at once. One at a time.
- Start with a brief, warm greeting, then ask for the business name.`

export const ONBOARDING_TOOLS: Anthropic.Tool[] = [
  {
    name: 'submit_business_name',
    description: 'Call this once you have confidently identified the business name from the user\'s response. Do not call this if the user gave a vague, evasive, or clearly invalid answer.',
    input_schema: {
      type: 'object' as const,
      properties: {
        business_name: {
          type: 'string',
          description: 'The name of the business',
        },
      },
      required: ['business_name'],
    },
  },
  {
    name: 'submit_business_type',
    description: 'Call this once you have confidently identified the business type. Map the user\'s answer to the closest category.',
    input_schema: {
      type: 'object' as const,
      properties: {
        business_type: {
          type: 'string',
          enum: ['salon', 'spa', 'barbershop', 'clinic', 'fitness', 'wellness', 'other'],
          description: 'The category of the business',
        },
      },
      required: ['business_type'],
    },
  },
  {
    name: 'submit_services',
    description: 'Call this when the user has provided their services (either as a list or via a website URL). Provide either services array or website_url — at least one is required.',
    input_schema: {
      type: 'object' as const,
      properties: {
        services: {
          type: 'array',
          description: 'List of services if provided directly by the user',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price_cents: { type: 'number', description: 'Price in cents (e.g. 5000 for $50)' },
            },
            required: ['name'],
          },
        },
        website_url: {
          type: 'string',
          description: 'Website URL if the user provided one for automatic service extraction',
        },
      },
    },
  },
  {
    name: 'submit_goal',
    description: 'Call this after the user has selected their loyalty goal from the options presented.',
    input_schema: {
      type: 'object' as const,
      properties: {
        goal: {
          type: 'string',
          enum: ['retention', 'referrals', 'frequency'],
          description: 'retention = retain existing customers, referrals = gain new members, frequency = increase recurring revenue',
        },
      },
      required: ['goal'],
    },
  },
]

---
id: TASK-9
title: Replace deterministic onboarding with LLM-driven conversational chat
status: To Do
assignee: []
created_date: '2026-03-03 00:00'
updated_date: '2026-03-04 10:05'
labels: []
milestone: m-0
dependencies:
  - TASK-5
  - TASK-6
priority: high
ordinal: 1500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The onboarding chat is currently a hardcoded state machine: each step blindly accepts whatever the user typed and responds with a canned message. This produces embarrassing failures — e.g. a user typing "I don't have a business name yet" is met with "Great name!" and the bot moves on. The steps have no awareness of whether the user actually answered the question.

Replace the deterministic switch/case logic with a Claude-driven conversation. The LLM has a fixed **objective**: collect the four required data points — business name, business type, services, and loyalty goal — but the conversation path to get there is flexible and natural. Claude handles clarification, follow-up, ambiguity, and off-topic input intelligently.

The required data points are extracted via **tool use**: Claude calls a `submit_onboarding_data` tool (or equivalent) once it has confidently collected each field. The frontend listens for tool calls to know when data is ready and to transition steps — rather than treating every message as a confirmed answer.

The existing downstream pipeline (`extractServices`, `generateProgram`, `saveToSupabase`) is unchanged; only the data-collection phase is replaced.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The chat is powered by a Claude streaming conversation — user messages and Claude responses are exchanged via the Anthropic SDK
- [ ] #2 Claude will not accept nonsensical or evasive answers — it re-asks or clarifies until it has a confident value for each required field
- [ ] #3 Claude extracts the four data points via tool use (`submit_business_name`, `submit_business_type`, `submit_services`, `submit_goal` — or a single multi-field tool); the frontend reacts to tool calls rather than treating raw chat turns as confirmations
- [ ] #4 The conversation is natural — Claude can handle tangents, questions about the product, and partial answers without breaking the flow
- [ ] #5 The existing `ServiceSelector` and `GoalSelector` widgets still appear at the appropriate moments (after services are extracted / after goal is confirmed), driven by tool calls rather than step transitions
- [ ] #6 The downstream pipeline (service extraction if a URL is provided, program generation, Supabase save) remains unchanged
<!-- AC:END -->



## Notes

**Architecture sketch:**

The hook maintains a `messages: Anthropic.MessageParam[]` array for the LLM context (separate from the display `ChatMessage[]`). On each user turn, the full history is sent to Claude with a system prompt describing the objective and the available tools.

System prompt objective:
> You are Enroll, an onboarding assistant for small service businesses. Your goal is to collect four pieces of information: (1) the business name, (2) the business type (salon, spa, barbershop, etc.), (3) the key services they offer (name + optional price), (4) the primary loyalty goal. Ask for them conversationally — one at a time. Do not accept clearly invalid answers (e.g. "I don't know", "anything", a sentence instead of a name). Once you have a confident answer for a field, call the corresponding tool to record it and move on.

Tool calls from Claude trigger the same `dispatch` actions the current step machine uses, keeping the rest of the app unchanged.

**Key risk**: streaming responses with tool use require the manual agentic loop pattern (`messages.stream()` + `finalMessage()`) — see `src/services/generateProgram.ts` for the existing streaming pattern.

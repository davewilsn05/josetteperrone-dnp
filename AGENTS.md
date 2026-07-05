# josieperrone-dnp — Agent Rules

## Cost Rule (mandatory before building anything that spends money automatically)

Any proposed system that will spend money automatically and repeatedly — scheduled LLM calls, paid-API crons, synthetic monitors, per-event AI analysis, metered third-party services — must present an approximate cost (per run / per day / per month) alongside the recommendation, plus at least one cheaper alternative, BEFORE implementation. Get explicit approval on the number, not just the feature. If usage scales with traffic or schedule frequency, state the 10x number too.

Learned 2026-07-04 (TRL/Active): a synthetic monitor ran a full LLM journey every 30 minutes ($3-5/day, ~$120/month) with zero users involved and silently drained the OpenAI account on launch day. A design costing pennies existed all along and was adopted the same day it was finally priced.

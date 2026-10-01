# Boterra AI

**The AI workforce that runs your business.** Boterra AI gives small and medium-sized enterprises (SMEs) a coordinated swarm of 26 specialist AI agents across 10 departments: executive, finance, operations, sales & marketing, customer experience, people & HR, legal, compliance & risk, administration, and technology. Together they monitor, operate and scale the business.

## What's in the app

| Area | What it does |
| --- | --- |
| **Marketing site** (`/`, `/agents`, `/industries`, `/pricing`, `/compare`) | Positioning, the full agent directory, industry packs, pricing with a monthly/yearly toggle, and a competitor benchmark |
| **Sign up / log in** | Email and password auth (scrypt hashes, signed HTTP-only session cookie) |
| **Onboarding wizard** | Business, industry, country, size, goals and autonomy level. Atlas then assembles a recommended swarm and its routines |
| **Command Center** (`/app`) | Mission launcher, team overview, approvals needing attention, activity and audit trail, industry KPIs, credit usage |
| **Agents** | Add or remove agents from the team, and chat with any agent (streamed responses tailored to the business profile) |
| **Missions** | Give Atlas (the orchestrator) a goal. It plans the work, assigns 2–5 agents to run in parallel, then writes an executive summary with risk-rated next actions |
| **Routines** | Recurring agent work (Monday briefings, cash checks, compliance scans). Can be run on demand or on a schedule |
| **Approval inbox** | Human-in-the-loop control. Advise, Assist and Autopilot autonomy levels decide what waits for the owner. Every decision is logged |
| **Plan & billing** | Starter (free forever), Growth, Scale and Enterprise. A 14-day Scale trial, per-plan agent access and monthly AI credits |
| **Settings** | Business profile, industry pack switching, autonomy level, and an integrations roadmap |

### How Boterra stands out (benchmark, Oct 2026)

Competitors include Symphony by Wix (a multi-agent system with a "Maestro" orchestrator, about $16–80/mo), Sintra AI (12 helpers, from about $97/mo), Motion AI Employees, and Salesforce Agentforce / Microsoft Copilot Studio. Boterra differs in five ways:

1. **A whole company, not a marketing team.** It covers finance, legal, compliance, HR and procurement as well as marketing.
2. **Missions, not chats.** The orchestrator splits one goal across departments that work in parallel.
3. **Human-in-the-loop by design.** Autonomy levels, risk-rated actions, an approval inbox and an audit trail.
4. **Industry packs as data.** Each vertical is one entry in `src/lib/catalog/industries.ts`, so new industries ship without code changes.
5. **Built for emerging and global markets.** Jurisdiction-aware guidance (GDPR, NDPR, POPIA, CCPA…).

The benchmark data lives in `src/lib/catalog/benchmark.ts`.

## Getting started

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY for live agents
npm run dev                  # http://localhost:3000
```

Without `ANTHROPIC_API_KEY` the app runs in **demo mode**: agents return sample responses, so every flow can be clicked through without a key. With a key, agents, missions and routines are powered by Claude (`claude-opus-5-5` by default, which `BOTERRA_MODEL` overrides). Server-side refusal fallback is enabled.

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables live agents |
| `AUTH_SECRET` | **Required in production.** Signs session cookies |
| `BOTERRA_MODEL` | Optional model override |
| `BOTERRA_DATA_DIR` | Where the JSON data store is written (default `./.data`) |
| `CRON_SECRET` | Protects `POST /api/cron/routines`, which runs every routine that is due |

## Architecture

```
src/
  lib/catalog/     agents, departments, plans, industry packs, regions, benchmark (pure data)
  lib/ai/          claude.ts (SDK client, streaming), prompts.ts, mission.ts (orchestrator), demo.ts
  lib/db.ts        storage repository (JSON file store; swap for Postgres here)
  lib/auth.ts      password hashing + signed session cookies
  lib/entitlements.ts  plan resolution, trial, agent access, credit metering
  app/(marketing)  public site
  app/(auth)       sign up / log in
  app/onboarding   setup wizard
  app/app          the product (server components + server actions in app/app/actions.ts)
  app/api          chat streaming endpoint, scheduled routines endpoint
```

- **Credits:** chat = 1, routine = 2, mission = 5. They reset monthly.
- **Missions** run in the background with `after()`. The mission page polls until the mission finishes.
- **Expanding to new industries:** add an `IndustryPack` (recommended agents, KPIs, compliance focus, routines).
- **Adding agents:** add an entry to `AGENTS` with its department, focus prompt and minimum plan.

## Production checklist

- Replace the JSON store in `src/lib/db.ts` with Postgres. All access goes through that one file. The JSON store needs a single server process with a writable disk, so it is not suitable for serverless deployments.
- Wire real payments in `changePlan` (`src/app/app/actions.ts`): Stripe for cards, Paystack or Flutterwave for African markets. Apply plan changes from the payment provider's webhook.
- Build the data connectors listed in Settings (QuickBooks, Xero, Stripe, Shopify, Google Workspace, WhatsApp Business…) so agents work on live data.
- Add email verification, password reset and team seats.
- Schedule `POST /api/cron/routines` (for example hourly) with `Authorization: Bearer $CRON_SECRET`.

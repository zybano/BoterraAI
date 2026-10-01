/**
 * Competitive benchmark (researched October 2026). Public positioning only —
 * kept as data so marketing can update it without touching page code.
 */

export interface Competitor {
  name: string;
  positioning: string;
  pricing: string;
  strengths: string;
  gap: string;
}

export const COMPETITORS: Competitor[] = [
  {
    name: "Symphony by Wix",
    positioning: "Multi-agent system for SMBs, coordinated by a central “Maestro” agent.",
    pricing: "Free plan (daily credit cap); paid tiers ≈ $16–$80/mo",
    strengths: "Strong orchestration story, generous free tier, Wix ecosystem.",
    gap: "Centred on marketing, sales and web presence — thin on finance, legal and compliance.",
  },
  {
    name: "Sintra AI",
    positioning: "12 role-based “AI helpers” (social, support, data, copy, SEO…).",
    pricing: "From ≈ $97/mo (discounts on prepay)",
    strengths: "Friendly personas, quick to start, content-heavy use cases.",
    gap: "Helpers work in isolation — no cross-department missions, approvals or audit trail.",
  },
  {
    name: "Motion AI Employees",
    positioning: "Pre-built AI employees plus custom builders, tied to project management.",
    pricing: "Premium tiers above Sintra",
    strengths: "Deep calendar / task automation, custom employees.",
    gap: "Productivity-first; little support for regulated industries or SME back-office.",
  },
  {
    name: "Salesforce Agentforce / Microsoft Copilot Studio",
    positioning: "Enterprise agent platforms reaching down-market.",
    pricing: "Per-conversation / per-seat enterprise pricing",
    strengths: "Powerful, integrated with their suites.",
    gap: "Requires configuration skill and existing CRM/M365 investment — heavy for a 5-person business.",
  },
];

export interface Differentiator {
  title: string;
  body: string;
  icon: string;
}

export const DIFFERENTIATORS: Differentiator[] = [
  {
    icon: "Building",
    title: "A whole company, not a marketing team",
    body: "26 agents across 10 departments — including Finance, Legal, Compliance, HR and Procurement — the back-office that competitors skip.",
  },
  {
    icon: "Network",
    title: "Missions, not chats",
    body: "Give Atlas a goal. It plans a mission, delegates to several departments in parallel and returns one consolidated plan with actions.",
  },
  {
    icon: "ShieldCheck",
    title: "Human-in-the-loop by design",
    body: "Choose Advise, Assist or Autopilot autonomy. Risky actions land in an approval inbox, and every decision is written to an audit trail.",
  },
  {
    icon: "Layers",
    title: "Industry packs",
    body: "One click tunes the swarm for retail, hospitality, clinics, logistics and more — KPIs, regulations and routines included. New verticals ship as data.",
  },
  {
    icon: "Globe",
    title: "Built for emerging & global markets",
    body: "Jurisdiction-aware compliance (GDPR, NDPR, POPIA, CCPA…), multi-currency and mobile-money-ready billing on the roadmap.",
  },
  {
    icon: "Repeat",
    title: "Routines that run themselves",
    body: "Schedule recurring agent work — Monday briefings, cash checks, compliance scans — so the business is monitored even when you're busy.",
  },
];

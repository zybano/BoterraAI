export type PlanId = "free" | "growth" | "scale" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  tagline: string;
  /** AI credits per month. One agent message = 1 credit; a multi-agent mission = 5 credits. */
  credits: number;
  seats: number | null;
  missions: boolean;
  routines: number;
  industryPacks: number | null;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const RANK: Record<PlanId, number> = { free: 0, growth: 1, scale: 2, enterprise: 3 };

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    tagline: "Try a lean agent team, free forever.",
    credits: 150,
    seats: 1,
    missions: false,
    routines: 1,
    industryPacks: 1,
    features: [
      "9 core agents (Atlas, Ledger, Tally, Flow, Nova, Scribe, Haven, Sentinel, Ada)",
      "150 AI credits / month",
      "1 automated routine",
      "1 industry pack",
      "Approval inbox & audit trail",
    ],
    cta: "Start free",
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 49,
    priceYearly: 39,
    tagline: "A full departmental team for growing SMEs.",
    credits: 2000,
    seats: 3,
    missions: true,
    routines: 10,
    industryPacks: 1,
    features: [
      "Everything in Starter",
      "19 agents across 10 departments",
      "2,000 AI credits / month",
      "Multi-agent Missions",
      "10 automated routines",
      "3 team seats",
    ],
    highlighted: true,
    cta: "Start 14-day trial",
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 149,
    priceYearly: 119,
    tagline: "The whole AI workforce — every department.",
    credits: 8000,
    seats: 10,
    missions: true,
    routines: 50,
    industryPacks: null,
    features: [
      "Everything in Growth",
      "All 26 agents, incl. Legal, Risk & Procurement",
      "8,000 AI credits / month",
      "Autopilot autonomy mode",
      "All industry packs",
      "10 team seats & priority support",
    ],
    cta: "Start 14-day trial",
  },
  {
    id: "enterprise",
    name: "Franchise & Enterprise",
    priceMonthly: null,
    priceYearly: null,
    tagline: "Multi-location groups, franchises and partners.",
    credits: 50000,
    seats: null,
    missions: true,
    routines: 500,
    industryPacks: null,
    features: [
      "Everything in Scale",
      "Multiple business units & locations",
      "Custom agents trained on your playbooks",
      "SSO, data residency & DPA",
      "White-label for accountants & agencies",
      "Dedicated success manager",
    ],
    cta: "Talk to sales",
  },
];

export const TRIAL_DAYS = 14;

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id)!;
}

export function planIncludes(plan: PlanId, required: PlanId): boolean {
  return RANK[plan] >= RANK[required];
}

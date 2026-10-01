/**
 * Industry packs are the expansion mechanism: each pack is pure data that
 * tunes the swarm (which agents to recommend, which KPIs to watch, which
 * regulations to track and which routines to run). Adding a new vertical
 * means adding one entry here — no code changes elsewhere.
 */

export interface RoutineTemplate {
  id: string;
  agentId: string;
  name: string;
  cadence: "daily" | "weekly" | "monthly";
  prompt: string;
}

export interface IndustryPack {
  id: string;
  name: string;
  icon: string;
  description: string;
  examples: string[];
  recommendedAgents: string[];
  kpis: string[];
  complianceFocus: string[];
  routines: RoutineTemplate[];
  status: "live" | "beta" | "coming-soon";
}

const coreRoutines = (prefix: string): RoutineTemplate[] => [
  {
    id: `${prefix}-briefing`,
    agentId: "atlas",
    name: "Monday executive briefing",
    cadence: "weekly",
    prompt: "Prepare this week's executive briefing: top 3 priorities, risks to watch, and one growth opportunity, tailored to our business.",
  },
  {
    id: `${prefix}-cash`,
    agentId: "quinn",
    name: "Cash position check",
    cadence: "weekly",
    prompt: "Give me a cash-health checklist for this week: what to review, warning signs, and actions to protect cash flow.",
  },
  {
    id: `${prefix}-compliance`,
    agentId: "sentinel",
    name: "Compliance deadline scan",
    cadence: "monthly",
    prompt: "List the compliance, licence and filing items a business like ours should verify this month, in a checklist.",
  },
];

export const INDUSTRIES: IndustryPack[] = [
  {
    id: "retail",
    name: "Retail & Shops",
    icon: "Store",
    description: "Boutiques, convenience stores, pharmacies and specialty retail.",
    examples: ["Fashion boutique", "Mini-mart", "Pharmacy", "Electronics store"],
    recommendedAgents: ["atlas", "stock", "vendor", "ledger", "tally", "echo", "loyal", "haven", "sentinel"],
    kpis: ["Sales per day", "Gross margin %", "Inventory turnover", "Basket size", "Repeat-customer rate"],
    complianceFocus: ["Sales tax / VAT", "Consumer protection", "Trading licence", "Weights & measures"],
    routines: [
      ...coreRoutines("retail"),
      { id: "retail-reorder", agentId: "stock", name: "Reorder & dead-stock review", cadence: "weekly", prompt: "Give me a weekly reorder and dead-stock review checklist for a retail shop, with clear rules for when to reorder or discount." },
    ],
    status: "live",
  },
  {
    id: "hospitality",
    name: "Restaurants & Hospitality",
    icon: "UtensilsCrossed",
    description: "Restaurants, cafés, bars, caterers, guesthouses and small hotels.",
    examples: ["Café", "Quick-service restaurant", "Caterer", "Boutique hotel"],
    recommendedAgents: ["atlas", "flow", "stock", "vendor", "harper", "penny", "echo", "rank", "haven", "sentinel"],
    kpis: ["Food cost %", "Labour cost %", "Table turns", "Average check", "Online rating"],
    complianceFocus: ["Food hygiene & safety", "Alcohol licensing", "Fire safety", "Staff working hours"],
    routines: [
      ...coreRoutines("hosp"),
      { id: "hosp-reviews", agentId: "haven", name: "Review response round-up", cadence: "daily", prompt: "Draft a framework for responding to today's guest reviews: templates for 5-star, mixed and negative reviews in our voice." },
    ],
    status: "live",
  },
  {
    id: "professional-services",
    name: "Professional Services",
    icon: "Briefcase",
    description: "Agencies, consultancies, accountants, architects and law firms.",
    examples: ["Marketing agency", "Accounting practice", "IT consultancy", "Architecture studio"],
    recommendedAgents: ["atlas", "hunter", "lex", "tally", "quinn", "harper", "ada", "nova", "pulse"],
    kpis: ["Utilisation rate", "Realisation rate", "Pipeline value", "Days sales outstanding", "Client retention"],
    complianceFocus: ["Professional indemnity", "Client data confidentiality", "Engagement letters", "Anti-money-laundering (where applicable)"],
    routines: [
      ...coreRoutines("pro"),
      { id: "pro-pipeline", agentId: "hunter", name: "Pipeline review", cadence: "weekly", prompt: "Run a weekly pipeline review framework: stages, stuck deals, next actions and a forecast for the month." },
    ],
    status: "live",
  },
  {
    id: "ecommerce",
    name: "E-commerce & D2C",
    icon: "ShoppingCart",
    description: "Online stores, marketplace sellers and direct-to-consumer brands.",
    examples: ["Shopify brand", "Marketplace seller", "Subscription box", "Social commerce"],
    recommendedAgents: ["atlas", "nova", "echo", "scribe", "rank", "stock", "haven", "loyal", "shield"],
    kpis: ["Conversion rate", "CAC", "AOV", "ROAS", "Customer lifetime value"],
    complianceFocus: ["Consumer & distance-selling rules", "Data privacy & cookies", "Returns & refunds", "Cross-border VAT / duties"],
    routines: [
      ...coreRoutines("ecom"),
      { id: "ecom-ads", agentId: "nova", name: "Ad performance review", cadence: "weekly", prompt: "Give me a weekly ad-performance review checklist: what to scale, what to pause and what to test next." },
    ],
    status: "live",
  },
  {
    id: "health-wellness",
    name: "Clinics & Wellness",
    icon: "Stethoscope",
    description: "Private clinics, dental practices, pharmacies, gyms and spas.",
    examples: ["Dental clinic", "Physiotherapy practice", "Gym", "Spa"],
    recommendedAgents: ["atlas", "ada", "haven", "shield", "sentinel", "harper", "tally", "rank"],
    kpis: ["Appointment utilisation", "No-show rate", "Revenue per visit", "Patient satisfaction", "Membership churn"],
    complianceFocus: ["Health-data privacy (HIPAA / local equivalents)", "Practitioner licensing", "Clinical waste & safety", "Consent records"],
    routines: [
      ...coreRoutines("health"),
      { id: "health-noshow", agentId: "ada", name: "No-show reduction plan", cadence: "weekly", prompt: "Design reminder and rebooking messages that reduce appointment no-shows, with timing for each message." },
    ],
    status: "beta",
  },
  {
    id: "logistics",
    name: "Logistics & Transport",
    icon: "Truck",
    description: "Couriers, haulage, fleet operators and last-mile delivery.",
    examples: ["Courier service", "Haulage company", "Dispatch rider fleet", "Moving company"],
    recommendedAgents: ["atlas", "flow", "vendor", "quinn", "sentinel", "shield", "harper", "byte"],
    kpis: ["On-time delivery %", "Cost per delivery", "Fleet utilisation", "Fuel cost per km", "Incident rate"],
    complianceFocus: ["Vehicle & driver licensing", "Road safety & insurance", "Hours of service", "Goods-in-transit cover"],
    routines: [
      ...coreRoutines("log"),
      { id: "log-fleet", agentId: "flow", name: "Fleet & safety check", cadence: "weekly", prompt: "Build a weekly fleet maintenance and driver-safety checklist for a small logistics operator." },
    ],
    status: "beta",
  },
  {
    id: "construction",
    name: "Construction & Trades",
    icon: "HardHat",
    description: "Contractors, builders, electricians, plumbers and facility services.",
    examples: ["General contractor", "Electrical contractor", "Plumbing service", "Cleaning company"],
    recommendedAgents: ["atlas", "lex", "vendor", "quinn", "tally", "sentinel", "harper", "hunter"],
    kpis: ["Job margin", "Quote win rate", "Change-order value", "Days to invoice", "Safety incidents"],
    complianceFocus: ["Building permits", "Health & safety on site", "Contractor licensing", "Insurance & bonds"],
    routines: [
      ...coreRoutines("con"),
      { id: "con-quotes", agentId: "hunter", name: "Quote follow-ups", cadence: "weekly", prompt: "Write a quote follow-up cadence for a trades business with message templates for day 2, day 7 and day 14." },
    ],
    status: "beta",
  },
  {
    id: "agribusiness",
    name: "Agribusiness & Food Processing",
    icon: "Wheat",
    description: "Farms, agro-processors, food producers and distributors.",
    examples: ["Poultry farm", "Agro-processor", "Packaged foods", "Produce distributor"],
    recommendedAgents: ["atlas", "stock", "vendor", "quinn", "sentinel", "nova", "hunter"],
    kpis: ["Yield per unit", "Spoilage rate", "Cost per kg", "Offtake contracts", "Working capital days"],
    complianceFocus: ["Food standards certification", "Export documentation", "Environmental permits", "Product labelling"],
    routines: [
      ...coreRoutines("agri"),
      { id: "agri-offtake", agentId: "hunter", name: "Offtaker outreach", cadence: "monthly", prompt: "Plan outreach to new offtakers and distributors for an agribusiness, including pitch points and a target list profile." },
    ],
    status: "coming-soon",
  },
  {
    id: "education",
    name: "Schools & Training",
    icon: "GraduationCap",
    description: "Private schools, tutoring centres, academies and course creators.",
    examples: ["Tutoring centre", "Private school", "Vocational academy", "Online course business"],
    recommendedAgents: ["atlas", "nova", "haven", "harper", "tally", "shield", "sentinel"],
    kpis: ["Enrolment", "Fee collection rate", "Retention", "Class utilisation", "Parent satisfaction"],
    complianceFocus: ["Accreditation", "Child safeguarding", "Student data privacy", "Fee refund policies"],
    routines: coreRoutines("edu"),
    status: "coming-soon",
  },
  {
    id: "general",
    name: "Other / General SME",
    icon: "Building2",
    description: "Any small or medium business — the swarm adapts to you.",
    examples: ["Anything else"],
    recommendedAgents: ["atlas", "ledger", "tally", "flow", "nova", "scribe", "haven", "sentinel", "ada"],
    kpis: ["Revenue", "Gross margin", "Cash on hand", "New customers", "Customer satisfaction"],
    complianceFocus: ["Business registration", "Tax filings", "Employment basics", "Data privacy"],
    routines: coreRoutines("gen"),
    status: "live",
  },
];

export function getIndustry(id: string): IndustryPack {
  return INDUSTRIES.find((i) => i.id === id) ?? INDUSTRIES.find((i) => i.id === "general")!;
}

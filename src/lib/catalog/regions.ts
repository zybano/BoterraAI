export const COUNTRIES: { name: string; currency: string }[] = [
  { name: "Nigeria", currency: "NGN" },
  { name: "Ghana", currency: "GHS" },
  { name: "Kenya", currency: "KES" },
  { name: "South Africa", currency: "ZAR" },
  { name: "Egypt", currency: "EGP" },
  { name: "Rwanda", currency: "RWF" },
  { name: "United States", currency: "USD" },
  { name: "Canada", currency: "CAD" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Ireland", currency: "EUR" },
  { name: "Germany", currency: "EUR" },
  { name: "France", currency: "EUR" },
  { name: "Netherlands", currency: "EUR" },
  { name: "United Arab Emirates", currency: "AED" },
  { name: "Saudi Arabia", currency: "SAR" },
  { name: "India", currency: "INR" },
  { name: "Singapore", currency: "SGD" },
  { name: "Australia", currency: "AUD" },
  { name: "Brazil", currency: "BRL" },
  { name: "Mexico", currency: "MXN" },
  { name: "Other", currency: "USD" },
];

export const TEAM_SIZES = ["Just me", "2–5", "6–20", "21–50", "51–250"];
export const REVENUE_BANDS = ["Pre-revenue", "Under $5k / month", "$5k–$25k / month", "$25k–$100k / month", "$100k+ / month"];

export const GOAL_OPTIONS = [
  "Grow revenue",
  "Improve cash flow",
  "Cut operating costs",
  "Stay compliant",
  "Win more customers",
  "Improve customer service",
  "Hire and manage staff",
  "Get investment-ready",
  "Open a new location",
  "Save my own time",
];

export function currencyFor(country: string): string {
  return COUNTRIES.find((c) => c.name === country)?.currency ?? "USD";
}

const STYLES: Record<string, string> = {
  running: "bg-amber-100 text-amber-800",
  completed: "bg-brand-100 text-brand-800",
  failed: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-brand-100 text-brand-800",
  "auto-approved": "bg-sky-100 text-sky-800",
  rejected: "bg-slate-200 text-slate-700",
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-700",
};

export function StatusBadge({ value, suffix = "" }: { value: string; suffix?: string }) {
  return <span className={`chip ${STYLES[value] ?? "bg-slate-100 text-slate-700"}`}>{value.replace("-", " ")}{suffix}</span>;
}

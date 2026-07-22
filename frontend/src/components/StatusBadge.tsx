const COLORS: Record<string, string> = {
  LEAD: "bg-amber-50 text-amber-700 ring-amber-600/20",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-500/20",
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-500/20",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
  IN: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  OUT: "bg-red-50 text-red-700 ring-red-600/20",
};

const DOT_COLORS: Record<string, string> = {
  LEAD: "bg-amber-500",
  ACTIVE: "bg-emerald-500",
  INACTIVE: "bg-slate-400",
  DRAFT: "bg-slate-400",
  CONFIRMED: "bg-emerald-500",
  CANCELLED: "bg-red-500",
  IN: "bg-emerald-500",
  OUT: "bg-red-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        COLORS[status] ?? "bg-slate-100 text-slate-700 ring-slate-500/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[status] ?? "bg-slate-400"}`} />
      {status}
    </span>
  );
}

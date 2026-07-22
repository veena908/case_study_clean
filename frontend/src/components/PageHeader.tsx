import type { ReactNode } from "react";

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {action}
    </div>
  );
}

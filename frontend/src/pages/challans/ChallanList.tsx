import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import type { Challan, Paginated } from "../../types";

export function ChallanList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<Paginated<Challan> | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = user?.role === "ADMIN" || user?.role === "SALES";

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const status = searchParams.get("status") ?? "";

  useEffect(() => {
    api.get<Paginated<Challan>>("/challans", { params: { page, status: status || undefined } }).then((res) => setResult(res.data));
  }, [page, status]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  return (
    <div>
      <PageHeader
        title="Sales Challans"
        action={
          canCreate && (
            <button onClick={() => navigate("/challans/new")} className="btn-primary">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z" />
              </svg>
              New Challan
            </button>
          )
        }
      />

      <div className="mb-4 flex gap-3">
        <select value={status} onChange={(e) => updateParam("status", e.target.value)} className="select-field w-auto">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Challan #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {result?.data.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/challans/${c.id}`)}
                className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-indigo-50/40"
              >
                <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">{c.challanNumber}</td>
                <td className="px-4 py-3 text-slate-700">{c.customer?.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.totalQuantity}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {result && result.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No challans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result && (
        <Pagination
          page={result.pagination.page}
          totalPages={result.pagination.totalPages}
          onPageChange={(p) => updateParam("page", String(p))}
        />
      )}
    </div>
  );
}

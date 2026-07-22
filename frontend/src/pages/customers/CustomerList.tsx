import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import type { Customer, Paginated } from "../../types";

export function CustomerList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<Paginated<Customer> | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "SALES";

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const status = searchParams.get("status") ?? "";
  const customerType = searchParams.get("customerType") ?? "";

  useEffect(() => {
    api
      .get<Paginated<Customer>>("/customers", {
        params: { page, search: searchParams.get("search") || undefined, status: status || undefined, customerType: customerType || undefined },
      })
      .then((res) => setResult(res.data));
  }, [page, searchParams, status, customerType]);

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
        title="Customers"
        action={
          canEdit && (
            <button onClick={() => navigate("/customers/new")} className="btn-primary">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z" />
              </svg>
              Add Customer
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParam("search", search);
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, mobile, business..."
            className="input-field w-64"
          />
        </form>
        <select value={status} onChange={(e) => updateParam("status", e.target.value)} className="select-field w-auto">
          <option value="">All statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select
          value={customerType}
          onChange={(e) => updateParam("customerType", e.target.value)}
          className="select-field w-auto"
        >
          <option value="">All types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {result?.data.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-indigo-50/40"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.businessName}</td>
                <td className="px-4 py-3 text-slate-600">{c.mobile}</td>
                <td className="px-4 py-3 text-slate-600">{c.customerType}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">{c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
            {result && result.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No customers found.
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

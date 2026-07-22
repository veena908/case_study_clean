import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { useAuth } from "../../auth/AuthContext";
import type { Paginated, Product } from "../../types";

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const lowStock = searchParams.get("lowStock") === "true";

  useEffect(() => {
    api
      .get<Paginated<Product>>("/products", {
        params: { page, search: searchParams.get("search") || undefined, lowStock: lowStock || undefined },
      })
      .then((res) => setResult(res.data));
  }, [page, searchParams, lowStock]);

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
        title="Products"
        action={
          canEdit && (
            <button onClick={() => navigate("/products/new")} className="btn-primary">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z" />
              </svg>
              Add Product
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParam("search", search);
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or SKU..."
            className="input-field w-64"
          />
        </form>
        <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <input
            type="checkbox"
            checked={lowStock}
            onChange={(e) => updateParam("lowStock", e.target.checked ? "true" : "")}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
          />
          Low stock only
        </label>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {result?.data.map((p) => {
              const isLow = p.currentStock <= p.minStockAlert;
              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-indigo-50/40"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 text-slate-600">₹{p.unitPrice}</td>
                  <td className="px-4 py-3">
                    <span className={isLow ? "font-semibold text-red-600" : "text-slate-700"}>{p.currentStock}</span>
                    {isLow && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-inset ring-red-600/20">
                        low
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.location}</td>
                </tr>
              );
            })}
            {result && result.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  No products found.
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

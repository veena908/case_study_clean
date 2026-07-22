import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import type { Customer, Paginated, Product } from "../../types";

interface Row {
  productId: string;
  quantity: string;
}

export function ChallanCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [rows, setRows] = useState<Row[]>([{ productId: "", quantity: "1" }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState<"DRAFT" | "CONFIRMED" | null>(null);

  useEffect(() => {
    api.get<Paginated<Customer>>("/customers", { params: { pageSize: 100 } }).then((res) => setCustomers(res.data.data));
    api.get<Paginated<Product>>("/products", { params: { pageSize: 100 } }).then((res) => setProducts(res.data.data));
  }, []);

  function productById(id: string) {
    return products.find((p) => p.id === id);
  }

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, { productId: "", quantity: "1" }]);
  }

  function removeRow(index: number) {
    setRows((rs) => rs.filter((_, i) => i !== index));
  }

  const total = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const grandTotal = rows.reduce((sum, r) => {
    const p = productById(r.productId);
    return sum + (p ? Number(p.unitPrice) * (Number(r.quantity) || 0) : 0);
  }, 0);

  async function handleSave(status: "DRAFT" | "CONFIRMED") {
    setError("");
    if (!customerId) {
      setError("Select a customer");
      return;
    }
    const items = rows.filter((r) => r.productId && Number(r.quantity) > 0).map((r) => ({ productId: r.productId, quantity: Number(r.quantity) }));
    if (items.length === 0) {
      setError("Add at least one product line");
      return;
    }
    setSubmitting(status);
    try {
      const res = await api.post("/challans", { customerId, items, status });
      navigate(`/challans/${res.data.data.id}`);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="New Sales Challan" />
      <div className="card space-y-5 p-6">
        <div>
          <label htmlFor="challan-customer" className="mb-1 block text-sm font-medium text-slate-700">
            Customer
          </label>
          <select id="challan-customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="select-field">
            <option value="">Select customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.businessName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Products</label>
          <div className="space-y-2">
            {rows.map((row, i) => {
              const product = productById(row.productId);
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
                  <select
                    value={row.productId}
                    onChange={(e) => updateRow(i, { productId: e.target.value })}
                    className="select-field flex-1"
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — stock {p.currentStock}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateRow(i, { quantity: e.target.value })}
                    className="input-field w-24"
                  />
                  <div className="w-24 text-right text-sm font-medium text-slate-600">
                    {product ? `₹${(Number(product.unitPrice) * (Number(row.quantity) || 0)).toFixed(2)}` : "-"}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    disabled={rows.length === 1}
                    className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Remove product line"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={addRow} className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
            + Add product line
          </button>
        </div>

        <div className="flex justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <span className="text-slate-500">Total quantity: {total}</span>
          <span className="font-semibold text-slate-900">Grand total: ₹{grandTotal.toFixed(2)}</span>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">{error}</p>
        )}

        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button onClick={() => handleSave("DRAFT")} disabled={submitting !== null} className="btn-secondary">
            {submitting === "DRAFT" ? "Saving..." : "Save as Draft"}
          </button>
          <button onClick={() => handleSave("CONFIRMED")} disabled={submitting !== null} className="btn-primary">
            {submitting === "CONFIRMED" ? "Saving..." : "Save & Confirm"}
          </button>
          <button
            onClick={() => navigate(-1)}
            disabled={submitting !== null}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

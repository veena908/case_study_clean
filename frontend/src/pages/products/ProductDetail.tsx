import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import type { Product, StockMovement } from "../../types";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [productRes, movementsRes] = await Promise.all([
      api.get<{ data: Product }>(`/products/${id}`),
      api.get<{ data: StockMovement[] }>(`/products/${id}/movements`),
    ]);
    setProduct(productRes.data.data);
    setMovements(movementsRes.data.data);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleMovementSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/stock`, {
        movementType,
        quantityChanged: Number(quantity),
        reason,
      });
      setShowModal(false);
      setQuantity("");
      setReason("");
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) return <div className="text-slate-500">Loading...</div>;
  const isLow = product.currentStock <= product.minStockAlert;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={product.name}
        action={
          canEdit && (
            <div className="flex gap-2">
              <button onClick={() => setShowModal(true)} className="btn-primary py-1.5">
                Record Stock Movement
              </button>
              <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-secondary py-1.5">
                Edit
              </button>
            </div>
          )
        }
      />
      <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
        Back to products
      </Link>

      <div className="card mb-6 grid grid-cols-2 gap-4 p-6">
        <Info label="SKU" value={product.sku} />
        <Info label="Category" value={product.category} />
        <Info label="Unit Price" value={`₹${product.unitPrice}`} />
        <Info label="Location" value={product.location} />
        <Info
          label="Current Stock"
          value={
            <span className={isLow ? "font-semibold text-red-600" : "font-semibold text-slate-900"}>
              {product.currentStock} {isLow && "(below minimum)"}
            </span>
          }
        />
        <Info label="Minimum Stock Alert" value={product.minStockAlert} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Stock Movement Log</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Qty</th>
              <th className="py-2 pr-4">Reason</th>
              <th className="py-2 pr-4">By</th>
              <th className="py-2 pr-4">When</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="py-2.5 pr-4">
                  <StatusBadge status={m.movementType} />
                </td>
                <td className="py-2.5 pr-4 font-medium text-slate-700">{m.quantityChanged}</td>
                <td className="py-2.5 pr-4 text-slate-600">{m.reason}</td>
                <td className="py-2.5 pr-4 text-slate-600">{m.createdBy?.name ?? "-"}</td>
                <td className="py-2.5 pr-4 text-slate-500">{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No stock movements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Record Stock Movement</h3>
            <form onSubmit={handleMovementSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType("IN")}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    movementType === "IN"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  IN
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType("OUT")}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    movementType === "OUT"
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  OUT
                </button>
              </div>
              <input
                type="number"
                min={1}
                required
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
              />
              <input
                required
                placeholder="Reason (e.g. purchase received, damaged stock)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
              />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">{error}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm text-slate-800">{value}</div>
    </div>
  );
}

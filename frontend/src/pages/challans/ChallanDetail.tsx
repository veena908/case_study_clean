import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import type { Challan } from "../../types";

export function ChallanDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const canAct = user?.role === "ADMIN" || user?.role === "SALES";

  const [challan, setChallan] = useState<Challan | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await api.get<{ data: Challan }>(`/challans/${id}`);
    setChallan(res.data.data);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleConfirm() {
    setError("");
    setBusy(true);
    try {
      await api.post(`/challans/${id}/confirm`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    setError("");
    setBusy(true);
    try {
      await api.post(`/challans/${id}/cancel`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!challan) return <div className="text-slate-500">Loading...</div>;

  const grandTotal = challan.items.reduce((sum, i) => sum + Number(i.unitPriceSnapshot) * i.quantity, 0);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={challan.challanNumber}
        action={
          canAct &&
          challan.status === "DRAFT" && (
            <div className="flex gap-2">
              <button onClick={handleConfirm} disabled={busy} className="btn-primary py-1.5">
                Confirm
              </button>
              <button onClick={handleCancel} disabled={busy} className="btn-danger-outline py-1.5">
                Cancel
              </button>
            </div>
          )
        }
      />
      <Link to="/challans" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
        Back to challans
      </Link>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">{error}</p>
      )}

      <div className="card mb-6 grid grid-cols-2 gap-4 p-6">
        <Info label="Customer" value={`${challan.customer?.name} (${challan.customer?.businessName})`} />
        <Info label="Status" value={<StatusBadge status={challan.status} />} />
        <Info label="Total Quantity" value={challan.totalQuantity} />
        <Info label="Created By" value={challan.createdBy?.name ?? "-"} />
        <Info label="Created Date" value={new Date(challan.createdAt).toLocaleString()} />
        {challan.status === "CONFIRMED" && (
          <Info label="Note" value="Confirming this challan reduced stock for each line item." />
        )}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Products</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-4">Product</th>
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">Unit Price</th>
              <th className="py-2 pr-4">Qty</th>
              <th className="py-2 pr-4">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="py-2.5 pr-4 font-medium text-slate-900">{item.productNameSnapshot}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-slate-500">{item.productSkuSnapshot}</td>
                <td className="py-2.5 pr-4 text-slate-600">₹{item.unitPriceSnapshot}</td>
                <td className="py-2.5 pr-4 text-slate-600">{item.quantity}</td>
                <td className="py-2.5 pr-4 font-medium text-slate-700">₹{(Number(item.unitPriceSnapshot) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <span className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900">
            Grand Total: ₹{grandTotal.toFixed(2)}
          </span>
        </div>
      </div>
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

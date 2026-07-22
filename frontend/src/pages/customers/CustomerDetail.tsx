import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";
import type { Customer } from "../../types";

export function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "SALES";
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await api.get<{ data: Customer }>(`/customers/${id}`);
    setCustomer(res.data.data);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/customers/${id}/notes`, { note });
      setNote("");
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!customer) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={customer.name}
        action={
          canEdit && (
            <button onClick={() => navigate(`/customers/${id}/edit`)} className="btn-secondary py-1.5">
              Edit
            </button>
          )
        }
      />
      <Link to="/customers" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0z" clipRule="evenodd" />
        </svg>
        Back to customers
      </Link>

      <div className="card mb-6 grid grid-cols-2 gap-4 p-6">
        <Info label="Business Name" value={customer.businessName} />
        <Info label="Mobile" value={customer.mobile} />
        <Info label="Email" value={customer.email} />
        <Info label="GST Number" value={customer.gstNumber || "-"} />
        <Info label="Customer Type" value={customer.customerType} />
        <Info label="Status" value={<StatusBadge status={customer.status} />} />
        <Info label="Address" value={customer.address} />
        <Info
          label="Follow-up Date"
          value={customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : "-"}
        />
        {customer.notes && <Info label="Notes" value={customer.notes} full />}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Follow-up Notes</h2>
        {canEdit && (
          <form onSubmit={handleAddNote} className="mb-5 flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a follow-up note..."
              className="input-field flex-1"
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              Add
            </button>
          </form>
        )}
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">{error}</p>
        )}
        <ul className="space-y-3">
          {customer.followUpNotes?.map((n) => (
            <li key={n.id} className="rounded-lg border-l-[3px] border-indigo-400 bg-slate-50 py-2 pl-3.5 pr-3">
              <p className="text-sm text-slate-800">{n.note}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {n.createdBy?.name ?? "Unknown"} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
          {(!customer.followUpNotes || customer.followUpNotes.length === 0) && (
            <p className="text-sm text-slate-400">No follow-up notes yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm text-slate-800">{value}</div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import type { Customer } from "../../types";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  address: "",
  status: "LEAD",
  followUpDate: "",
  notes: "",
};

export function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<{ data: Customer }>(`/customers/${id}`).then((res) => {
      const c = res.data.data;
      setForm({
        name: c.name,
        mobile: c.mobile,
        email: c.email,
        businessName: c.businessName,
        gstNumber: c.gstNumber ?? "",
        customerType: c.customerType,
        address: c.address,
        status: c.status,
        followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : "",
        notes: c.notes ?? "",
      });
    });
  }, [id]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const payload = {
      ...form,
      gstNumber: form.gstNumber || undefined,
      followUpDate: form.followUpDate || undefined,
      notes: form.notes || undefined,
    };
    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, payload);
        navigate(`/customers/${id}`);
      } else {
        const res = await api.post("/customers", payload);
        navigate(`/customers/${res.data.data.id}`);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? "Edit Customer" : "Add Customer"} />
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field name="name" label="Customer Name" required value={form.name} onChange={(v) => update("name", v)} />
          <Field name="mobile" label="Mobile Number" required value={form.mobile} onChange={(v) => update("mobile", v)} />
          <Field name="email" label="Email" type="email" required value={form.email} onChange={(v) => update("email", v)} />
          <Field name="businessName" label="Business Name" required value={form.businessName} onChange={(v) => update("businessName", v)} />
          <Field name="gstNumber" label="GST Number (optional)" value={form.gstNumber} onChange={(v) => update("gstNumber", v)} />
          <div>
            <label htmlFor="customerType" className="mb-1 block text-sm font-medium text-slate-700">
              Customer Type
            </label>
            <select
              id="customerType"
              name="customerType"
              value={form.customerType}
              onChange={(e) => update("customerType", e.target.value)}
              className="select-field"
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="select-field"
            >
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <Field name="followUpDate" label="Follow-up Date" type="date" value={form.followUpDate} onChange={(v) => update("followUpDate", v)} />
        </div>
        <Field name="address" label="Address" required value={form.address} onChange={(v) => update("address", v)} />
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className="input-field"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">{error}</p>
        )}
        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : "Save Customer"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </div>
  );
}

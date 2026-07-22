import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import type { Product } from "../../types";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minStockAlert: "0",
  location: "",
};

export function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<{ data: Product }>(`/products/${id}`).then((res) => {
      const p = res.data.data;
      setForm({
        name: p.name,
        sku: p.sku,
        category: p.category,
        unitPrice: p.unitPrice,
        currentStock: String(p.currentStock),
        minStockAlert: String(p.minStockAlert),
        location: p.location,
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
    try {
      if (isEdit) {
        const { currentStock: _currentStock, ...editablePayload } = form;
        await api.put(`/products/${id}`, editablePayload);
        navigate(`/products/${id}`);
      } else {
        const res = await api.post("/products", form);
        navigate(`/products/${res.data.data.id}`);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader title={isEdit ? "Edit Product" : "Add Product"} />
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <Field name="name" label="Product Name" required value={form.name} onChange={(v) => update("name", v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field name="sku" label="SKU / Code" required value={form.sku} onChange={(v) => update("sku", v)} disabled={isEdit} />
          <Field name="category" label="Category" required value={form.category} onChange={(v) => update("category", v)} />
          <Field name="unitPrice" label="Unit Price" type="number" required value={form.unitPrice} onChange={(v) => update("unitPrice", v)} />
          <Field name="location" label="Location / Warehouse" required value={form.location} onChange={(v) => update("location", v)} />
          <Field
            name="currentStock"
            label="Current Stock"
            type="number"
            required
            value={form.currentStock}
            onChange={(v) => update("currentStock", v)}
            disabled={isEdit}
          />
          <Field
            name="minStockAlert"
            label="Minimum Stock Alert"
            type="number"
            required
            value={form.minStockAlert}
            onChange={(v) => update("minStockAlert", v)}
          />
        </div>
        {isEdit && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-inset ring-slate-100">
            Current stock can only be changed via a stock movement (IN/OUT) from the product detail page.
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">{error}</p>
        )}
        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : "Save Product"}
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
  disabled,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  disabled?: boolean;
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
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}

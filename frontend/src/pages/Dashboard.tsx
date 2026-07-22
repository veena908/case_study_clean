import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import type { Paginated, Customer, Product, Challan } from "../types";

interface Summary {
  totalCustomers: number;
  lowStockProducts: number;
  draftChallans: number;
}

const ICONS = {
  customers: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.5 16.5c0-2.9 2.5-5 5.5-5s5.5 2.1 5.5 5v.5h-11v-.5zM13 11.8c1.9.4 3.5 1.8 3.5 4.2v.5h-3v-1.2c0-1.3-.4-2.5-1.1-3.5.2 0 .4 0 .6 0z" />
    </svg>
  ),
  stock: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  challans: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v13a1 1 0 001.5.87L9 15.5l4.5 2.37A1 1 0 0015 17V4a2 2 0 00-2-2H5zm1 4a1 1 0 100 2h6a1 1 0 100-2H6zm0 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
};

export function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    async function load() {
      const [customersRes, lowStockRes, draftRes] = await Promise.all([
        api.get<Paginated<Customer>>("/customers", { params: { pageSize: 1 } }),
        api.get<Paginated<Product>>("/products", { params: { pageSize: 1, lowStock: true } }),
        api.get<Paginated<Challan>>("/challans", { params: { pageSize: 1, status: "DRAFT" } }),
      ]);
      setSummary({
        totalCustomers: customersRes.data.pagination.total,
        lowStockProducts: lowStockRes.data.pagination.total,
        draftChallans: draftRes.data.pagination.total,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Total Customers", value: summary?.totalCustomers, to: "/customers", icon: "customers" as const, tint: "bg-indigo-50 text-indigo-600" },
    { label: "Low Stock Products", value: summary?.lowStockProducts, to: "/products?lowStock=true", icon: "stock" as const, tint: "bg-amber-50 text-amber-600" },
    { label: "Draft Challans", value: summary?.draftChallans, to: "/challans?status=DRAFT", icon: "challans" as const, tint: "bg-slate-100 text-slate-600" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="card group flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.tint}`}>
              {ICONS[card.icon]}
            </div>
            <div>
              <div className="text-sm text-slate-500">{card.label}</div>
              <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{card.value ?? "-"}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

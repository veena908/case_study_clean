import type { ReactElement } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const ICONS: Record<string, ReactElement> = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM11 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 9a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V9z" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.5 16.5c0-2.9 2.5-5 5.5-5s5.5 2.1 5.5 5v.5h-11v-.5zM13 11.8c1.9.4 3.5 1.8 3.5 4.2v.5h-3v-1.2c0-1.3-.4-2.5-1.1-3.5.2 0 .4 0 .6 0z" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M10 1.5l7.5 4.2v8.6L10 18.5l-7.5-4.2V5.7L10 1.5z" fillOpacity="0.25" />
      <path d="M10 1.5l7.5 4.2L10 10 2.5 5.7 10 1.5zM2.5 7.2l7 4v6.9l-7-3.9V7.2zM17.5 7.2v7l-7 3.9v-6.9l7-4z" />
    </svg>
  ),
  challans: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v13a1 1 0 001.5.87L9 15.5l4.5 2.37A1 1 0 0015 17V4a2 2 0 00-2-2H5zm1 4a1 1 0 100 2h6a1 1 0 100-2H6zm0 3a1 1 0 100 2h6a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard", roles: undefined },
  { to: "/customers", label: "Customers", icon: "customers", roles: undefined },
  { to: "/products", label: "Products", icon: "products", roles: undefined },
  { to: "/challans", label: "Sales Challans", icon: "challans", roles: undefined },
];

export function Layout() {
  const { user, logout } = useAuth();
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-slate-950 text-slate-100 flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold">
            M
          </div>
          <div className="text-[15px] font-semibold tracking-tight">Mini ERP + CRM</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-100">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-100">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 p-6 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

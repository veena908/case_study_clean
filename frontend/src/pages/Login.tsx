import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiErrorMessage } from "../api/client";

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-base font-bold text-white shadow-lg shadow-indigo-900/40">
            M
          </div>
          <span className="text-lg font-semibold text-white">Mini ERP + CRM</span>
        </div>
        <div className="card p-8 shadow-xl">
          <h1 className="mb-1 text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mb-6 text-sm text-slate-500">Sign in to continue</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-100">
                {error}
              </p>
            )}
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-2.5">
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <div className="mt-4 rounded-xl bg-white/5 p-4 text-xs text-slate-300 ring-1 ring-inset ring-white/10">
          <p className="mb-1.5 font-medium text-slate-100">Seeded test accounts</p>
          <div className="grid grid-cols-1 gap-0.5 font-mono">
            <p>admin@example.com / Admin@123</p>
            <p>sales@example.com / Sales@123</p>
            <p>warehouse@example.com / Warehouse@123</p>
            <p>accounts@example.com / Accounts@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

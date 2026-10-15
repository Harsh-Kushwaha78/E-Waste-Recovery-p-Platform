
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import { AuthLayout } from "./Register";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const result = await login(form);

    if (result.ok) {
      navigate("/dashboard");
    } else {
      setFormError(result.message);
    }
  }

  return (
    <AuthLayout title="Welcome back">
      <div className="mb-7">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-lime-300/20 bg-lime-300/10 text-2xl text-lime-300">
          ♻
        </div>

        <p className="text-sm leading-6 text-emerald-50/55">
          Sign in to manage your devices, explore component recovery,
          and estimate recoverable value.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <FormField
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {formError && (
          <div
            className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-sm leading-6 text-red-300"
            role="alert"
          >
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-lime-200/30 bg-lime-300 px-5 py-3 text-sm font-bold text-[#10170c] shadow-[0_0_25px_rgba(163,230,53,0.10)] transition duration-200 hover:-translate-y-0.5 hover:bg-lime-200 hover:shadow-[0_0_32px_rgba(163,230,53,0.20)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in to your account"}
          {!loading && (
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-emerald-100/10" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-100/35">
          New to Ecycle?
        </span>
        <div className="h-px flex-1 bg-emerald-100/10" />
      </div>

      <p className="text-center text-sm text-emerald-50/55">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-lime-300 no-underline hover:text-lime-200"
        >
          Create account
        </Link>
      </p>

      <p className="mt-7 text-center text-[11px] leading-5 text-emerald-100/30">
        AI-assisted electronic recovery · Reuse more, waste less
      </p>
    </AuthLayout>
  );
}


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const result = await register(form);

    if (result.ok) {
      navigate("/dashboard");
    } else {
      setFormError(result.message);
    }
  }

  return (
    <AuthLayout title="Create your account">
      <div className="mb-6">
        <p className="text-sm leading-6 text-emerald-50/55">
          Join the circular economy. Track electronic components,
          evaluate recovery potential, and make smarter reuse decisions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          label="Name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <FormField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <FormField
          label="Password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-sm text-red-300"
          >
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-lime-200/30 bg-lime-300 px-5 py-3 font-bold text-[#10170c] shadow-[0_0_25px_rgba(163,230,53,0.10)] transition duration-200 hover:-translate-y-0.5 hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <div className="my-6 h-px bg-emerald-100/10" />

      <p className="text-center text-sm text-emerald-50/55">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-lime-300 no-underline hover:text-lime-200"
        >
          Log in
        </Link>
      </p>

      <p className="mt-6 text-center text-[11px] text-emerald-100/30">
        Identify · Verify · Value · Recover
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({ title, children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b0a] px-4 py-10 text-emerald-50 sm:px-6">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(52,211,153,0.12),transparent_38%),radial-gradient(ellipse_at_90%_85%,rgba(163,230,53,0.08),transparent_35%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(163,230,53,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative w-full max-w-md animate-fade-up rounded-2xl border border-emerald-100/10 bg-[#101713]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-3 text-white no-underline hover:text-lime-300"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-300/20 bg-lime-300/10 text-2xl text-lime-300">
            ♻
          </span>

          <span>
            <span className="block text-sm font-bold tracking-wide">
              ECYCLE<span className="text-lime-300">.AI</span>
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-emerald-100/40">
              Recovery intelligence
            </span>
          </span>
        </Link>

        <div className="mb-7">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
            Your recovery workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
        </div>

        {children}
      </section>
    </main>
  );
}

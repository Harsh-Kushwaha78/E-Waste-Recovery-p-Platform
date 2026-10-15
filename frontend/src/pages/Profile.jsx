// frontend/src/pages/Profile.jsx
//
// Re-fetches /api/users/me using the stored token.
// This verifies the JWT + protect middleware end to end.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.07] py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="break-words text-sm font-medium text-slate-100 sm:text-right">
        {value || "â€”"}
      </dd>
    </div>
  );
}

export default function Profile() {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setProfile(null);

    apiRequest("/api/users/me", { token })
      .then((data) => {
        if (!cancelled) setProfile(data.user);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load your profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const joinedDate =
    profile?.createdAt && !Number.isNaN(new Date(profile.createdAt).getTime())
      ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "â€”";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] px-5 py-7 text-white sm:px-8 sm:py-10">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-lime-300/[0.06] blur-3xl" />
        <div className="absolute -left-40 top-[45%] h-96 w-96 rounded-full bg-emerald-500/[0.05] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/25 bg-lime-300/10 text-lime-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 7.5 9.2 4h5.6L17 7.5M5.2 10l2.1 8h9.4l2.1-8M8 10v5m4-5v5m4-5v5M4 7.5h16"
                />
              </svg>
            </span>

            <span>
              <span className="block text-sm font-bold tracking-[0.18em]">
                ECYCLE<span className="text-lime-300">.AI</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Circular technology
              </span>
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="text-sm text-slate-400 transition hover:text-lime-300"
          >
            â† Back to dashboard
          </Link>
        </header>

        {/* Page heading */}
        <section className="mb-7">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            <span className="h-px w-7 bg-lime-300" />
            Account settings
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your <span className="text-lime-300">profile.</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Your account information, retrieved directly from the backend.
          </p>
        </section>

        {/* Profile card */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101512]/90 shadow-2xl shadow-black/20">
          <div className="border-b border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/[0.08] text-lime-300">
                <ProfileIcon />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold text-white">
                  {loading ? "Loading profileâ€¦" : profile?.name || "Your account"}
                </h2>

                <p className="mt-1 break-words text-sm text-slate-400">
                  {profile?.email || "Account information"}
                </p>

                {profile?.role && (
                  <span className="mt-3 inline-flex rounded-full border border-lime-300/20 bg-lime-300/[0.08] px-3 py-1 text-xs font-semibold capitalize text-lime-200">
                    {profile.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loading && (
              <div className="space-y-4" aria-label="Loading account details">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center justify-between gap-5 border-b border-white/[0.06] pb-4"
                  >
                    <div className="h-3 w-20 rounded bg-white/10" />
                    <div className="h-3 w-36 rounded bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-5"
              >
                <h3 className="font-semibold text-red-200">
                  Could not verify your account
                </h3>
                <p className="mt-2 text-sm leading-6 text-red-300">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setError("");
                    apiRequest("/api/users/me", { token })
                      .then((data) => setProfile(data.user))
                      .catch((err) =>
                        setError(err.message || "Unable to load your profile.")
                      )
                      .finally(() => setLoading(false));
                  }}
                  className="mt-4 rounded-lg border border-red-300/20 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-300/10"
                >
                  Try again
                </button>
              </div>
            )}

            {profile && !loading && (
              <>
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.04] p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-300">
                    âœ“
                  </span>
                  <div>
                    <p className="text-sm font-medium text-emerald-200">
                      Backend profile retrieved
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-400">
                      The profile was fetched using your stored authentication
                      token.
                    </p>
                  </div>
                </div>

                <dl className="divide-y divide-white/[0.06]">
                  <Row label="Full name" value={profile.name} />
                  <Row label="Email address" value={profile.email} />
                  <Row label="Account role" value={profile.role} />
                  <Row label="Member since" value={joinedDate} />
                </dl>
              </>
            )}
          </div>
        </section>

        {/* Navigation shortcuts */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            to="/devices"
            className="group rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-lime-300/25 hover:bg-white/[0.04]"
          >
            <p className="font-semibold text-slate-100 transition group-hover:text-lime-200">
              My devices <span className="ml-1">â†’</span>
            </p>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              Manage devices and inspect recovered components.
            </p>
          </Link>

          <Link
            to="/marketplace"
            className="group rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-lime-300/25 hover:bg-white/[0.04]"
          >
            <p className="font-semibold text-slate-100 transition group-hover:text-lime-200">
              Marketplace <span className="ml-1">â†’</span>
            </p>
            <p className="mt-2 text-sm leading-5 text-slate-500">
              Explore reusable electronic components.
            </p>
          </Link>
        </section>

        <footer className="mt-8 border-t border-white/[0.07] pt-5 text-xs text-slate-600">
          ECYCLE.AI Â· Secure account access
        </footer>
      </div>
    </main>
  );
}

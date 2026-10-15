// frontend/src/App.jsx
//
// Phase 1: adds routing on top of the Phase 0 health check.
// "/" stays the system health check (useful for quick debugging).
// "/register", "/login", "/dashboard" (protected), "/profile" (protected)
// are the new auth flow added in Phase 1.

import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Devices from "./pages/Devices";
import AddDevice from "./pages/AddDevice";
import DeviceDetails from "./pages/DeviceDetails";
import AdminPrices from "./pages/AdminPrices";
import Marketplace from "./pages/Marketplace";
import ListingDetails from "./pages/ListingDetails";
import MyListings from "./pages/MyListings";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { API_BASE_URL } from "./lib/api";


function HealthCheck() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`Backend responded with ${res.status}`);
        return res.json();
      })
      .then(setHealth)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const services = health
    ? [
        {
          name: "Backend API",
          detail: "Express service",
          ok: health.status === "ok",
        },
        {
          name: "MongoDB",
          detail: "Database",
          ok: Boolean(health.database?.connected),
        },
        {
          name: "ML Valuation",
          detail: health.mlService?.modelVersion
            ? `Model ${health.mlService.modelVersion}`
            : "Price prediction service",
          ok: Boolean(health.mlService?.reachable),
        },
        {
          name: "Computer Vision",
          detail: health.cvService?.mode || "Image detection service",
          ok: Boolean(health.cvService?.reachable),
        },
      ]
    : [];

  const allHealthy =
    services.length > 0 && services.every((service) => service.ok);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] px-5 py-8 text-emerald-50 sm:px-8 sm:py-12">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(52,211,153,0.12),transparent_35%),radial-gradient(ellipse_at_90%_80%,rgba(163,230,53,0.08),transparent_35%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(163,230,53,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 border-b border-emerald-100/10 pb-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-emerald-50 no-underline hover:text-lime-300"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-300/25 bg-lime-300/10 text-2xl text-lime-300">
              ♻
            </div>

            <div>
              <p className="m-0 text-base font-bold tracking-wide">
                ECYCLE<span className="text-lime-300">.AI</span>
              </p>
              <p className="m-0 mt-1 text-[10px] uppercase tracking-[0.22em] text-emerald-100/45">
                Recovery intelligence
              </p>
            </div>
          </Link>

          <span className="hidden items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/5 px-3 py-2 text-xs text-emerald-100/70 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            LOCAL ENVIRONMENT
          </span>
        </header>

        {/* Main content */}
        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="animate-fade-up">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/5 px-3 py-1.5 text-xs font-medium tracking-wide text-lime-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-300" />
              AI-POWERED CIRCULAR ECONOMY
            </p>

            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
              Waste less.
              <br />
              <span className="bg-gradient-to-r from-lime-200 via-lime-400 to-emerald-400 bg-clip-text text-transparent">
                Recover more.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-emerald-50/55 sm:text-base">
              Identify electronic components, verify their condition,
              estimate recoverable value, and make smarter reuse and
              recycling decisions.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#10170c] no-underline shadow-[0_0_30px_rgba(163,230,53,0.12)] hover:-translate-y-0.5 hover:bg-lime-200"
              >
                Enter platform <span aria-hidden="true">→</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center rounded-xl border border-emerald-100/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-emerald-50 no-underline hover:border-lime-300/30 hover:bg-white/[0.06]"
              >
                Create account
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-emerald-50/45">
              <span>01 / Detect components</span>
              <span>02 / Estimate value</span>
              <span>03 / Recover resources</span>
            </div>
          </div>

          {/* Live service health */}
          <div className="animate-fade-up rounded-2xl border border-emerald-100/10 bg-[#101713]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/45">
                  System overview
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Service health
                </h2>
              </div>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  loading
                    ? "border-amber-300/20 bg-amber-300/5 text-amber-200"
                    : error || !allHealthy
                      ? "border-amber-300/20 bg-amber-300/5 text-amber-200"
                      : "border-emerald-300/20 bg-emerald-300/5 text-emerald-200"
                }`}
              >
                {loading
                  ? "Checking..."
                  : error
                    ? "Connection error"
                    : allHealthy
                      ? "All systems ready"
                      : "Partial availability"}
              </span>
            </div>

            {loading && (
              <p className="mt-6 rounded-xl border border-emerald-100/10 bg-white/[0.02] p-4 text-sm text-emerald-50/60">
                Connecting to platform services...
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"
              >
                <p className="font-semibold">Backend unavailable</p>
                <p className="mt-2 break-words text-red-100/70">{error}</p>
                <p className="mt-2 text-xs text-red-100/60">
                  Check that the backend is running at {API_BASE_URL}.
                </p>
              </div>
            )}

            {health && (
              <div className="mt-6 space-y-3">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100/[0.07] bg-white/[0.025] p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-emerald-50/90">
                        {service.name}
                      </p>
                      <p className="mt-1 text-xs text-emerald-50/40">
                        {service.detail}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-2 text-xs font-semibold ${
                        service.ok ? "text-emerald-300" : "text-amber-300"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          service.ok ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      {service.ok ? "Online" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 border-t border-emerald-100/10 pt-4">
              {health?.database?.note && (
                <p className="text-xs leading-5 text-emerald-50/40">
                  {health.database.note}
                </p>
              )}

              {health?.timestamp && (
                <p className="mt-2 text-[11px] text-emerald-50/30">
                  Last checked: {new Date(health.timestamp).toLocaleString()}
                </p>
              )}

              {health?.mlService?.isDemoData && (
                <p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-5 text-amber-200/80">
                  Valuation uses synthetic demo data. Predictions are not
                  verified market prices.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-2 border-t border-emerald-100/10 pt-5 text-xs text-emerald-50/35 sm:flex-row">
          <span>ECYCLE.AI · Electronic resource recovery</span>
          <span>Component intelligence for a circular future</span>
        </footer>
      </div>
    </main>
  );
}

function StatusRow({ label, ok, okText, badText = "Down" }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={ok ? "text-emerald-300" : "text-amber-300"}>
        {ok ? okText : badText}
      </span>
    </div>
  );
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<HealthCheck />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <Devices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices/new"
        element={
          <ProtectedRoute>
            <AddDevice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices/:id"
        element={
          <ProtectedRoute>
            <DeviceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/prices"
        element={
          <ProtectedRoute>
            <AdminPrices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/mine"
        element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/:id"
        element={
          <ProtectedRoute>
            <ListingDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

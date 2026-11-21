// frontend/src/App.jsx
//
// Root application component.
// "/" provides the cinematic 3D e-waste recovery hero experience and live system health.
// All application routes (/login, /register, /dashboard, /devices, /marketplace, /orders, /admin, etc.) are mounted here.

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
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import Hero3D from "./components/hero3d/Hero3D";
import { API_BASE_URL } from "./lib/api";

function LandingPage() {
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
          detail: "Express REST engine",
          ok: health.status === "ok",
        },
        {
          name: "MongoDB",
          detail: "Database persistence",
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
          detail: health.cvService?.mode || "YOLO11n component detection",
          ok: Boolean(health.cvService?.reachable),
        },
      ]
    : [];

  const allHealthy =
    services.length > 0 && services.every((service) => service.ok);

  return (
    <main className="relative min-h-screen bg-[#080b0a] text-emerald-50">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full border-b border-emerald-100/10 bg-[#080b0a]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="flex items-center gap-3 text-emerald-50 no-underline hover:text-lime-300 transition"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/25 bg-lime-300/10 text-xl text-lime-300">
              ♻
            </div>
            <div>
              <p className="m-0 text-sm font-bold tracking-wide">
                ECYCLE<span className="text-lime-300">.AI</span>
              </p>
              <p className="m-0 text-[9px] uppercase tracking-[0.22em] text-emerald-100/45">
                Recovery intelligence
              </p>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="flex items-center gap-3 sm:gap-6 text-xs font-semibold">
            <Link
              to="/marketplace"
              className="hidden sm:inline text-slate-300 hover:text-lime-300 transition"
            >
              Marketplace
            </Link>
            <Link
              to="/devices"
              className="hidden sm:inline text-slate-300 hover:text-lime-300 transition"
            >
              My Devices
            </Link>
            <Link
              to="/orders"
              className="hidden md:inline text-slate-300 hover:text-lime-300 transition"
            >
              Orders & Pickups
            </Link>
            <Link
              to="/login"
              className="text-slate-300 hover:text-white transition px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-lime-300/10 border border-lime-300/30 px-3.5 py-1.5 font-bold text-lime-300 transition hover:bg-lime-300 hover:text-black"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* 3D Hero Experience */}
      <Hero3D />

      {/* Live Service Health & Architecture Overview */}
      <section className="relative z-10 border-t border-white/[0.08] bg-[#0c120f]/90 py-16 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-lime-300">
                SYSTEM DIAGNOSTICS & STATUS
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Microservice Architecture & Live Health
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Real-time operational status for all components running in the local ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                  loading
                    ? "border-amber-300/20 bg-amber-300/5 text-amber-200"
                    : error || !allHealthy
                      ? "border-amber-300/20 bg-amber-300/5 text-amber-200"
                      : "border-emerald-300/20 bg-emerald-300/5 text-emerald-200"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    loading
                      ? "bg-amber-400 animate-pulse"
                      : error || !allHealthy
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                />
                {loading
                  ? "Verifying services..."
                  : error
                    ? "Backend offline"
                    : allHealthy
                      ? "All microservices active"
                      : "Partial availability"}
              </span>
            </div>
          </div>

          {/* Service Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading &&
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse h-28"
                />
              ))}

            {!loading &&
              services.map((service) => (
                <div
                  key={service.name}
                  className="rounded-xl border border-white/[0.08] bg-[#121c17]/70 p-5 shadow-lg backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{service.name}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
                        service.ok ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          service.ok ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      {service.ok ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{service.detail}</p>
                </div>
              ))}
          </div>

          {/* Diagnostic Notes */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-4 text-xs text-slate-500">
            {health?.database?.note && <span>Database note: {health.database.note}</span>}
            {health?.timestamp && (
              <span>Last ping: {new Date(health.timestamp).toLocaleTimeString()}</span>
            )}
            {health?.mlService?.isDemoData && (
              <span className="text-amber-300/80">
                Notice: ML uses calibrated demo dataset for local evaluation.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#080b0a] py-8 text-xs text-slate-500 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4">
          <p>© ECYCLE.AI · Intelligent Circular Hardware Recovery & Reclaim</p>
          <div className="flex items-center gap-6">
            <Link to="/marketplace" className="hover:text-lime-300 transition">
              Marketplace
            </Link>
            <Link to="/devices" className="hover:text-lime-300 transition">
              Diagnostics
            </Link>
            <Link to="/orders" className="hover:text-lime-300 transition">
              Pickups
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

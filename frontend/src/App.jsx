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
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-800">
          E-Waste Recovery Platform
        </h1>
        <p className="text-slate-500 mt-1 mb-6">System Health Check</p>

        {loading && <p className="text-slate-400">Checking backend...</p>}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            <p className="font-medium">Could not reach the backend.</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-red-500">
              Is the backend running on {API_BASE_URL}? Run{" "}
              <code className="bg-red-100 px-1 rounded">npm run dev</code> inside{" "}
              <code className="bg-red-100 px-1 rounded">backend/</code>.
            </p>
          </div>
        )}

        {health && (
          <div className="space-y-3">
            <StatusRow label="Backend server" ok={health.status === "ok"} okText="Running" />
            <StatusRow
              label="MongoDB"
              ok={health.database.connected}
              okText="Connected"
              badText="Not connected"
            />
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              {health.database.note}
            </p>
            <p className="text-xs text-slate-400">
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 flex gap-4 text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, ok, okText, badText = "Down" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-700">{label}</span>
      <span
        className={`inline-flex items-center gap-2 text-sm font-medium px-2.5 py-1 rounded-full ${
          ok ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-amber-500"}`} />
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

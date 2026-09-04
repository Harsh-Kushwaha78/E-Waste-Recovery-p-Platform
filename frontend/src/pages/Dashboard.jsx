// frontend/src/pages/Dashboard.jsx
//
// Phase 2: now links into device management. Real stats (recoverable
// value, components recycled, charts) come in later phases per the
// master plan (section 38) once valuation exists.

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <nav className="flex justify-between items-center mb-8">
          <span className="font-semibold text-slate-800">E-Waste Platform</span>
          <div className="flex gap-4 items-center text-sm">
            <Link to="/marketplace" className="text-slate-600 hover:text-slate-900">
              Marketplace
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="text-slate-600 hover:text-slate-900">
                Admin
              </Link>
            )}
            <Link to="/profile" className="text-slate-600 hover:text-slate-900">
              Profile
            </Link>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Log out
            </button>
          </div>
        </nav>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">
            Welcome, {user?.name}
          </h1>
          <p className="text-slate-500 mb-6">
            {user?.email}
            {user?.role === "admin" && (
              <span className="ml-2 text-xs bg-slate-800 text-white px-2 py-0.5 rounded-full">
                admin
              </span>
            )}
          </p>

          <Link
            to="/devices"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            Go to your devices &rarr;
          </Link>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm mt-6">
            <p className="font-medium">Recoverable-value stats coming in later phases.</p>
            <p className="mt-1">
              Once functional testing (Phase 3), price data (Phase 4-5),
              and the valuation engine (Phase 8) exist, this dashboard
              will show total recoverable value, components recovered,
              and valuation history charts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

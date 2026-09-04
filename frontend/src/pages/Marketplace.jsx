// frontend/src/pages/Marketplace.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { browseListings } from "../lib/listings";
import { COMPONENT_TYPES, WORKING_STATUSES } from "../lib/devices";
import StatusBadge from "../components/StatusBadge";

export default function Marketplace() {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ componentType: "", workingStatus: "", sort: "" });

  useEffect(() => {
    refresh();
  }, [filters]);

  function refresh() {
    setLoading(true);
    browseListings(token, filters)
      .then((data) => setListings(data.listings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
            &larr; Dashboard
          </Link>
          <Link to="/marketplace/mine" className="text-sm text-slate-600 hover:text-slate-900">
            My listings
          </Link>
        </nav>

        <h1 className="text-2xl font-semibold text-slate-800 mb-4">Marketplace</h1>

        <div className="flex gap-2 mb-4">
          <select
            value={filters.componentType}
            onChange={(e) => setFilters({ ...filters, componentType: e.target.value })}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1.5"
          >
            <option value="">All types</option>
            {COMPONENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filters.workingStatus}
            onChange={(e) => setFilters({ ...filters, workingStatus: e.target.value })}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1.5"
          >
            <option value="">Any status</option>
            {WORKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1.5"
          >
            <option value="">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {loading && <p className="text-slate-400">Loading listings...</p>}

        {!loading && listings.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No listings match these filters.</p>
          </div>
        )}

        <div className="grid gap-3">
          {listings.map((l) => (
            <Link
              key={l._id}
              to={`/marketplace/${l._id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-blue-300 transition block"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-slate-800">{l.title}</h2>
                  <p className="text-sm text-slate-500">
                    {l.component?.brand} {l.component?.model} {l.component?.capacity ? `(${l.component.capacity})` : ""}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={l.component?.workingStatus} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{l.currency} {l.price}</p>
                  <p className="text-xs text-slate-400">by {l.seller?.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

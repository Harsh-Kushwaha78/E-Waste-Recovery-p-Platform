// frontend/src/pages/AdminPrices.jsx
//
// Admin-only price data management: manual entry + CSV import, both
// re-using the same backend validation, and both clearly showing
// source/date on every record (never presented as "live" data - see
// master prompt section 18).

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listPrices, createPrice, deletePrice, importPricesCsv } from "../lib/prices";
import { COMPONENT_TYPES } from "../lib/devices";

export default function AdminPrices() {
  const { user, token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    listPrices(token)
      .then((data) => setRecords(data.records))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id) {
    if (!confirm("Delete this price record?")) return;
    try {
      await deletePrice(token, id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportResult(null);
    setError(null);
    try {
      const result = await importPricesCsv(token, file);
      setImportResult(result);
      refresh();
    } catch (err) {
      setError(err.message);
      if (err.data) setImportResult(err.data);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600">
            This page requires admin access. Your account role is{" "}
            <strong>{user.role}</strong>.
          </p>
          <Link to="/dashboard" className="text-blue-600 hover:underline text-sm mt-3 inline-block">
            &larr; Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          &larr; Back to dashboard
        </Link>

        <div className="flex justify-between items-center mt-4 mb-4">
          <h1 className="text-2xl font-semibold text-slate-800">Price Data (Admin)</h1>
          <div className="flex gap-2">
            <label className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer">
              Import CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              {showAddForm ? "Cancel" : "+ Add Record"}
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4">
          This is admin-entered / CSV-imported historical price data, not
          live market data. Live market retrieval is a separate system
          (Phase 7) not built yet.
        </div>

        {importResult && (
          <div
            className={`rounded-lg p-4 mb-4 text-sm ${
              importResult.rejectedCount > 0
                ? "bg-amber-50 border border-amber-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <p className="font-medium">{importResult.message}</p>
            {importResult.errors && importResult.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs text-red-700">
                {importResult.errors.map((e, i) => (
                  <li key={i}>
                    {e.row ? `Row ${e.row}: ` : ""}
                    {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}

        {showAddForm && (
          <AddPriceForm
            token={token}
            onCreated={() => {
              setShowAddForm(false);
              refresh();
            }}
          />
        )}

        {loading && <p className="text-slate-400">Loading...</p>}

        {!loading && records.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No price records yet.</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {records.map((r) => (
            <div
              key={r._id}
              className="flex justify-between items-center p-4 border-b border-slate-100 last:border-0 text-sm"
            >
              <div>
                <span className="font-medium text-slate-800">{r.componentType}</span>
                {r.brand ? ` · ${r.brand}` : ""} {r.model || ""}
                {r.capacity ? ` (${r.capacity})` : ""}
                <div className="text-xs text-slate-400 mt-0.5">
                  {r.source} · {new Date(r.observedDate).toLocaleDateString()}
                  {r.importBatch ? " · CSV import" : ""}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-800">
                  {r.currency} {r.price}
                </span>
                <button
                  onClick={() => handleDelete(r._id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddPriceForm({ token, onCreated }) {
  const [form, setForm] = useState({
    componentType: "ssd",
    brand: "",
    model: "",
    capacity: "",
    condition: "unknown",
    price: "",
    source: "",
    observedDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createPrice(token, { ...form, price: Number(form.price) });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
      <div className="grid grid-cols-3 gap-3 mb-3">
        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Component type</span>
          <select
            value={form.componentType}
            onChange={(e) => setForm({ ...form, componentType: e.target.value })}
            className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1.5"
          >
            {COMPONENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <input
          type="text" placeholder="Brand"
          value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="text-sm rounded-lg border border-slate-300 px-2 py-1.5"
        />
        <input
          type="text" placeholder="Model"
          value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}
          className="text-sm rounded-lg border border-slate-300 px-2 py-1.5"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <input
          type="text" placeholder="Capacity (e.g. 512GB)"
          value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          className="text-sm rounded-lg border border-slate-300 px-2 py-1.5"
        />
        <input
          type="number" required placeholder="Price (INR)"
          value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="text-sm rounded-lg border border-slate-300 px-2 py-1.5"
        />
        <input
          type="date" required
          value={form.observedDate} onChange={(e) => setForm({ ...form, observedDate: e.target.value })}
          className="text-sm rounded-lg border border-slate-300 px-2 py-1.5"
        />
      </div>

      <input
        type="text" required placeholder="Source (e.g. 'OLX listing', 'Admin estimate')"
        value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
        className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1.5 mb-3"
      />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="submit" disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded-lg"
      >
        {submitting ? "Adding..." : "Add Price Record"}
      </button>
    </form>
  );
}

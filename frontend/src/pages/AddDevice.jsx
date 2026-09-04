// frontend/src/pages/AddDevice.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createDevice, DEVICE_CATEGORIES } from "../lib/devices";
import FormField from "../components/FormField";

const CATEGORY_LABELS = {
  laptop: "Laptop",
  desktop: "Desktop",
  smartphone: "Smartphone",
  tablet: "Tablet",
  monitor: "Monitor",
  printer: "Printer",
  television: "Television",
  other: "Other",
};

export default function AddDevice() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "laptop",
    brand: "",
    model: "",
    ageYears: "",
    description: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        ageYears: form.ageYears === "" ? undefined : Number(form.ageYears),
      };
      const data = await createDevice(token, payload);
      navigate(`/devices/${data.device._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-lg mx-auto">
        <Link to="/devices" className="text-sm text-blue-600 hover:underline">
          &larr; Back to devices
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-4">
          <h1 className="text-xl font-semibold text-slate-800 mb-6">Add a Device</h1>

          <form onSubmit={handleSubmit}>
            <FormField
              label="Device name"
              type="text"
              required
              placeholder="e.g. Dell Inspiron 15"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label className="block mb-4">
              <span className="block text-sm font-medium text-slate-700 mb-1">Category</span>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c] || c}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Brand"
                type="text"
                placeholder="e.g. Dell"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
              <FormField
                label="Model"
                type="text"
                placeholder="e.g. Inspiron 15 3000"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>

            <FormField
              label="Age (years)"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 4"
              value={form.ageYears}
              onChange={(e) => setForm({ ...form, ageYears: e.target.value })}
            />

            <label className="block mb-4">
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Description (optional)
              </span>
              <textarea
                rows={3}
                placeholder="What's wrong with it? Any context that helps."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition"
            >
              {submitting ? "Adding..." : "Add Device"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

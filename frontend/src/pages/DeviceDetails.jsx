// frontend/src/pages/DeviceDetails.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getDevice,
  deleteDevice,
  createComponent,
  deleteComponent,
  COMPONENT_TYPES,
  WORKING_STATUSES,
} from "../lib/devices";
import StatusBadge from "../components/StatusBadge";
import ComponentTesting from "../components/ComponentTesting";
import ComponentPrediction from "../components/ComponentPrediction";
import ImageAnalysis from "../components/ImageAnalysis";
import ComponentMarketData from "../components/ComponentMarketData";
import { createListing } from "../lib/listings";
import RecyclingGuidance from "../components/RecyclingGuidance";
import ValuationReport from "../components/ValuationReport";
import ValuationHistoryChart from "../components/ValuationHistoryChart";
import DeviceChat from "../components/DeviceChat";

const TYPE_LABELS = {
  ram: "RAM",
  ssd: "SSD",
  hdd: "HDD",
  battery: "Battery",
  motherboard: "Motherboard",
  display: "Display",
  gpu: "GPU",
  cooling_fan: "Cooling Fan",
  wifi_card: "Wi-Fi Card",
  charger: "Charger",
  keyboard: "Keyboard",
  camera: "Camera",
  speaker: "Speaker",
  other: "Other",
};

export default function DeviceDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [valuationRefreshKey, setValuationRefreshKey] = useState(0);

  useEffect(() => {
    refresh();
  }, [id]);

  function refresh() {
    setLoading(true);
    getDevice(token, id)
      .then((data) => {
        setDevice(data.device);
        setComponents(data.components);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleDeleteDevice() {
    if (!confirm(`Delete "${device.name}" and all its components? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteDevice(token, id);
      navigate("/devices");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteComponent(componentId) {
    if (!confirm("Delete this component?")) return;
    try {
      await deleteComponent(token, componentId);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-6 text-slate-400">Loading...</div>;
  }

  if (error && !device) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/devices" className="text-sm text-blue-600 hover:underline">
            &larr; Back to devices
          </Link>
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/devices" className="text-sm text-blue-600 hover:underline">
          &larr; Back to devices
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{device.name}</h1>
              <p className="text-slate-500 mt-1">
                {device.brand} {device.model}
                {device.ageYears != null ? ` · ${device.ageYears} yr(s) old` : ""}
              </p>
            </div>
            <button
              onClick={handleDeleteDevice}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete device
            </button>
          </div>

          {device.description && (
            <p className="text-slate-600 mt-4 text-sm border-t border-slate-100 pt-4">
              {device.description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Components ({components.length})
          </h2>
          <button
            onClick={() => setShowAddComponent((v) => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {showAddComponent ? "Cancel" : "+ Add Component"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}

        <ValuationReport
          deviceId={id}
          onGenerated={() => setValuationRefreshKey((k) => k + 1)}
        />

        <ValuationHistoryChart deviceId={id} refreshKey={valuationRefreshKey} />

        <DeviceChat deviceId={id} />

        <ImageAnalysis deviceId={id} onComponentAdded={refresh} />

        {showAddComponent && (
          <AddComponentForm
            deviceId={id}
            token={token}
            onCreated={() => {
              setShowAddComponent(false);
              refresh();
            }}
          />
        )}

        {components.length === 0 && !showAddComponent && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">
              No components recorded yet. Add the parts you want to evaluate
              (RAM, SSD, battery, etc).
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {components.map((c) => (
            <ComponentCard
              key={c._id}
              component={c}
              token={token}
              onDelete={() => handleDeleteComponent(c._id)}
              onUpdated={refresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AddComponentForm({ deviceId, token, onCreated }) {
  const [form, setForm] = useState({
    type: "ram",
    brand: "",
    model: "",
    capacity: "",
    condition: "unknown",
    workingStatus: "NOT_TESTED",
    health: "",
    notes: "",
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
        health: form.health === "" ? undefined : Number(form.health),
      };
      await createComponent(token, deviceId, payload);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4"
    >
      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Type</span>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {COMPONENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t] || t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">Capacity</span>
          <input
            type="text"
            placeholder="e.g. 512GB"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          placeholder="Brand (optional)"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Model (optional)"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Condition</span>
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {["unknown", "excellent", "good", "fair", "poor"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Working status</span>
          <select
            value={form.workingStatus}
            onChange={(e) => setForm({ ...form, workingStatus: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {WORKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Health %</span>
          <input
            type="number"
            min="0"
            max="100"
            value={form.health}
            onChange={(e) => setForm({ ...form, health: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded-lg"
      >
        {submitting ? "Adding..." : "Add Component"}
      </button>
    </form>
  );
}

function ComponentCard({ component, token, onDelete, onUpdated }) {
  const [current, setCurrent] = useState(component);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-slate-800">
            {TYPE_LABELS[current.type] || current.type}
            {current.capacity ? ` · ${current.capacity}` : ""}
          </h3>
          <p className="text-sm text-slate-500">
            {current.brand} {current.model}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <StatusBadge status={current.workingStatus} />
        {current.health != null && (
          <span className="text-xs text-slate-500">Health: {current.health}%</span>
        )}
        <span className="text-xs text-slate-400">Condition: {current.condition}</span>
      </div>

      <ComponentTesting
        component={current}
        onComponentUpdated={(updatedComponent) => {
          setCurrent(updatedComponent);
          onUpdated();
        }}
      />

      <ComponentPrediction componentId={current._id} />
      <ComponentMarketData componentType={current.type} brand={current.brand} />
      <ListForSale component={current} />
      <RecyclingGuidance componentType={current.type} />
    </div>
  );
}

function ListForSale({ component }) {
  const { token } = useAuth();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(`${component.type} - ${component.brand || ""}`.trim());
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createListing(token, { componentId: component._id, title, price: Number(price) });
      setDone(true);
      setShow(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (component.workingStatus === "NOT_TESTED") {
    return (
      <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
        Run a test before listing this component for sale.
      </p>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      {done ? (
        <p className="text-xs text-green-700">Listed for sale. <a href="/marketplace/mine" className="underline">View my listings</a></p>
      ) : (
        <button onClick={() => setShow((v) => !v)} className="text-xs text-blue-600 hover:underline font-medium">
          {show ? "Cancel" : "List for sale"}
        </button>
      )}
      {show && (
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="flex-1 text-xs rounded-lg border border-slate-300 px-2 py-1"
          />
          <input
            type="number" placeholder="Price ₹" value={price} onChange={(e) => setPrice(e.target.value)} required
            className="w-24 text-xs rounded-lg border border-slate-300 px-2 py-1"
          />
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg">
            {submitting ? "..." : "List"}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

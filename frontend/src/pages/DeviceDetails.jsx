
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

const inputClass =
  "w-full rounded-xl border border-emerald-100/15 bg-[#0b100d] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-emerald-100/30 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10";

const labelClass =
  "mb-1.5 block text-xs font-medium text-emerald-50/65";

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
    // Refresh when the selected device changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function refresh() {
    setLoading(true);
    setError(null);

    getDevice(token, id)
      .then((data) => {
        setDevice(data.device);
        setComponents(data.components);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleDeleteDevice() {
    if (
      !confirm(
        `Delete "${device.name}" and all its components? This cannot be undone.`
      )
    ) {
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b0a] text-emerald-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-100/10 border-t-lime-300" />
          <p className="mt-4 text-sm text-emerald-50/55">
            Loading device intelligence...
          </p>
        </div>
      </main>
    );
  }

  if (error && !device) {
    return (
      <main className="min-h-screen bg-[#080b0a] px-5 py-10 text-emerald-50">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/devices"
            className="text-sm text-lime-300 no-underline hover:text-lime-200"
          >
            ← Back to devices
          </Link>
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5 text-red-200"
          >
            <h1 className="font-semibold">Unable to load this device</h1>
            <p className="mt-2 text-sm">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 rounded-lg border border-red-300/20 px-4 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const verifiedCount = components.filter(
    (component) => component.workingStatus === "VERIFIED_WORKING"
  ).length;

  const testedCount = components.filter(
    (component) => component.workingStatus !== "NOT_TESTED"
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] text-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(52,211,153,0.09),transparent_35%),radial-gradient(ellipse_at_95%_35%,rgba(163,230,53,0.05),transparent_35%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
        {/* Navigation */}
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100/10 pb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-white no-underline"
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

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              to="/dashboard"
              className="text-emerald-50/60 no-underline hover:text-lime-300"
            >
              Dashboard
            </Link>
            <Link
              to="/devices"
              className="text-lime-300 no-underline"
            >
              Devices
            </Link>
            <Link
              to="/marketplace"
              className="text-emerald-50/60 no-underline hover:text-lime-300"
            >
              Marketplace
            </Link>
          </div>
        </nav>

        {/* Device hero */}
        <section className="flex flex-col justify-between gap-6 py-9 sm:py-12 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <Link
              to="/devices"
              className="text-xs text-emerald-100/45 no-underline hover:text-lime-300"
            >
              ← All devices
            </Link>

            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/[0.07] text-3xl text-lime-300">
                ◈
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                  DEVICE RECOVERY PROFILE
                </p>
                <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {device.name}
                </h1>
                <p className="mt-2 break-words text-sm text-emerald-50/50">
                  {[device.brand, device.model].filter(Boolean).join(" · ") ||
                    "Brand and model not specified"}
                  {device.ageYears != null
                    ? ` · ${device.ageYears} year(s) old`
                    : ""}
                </p>
              </div>
            </div>

            {device.description && (
              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-emerald-50/55">
                {device.description}
              </p>
            )}
          </div>

          <button
            onClick={handleDeleteDevice}
            className="self-start rounded-xl border border-red-400/20 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-400/[0.07]"
          >
            Delete device
          </button>
        </section>

        {/* Real component metrics */}
        <section className="mb-10 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="RECORDED COMPONENTS"
            value={components.length}
            description="Components linked to this device"
            icon="◇"
          />
          <MetricCard
            label="TESTED COMPONENTS"
            value={testedCount}
            description="Not marked as NOT_TESTED"
            icon="⌁"
          />
          <MetricCard
            label="VERIFIED WORKING"
            value={verifiedCount}
            description="Marked VERIFIED_WORKING"
            icon="✓"
          />
        </section>

        {/* Valuation */}
        <SectionHeading
          eyebrow="RECOVERY ECONOMICS"
          title="Recoverable value"
          description="Generate a valuation report and review the history of estimates for this device."
        />

        <section className="mb-10 grid gap-5">
          <div className="rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-4 sm:p-6">
            <ValuationReport
              deviceId={id}
              onGenerated={() => setValuationRefreshKey((key) => key + 1)}
            />
          </div>

          <div className="rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-4 sm:p-6">
            <ValuationHistoryChart
              deviceId={id}
              refreshKey={valuationRefreshKey}
            />
          </div>
        </section>

        {/* AI tools */}
        <SectionHeading
          eyebrow="AI-ASSISTED ANALYSIS"
          title="Analyze and understand"
          description="Identify possible components from an image, explore valuation predictions, and ask questions about this device."
        />

        <section className="mb-10 grid gap-5 xl:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-lime-300/15 bg-[#101713]/80 p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/[0.07] text-xl text-lime-300">
                ⌘
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-300">
                  YOLO11n COMPUTER VISION
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Component identification
                </h2>
              </div>
            </div>
            <ImageAnalysis deviceId={id} onComponentAdded={refresh} />
          </div>

          <div className="min-w-0 rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] text-xl text-emerald-300">
                ◉
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-300">
                  DEVICE ASSISTANT
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Ask about recovery
                </h2>
              </div>
            </div>
            <DeviceChat deviceId={id} />
          </div>
        </section>

        {/* Component inventory */}
        <section className="mb-10">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                COMPONENT INVENTORY
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Recovered parts
                <span className="ml-2 text-base font-normal text-emerald-100/40">
                  ({components.length})
                </span>
              </h2>
              <p className="mt-2 text-sm text-emerald-50/45">
                Confirm component condition and test functionality before making recovery decisions.
              </p>
            </div>

            <button
              onClick={() => setShowAddComponent((value) => !value)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-sm font-bold text-[#10170c] transition hover:bg-lime-200"
            >
              {showAddComponent ? "Cancel" : "+ Add component"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-200"
            >
              {error}
            </div>
          )}

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
            <div className="rounded-2xl border border-dashed border-emerald-100/15 bg-[#101713]/50 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-300/15 bg-lime-300/[0.06] text-2xl text-lime-300">
                ◇
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                No components recorded yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-emerald-50/45">
                Add RAM, storage, batteries, or other parts to begin testing
                and evaluating their recovery potential.
              </p>
              <button
                onClick={() => setShowAddComponent(true)}
                className="mt-5 rounded-xl border border-lime-300/20 px-4 py-2.5 text-sm font-semibold text-lime-300 hover:bg-lime-300/[0.06]"
              >
                Add your first component
              </button>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {components.map((component) => (
              <ComponentCard
                key={component._id}
                component={component}
                token={token}
                onDelete={() => handleDeleteComponent(component._id)}
                onUpdated={refresh}
              />
            ))}
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-emerald-100/10 py-6 text-xs text-emerald-100/30 sm:flex-row">
          <Link
            to="/devices"
            className="text-emerald-100/40 no-underline hover:text-lime-300"
          >
            ← All devices
          </Link>
          <span>ECYCLE.AI · Identify · Verify · Value · Recover</span>
        </footer>
      </div>
    </main>
  );
}

function MetricCard({ label, value, description, icon }) {
  return (
    <div className="rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold tracking-[0.15em] text-emerald-100/45">
          {label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-lime-300/15 bg-lime-300/[0.06] text-lg text-lime-300">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs text-emerald-100/35">{description}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/45">
        {description}
      </p>
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
      className="mb-5 rounded-2xl border border-lime-300/15 bg-[#101713]/90 p-5 sm:p-6"
    >
      <h3 className="mb-5 text-lg font-semibold text-white">
        Register a component
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Component type</span>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={inputClass}
          >
            {COMPONENT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#101713]">
                {TYPE_LABELS[type] || type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Capacity</span>
          <input
            type="text"
            placeholder="e.g. 512GB"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Brand</span>
          <input
            type="text"
            placeholder="Brand (optional)"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Model</span>
          <input
            type="text"
            placeholder="Model (optional)"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>Condition</span>
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className={inputClass}
          >
            {["unknown", "excellent", "good", "fair", "poor"].map((condition) => (
              <option key={condition} value={condition} className="bg-[#101713]">
                {condition}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Working status</span>
          <select
            value={form.workingStatus}
            onChange={(e) =>
              setForm({ ...form, workingStatus: e.target.value })
            }
            className={inputClass}
          >
            {WORKING_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[#101713]">
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Health (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            value={form.health}
            onChange={(e) => setForm({ ...form, health: e.target.value })}
            placeholder="0–100"
            className={inputClass}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelClass}>Notes</span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Additional component details (optional)"
            className={`${inputClass} resize-y`}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#10170c] transition hover:bg-lime-200 disabled:opacity-50"
      >
        {submitting ? "Adding component..." : "Save component"}
      </button>
    </form>
  );
}

function ComponentCard({ component, token, onDelete, onUpdated }) {
  const [current, setCurrent] = useState(component);

  return (
    <article className="min-w-0 rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-5 transition hover:border-emerald-100/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/[0.06] text-xl text-lime-300">
            ◇
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold text-white">
              {TYPE_LABELS[current.type] || current.type}
              {current.capacity ? ` · ${current.capacity}` : ""}
            </h3>
            <p className="mt-1 break-words text-sm text-emerald-50/45">
              {[current.brand, current.model].filter(Boolean).join(" · ") ||
                "No brand or model specified"}
            </p>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="shrink-0 rounded-lg border border-red-400/15 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-400/[0.06]"
        >
          Delete
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={current.workingStatus} />
        <span className="rounded-full border border-emerald-100/10 px-2.5 py-1 text-[10px] text-emerald-100/50">
          Condition: {current.condition}
        </span>
        {current.health != null && (
          <span className="rounded-full border border-emerald-100/10 px-2.5 py-1 text-[10px] text-emerald-100/50">
            Health: {current.health}%
          </span>
        )}
      </div>

      <div className="mt-5 border-t border-emerald-100/[0.08] pt-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300/75">
          FUNCTIONAL VERIFICATION
        </p>
        <ComponentTesting
          component={current}
          onComponentUpdated={(updatedComponent) => {
            setCurrent(updatedComponent);
            onUpdated();
          }}
        />
      </div>

      <div className="mt-5 border-t border-emerald-100/[0.08] pt-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300/75">
          VALUE ESTIMATION
        </p>
        <ComponentPrediction componentId={current._id} />
      </div>

      <div className="mt-5 border-t border-emerald-100/[0.08] pt-5">
        <ComponentMarketData
          componentType={current.type}
          brand={current.brand}
        />
      </div>

      <div className="mt-5 border-t border-emerald-100/[0.08] pt-5">
        <ListForSale component={current} />
      </div>

      <div className="mt-5 border-t border-emerald-100/[0.08] pt-5">
        <RecyclingGuidance componentType={current.type} />
      </div>
    </article>
  );
}

function ListForSale({ component }) {
  const { token } = useAuth();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(
    `${component.type} - ${component.brand || ""}`.trim()
  );
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createListing(token, {
        componentId: component._id,
        title,
        price: Number(price),
      });
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
      <p className="text-xs leading-5 text-emerald-100/40">
        Run a functional test before listing this component for sale.
      </p>
    );
  }

  return (
    <div>
      {done ? (
        <p className="text-sm text-emerald-300">
          Listed for sale.{" "}
          <Link
            to="/marketplace/mine"
            className="font-semibold underline underline-offset-4"
          >
            View your listings
          </Link>
        </p>
      ) : (
        <button
          onClick={() => setShow((value) => !value)}
          className="text-sm font-semibold text-lime-300 hover:text-lime-200"
        >
          {show ? "Cancel listing" : "+ List for sale"}
        </button>
      )}

      {show && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className={labelClass}>Listing title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Asking price (₹)</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className={inputClass}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-bold text-[#10170c] hover:bg-lime-200 disabled:opacity-50"
          >
            {submitting ? "Creating listing..." : "Create listing"}
          </button>
        </form>
      )}
    </div>
  );
}

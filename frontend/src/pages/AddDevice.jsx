
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

const CATEGORY_ICONS = {
  laptop: "▣",
  desktop: "▤",
  smartphone: "▯",
  tablet: "▯",
  monitor: "▱",
  printer: "▤",
  television: "▱",
  other: "◇",
};

const fieldClass =
  "w-full rounded-xl border border-emerald-100/15 bg-[#0b100d] px-4 py-3 text-sm text-white caret-lime-300 outline-none transition placeholder:text-emerald-100/30 focus:border-lime-300/60 focus:ring-2 focus:ring-lime-300/10";

const labelClass =
  "mb-2 block text-sm font-medium text-emerald-50/80";

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
        ageYears:
          form.ageYears === "" ? undefined : Number(form.ageYears),
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
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] px-5 py-8 text-emerald-50 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(52,211,153,0.10),transparent_36%),radial-gradient(ellipse_at_90%_85%,rgba(163,230,53,0.06),transparent_34%)]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <nav className="flex items-center justify-between gap-4 border-b border-emerald-100/10 pb-6">
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

          <Link
            to="/devices"
            className="rounded-lg border border-emerald-100/15 px-4 py-2 text-sm text-emerald-50/70 no-underline transition hover:border-lime-300/30 hover:text-lime-300"
          >
            ← Your devices
          </Link>
        </nav>

        <section className="grid items-start gap-8 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:py-12">
          {/* Intro panel */}
          <div className="animate-fade-up lg:sticky lg:top-8">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-lime-200">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              DEVICE REGISTRATION
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Give your
              <br />
              device a{" "}
              <span className="bg-gradient-to-r from-lime-200 via-lime-400 to-emerald-400 bg-clip-text text-transparent">
                second life.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/55">
              Register an electronic device to start tracking its
              components, checking what can be recovered, and exploring
              reuse or recycling options.
            </p>

            <div className="mt-8 space-y-4">
              {[
                ["01", "Register", "Add basic device information."],
                ["02", "Analyze", "Identify components with AI assistance."],
                ["03", "Recover", "Verify condition and estimate value."],
              ].map(([number, title, description]) => (
                <div key={number} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-lime-300/15 bg-lime-300/[0.06] text-xs font-semibold text-lime-300">
                    {number}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-50/40">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registration form */}
          <section className="animate-fade-up rounded-2xl border border-emerald-100/10 bg-[#101713]/90 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.17em] text-emerald-300/75">
                INVENTORY SETUP
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Add a device
              </h2>
              <p className="mt-2 text-sm text-emerald-50/45">
                Enter the details below. You can manage components after
                creating the device.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="device-name" className={labelClass}>
                  Device name <span className="text-lime-300">*</span>
                </label>
                <input
                  id="device-name"
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Dell Inspiron 15"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="device-category" className={labelClass}>
                  Device category <span className="text-lime-300">*</span>
                </label>

                <div className="relative">
                  <select
                    id="device-category"
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className={`${fieldClass} appearance-none pr-12`}
                  >
                    {DEVICE_CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-[#101713] text-white"
                      >
                        {CATEGORY_LABELS[category] || category}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lime-300">
                    ▾
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {DEVICE_CATEGORIES.slice(0, 5).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, category })
                      }
                      className={`rounded-lg border px-3 py-2 text-xs transition ${
                        form.category === category
                          ? "border-lime-300/40 bg-lime-300/10 text-lime-200"
                          : "border-emerald-100/10 bg-white/[0.02] text-emerald-50/50 hover:border-emerald-100/25"
                      }`}
                    >
                      <span className="mr-1.5">
                        {CATEGORY_ICONS[category] || "◇"}
                      </span>
                      {CATEGORY_LABELS[category] || category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="device-brand" className={labelClass}>
                    Brand
                  </label>
                  <input
                    id="device-brand"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. HP, Dell, Samsung"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="device-model" className={labelClass}>
                    Model
                  </label>
                  <input
                    id="device-model"
                    type="text"
                    maxLength={100}
                    placeholder="Model number or name"
                    value={form.model}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="device-age" className={labelClass}>
                  Device age{" "}
                  <span className="font-normal text-emerald-100/35">
                    (years, optional)
                  </span>
                </label>
                <input
                  id="device-age"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="e.g. 4"
                  value={form.ageYears}
                  onChange={(e) =>
                    setForm({ ...form, ageYears: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="device-description" className={labelClass}>
                  Description{" "}
                  <span className="font-normal text-emerald-100/35">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="device-description"
                  rows={4}
                  maxLength={2000}
                  placeholder="Describe its condition, known issues, or anything useful for recovery..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={`${fieldClass} resize-y`}
                />
                <p className="mt-2 text-right text-[11px] text-emerald-100/30">
                  {form.description.length}/2000 characters
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm leading-6 text-red-200"
                >
                  <p className="font-semibold text-red-300">
                    Device could not be created
                  </p>
                  <p className="mt-1 break-words">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-lime-200/30 bg-lime-300 px-5 py-3.5 text-sm font-bold text-[#10170c] shadow-[0_0_25px_rgba(163,230,53,0.10)] transition hover:-translate-y-0.5 hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Registering device..." : "Create device"}
                {!submitting && <span aria-hidden="true">→</span>}
              </button>

              <p className="text-center text-xs leading-5 text-emerald-100/30">
                Fields marked with * are required. You can add component
                details after registration.
              </p>
            </form>
          </section>
        </section>

        <footer className="border-t border-emerald-100/10 py-6 text-xs text-emerald-100/30">
          ECYCLE.AI · Identify · Verify · Value · Recover
        </footer>
      </div>
    </main>
  );
}

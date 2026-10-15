
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listDevices } from "../lib/devices";

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

export default function Devices() {
  const { token, user, logout } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    refresh();
    // Load devices when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refresh() {
    setLoading(true);
    setError(null);

    listDevices(token)
      .then((data) => setDevices(data.devices))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  const filteredDevices = devices.filter((device) => {
    const query = search.toLowerCase();

    return [
      device.name,
      device.brand,
      device.model,
      CATEGORY_LABELS[device.category] || device.category,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] text-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(52,211,153,0.09),transparent_35%),radial-gradient(ellipse_at_95%_55%,rgba(163,230,53,0.045),transparent_32%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
        {/* Navigation */}
        <nav className="flex flex-wrap items-center justify-between gap-5 border-b border-emerald-100/10 pb-6">
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

          <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
            <Link
              to="/dashboard"
              className="text-emerald-50/60 no-underline hover:text-lime-300"
            >
              Dashboard
            </Link>
            <Link
              to="/marketplace"
              className="text-emerald-50/60 no-underline hover:text-lime-300"
            >
              Marketplace
            </Link>
            <Link
              to="/profile"
              className="text-emerald-50/60 no-underline hover:text-lime-300"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-emerald-100/15 px-3 py-2 text-emerald-50/75 hover:border-red-400/30 hover:text-red-300"
            >
              Log out
            </button>
          </div>
        </nav>

        {/* Page heading */}
        <section className="flex flex-col justify-between gap-6 py-10 sm:flex-row sm:items-end sm:py-14">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-lime-200">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              DEVICE MANAGEMENT
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Your <span className="gradient-text">devices.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/50 sm:text-base">
              Every device holds resources worth recovering. Track your
              electronics and discover their component recovery potential.
            </p>

            <p className="mt-3 text-sm text-emerald-100/35">
              Workspace: {user?.name || "User"}
            </p>
          </div>

          <Link
            to="/devices/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#10170c] no-underline shadow-[0_0_25px_rgba(163,230,53,0.10)] transition hover:-translate-y-0.5 hover:bg-lime-200"
          >
            <span className="text-lg">+</span> Add a device
          </Link>
        </section>

        {/* Device count and search */}
        <section className="mb-6 grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/40">
              REGISTERED DEVICES
            </p>

            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-4xl font-semibold tracking-tight text-white">
                {loading ? "—" : devices.length.toString().padStart(2, "0")}
              </p>
              <span className="mb-1 rounded-full border border-emerald-300/15 bg-emerald-300/5 px-2.5 py-1 text-[10px] text-emerald-200/80">
                Live account data
              </span>
            </div>

            <p className="mt-2 text-xs text-emerald-100/35">
              Devices registered to your account
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-5">
            <label
              htmlFor="device-search"
              className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/45"
            >
              FIND A DEVICE
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-emerald-100/10 bg-[#090e0b] px-4 transition focus-within:border-lime-300/40">
              <span className="text-lg text-emerald-100/40" aria-hidden="true">
                ⌕
              </span>
              <input
                id="device-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, brand, model or category..."
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-white outline-none placeholder:text-emerald-100/30 focus:ring-0"
              />
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-emerald-100/10 bg-[#101713]/70 p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-100/10 border-t-lime-300" />
            <p className="mt-4 text-sm text-emerald-50/60">
              Loading your registered devices...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5"
          >
            <p className="font-semibold text-red-300">
              Unable to load devices
            </p>
            <p className="mt-2 break-words text-sm text-red-200/70">
              {error}
            </p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 rounded-lg border border-red-300/20 px-4 py-2 text-sm text-red-200 hover:bg-red-300/10"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && devices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-emerald-100/15 bg-[#101713]/50 px-6 py-14 text-center sm:px-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-lime-300/15 bg-lime-300/[0.06] text-3xl text-lime-300">
              ◇
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              Start your recovery journey
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              No devices registered yet
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-50/45">
              Add an electronic device to start managing its components,
              verify their condition, and explore recovery options.
            </p>
            <Link
              to="/devices/new"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#10170c] no-underline hover:bg-lime-200"
            >
              Register your first device →
            </Link>
          </div>
        )}

        {/* Device list */}
        {!loading && !error && devices.length > 0 && (
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">
                Registered inventory
              </h2>
              <span className="text-xs text-emerald-100/35">
                Showing {filteredDevices.length} of {devices.length}
              </span>
            </div>

            {filteredDevices.length === 0 ? (
              <div className="rounded-xl border border-emerald-100/10 bg-[#101713]/70 p-8 text-center text-sm text-emerald-50/50">
                No devices match your search. Try another keyword.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDevices.map((device) => (
                  <Link
                    key={device._id}
                    to={`/devices/${device._id}`}
                    className="group rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-5 text-emerald-50 no-underline shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-lime-300/25 hover:bg-[#131d16]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/[0.07] text-2xl text-lime-300">
                        {CATEGORY_ICONS[device.category] || "◇"}
                      </div>

                      <span className="rounded-full border border-emerald-100/10 bg-white/[0.025] px-2.5 py-1 text-[10px] text-emerald-100/40">
                        {CATEGORY_LABELS[device.category] || device.category}
                      </span>
                    </div>

                    <h3 className="mt-5 break-words text-lg font-semibold text-white transition group-hover:text-lime-200">
                      {device.name}
                    </h3>

                    <p className="mt-2 min-h-6 break-words text-sm text-emerald-50/45">
                      {[device.brand, device.model].filter(Boolean).join(" · ") ||
                        "Brand and model not specified"}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-emerald-100/[0.07] pt-4">
                      <span className="text-xs text-emerald-100/35">
                        Added{" "}
                        {device.createdAt
                          ? new Date(device.createdAt).toLocaleDateString()
                          : "date unavailable"}
                      </span>

                      <span className="text-sm font-semibold text-lime-300 transition group-hover:translate-x-1">
                        View →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-14 flex flex-col justify-between gap-3 border-t border-emerald-100/10 py-6 text-xs text-emerald-100/30 sm:flex-row">
          <Link
            to="/dashboard"
            className="text-emerald-100/40 no-underline hover:text-lime-300"
          >
            ← Back to dashboard
          </Link>
          <span>ECYCLE.AI · Identify · Verify · Value · Recover</span>
        </footer>
      </div>
    </main>
  );
}

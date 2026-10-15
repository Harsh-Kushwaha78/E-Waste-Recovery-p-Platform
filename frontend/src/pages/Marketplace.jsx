
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { browseListings } from "../lib/listings";
import { COMPONENT_TYPES, WORKING_STATUSES } from "../lib/devices";
import StatusBadge from "../components/StatusBadge";

const COMPONENT_LABELS = {
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

const COMPONENT_ICONS = {
  ram: "▤",
  ssd: "▰",
  hdd: "▰",
  battery: "ϟ",
  motherboard: "▦",
  display: "▱",
  gpu: "▧",
};

const filterClass =
  "min-w-0 rounded-xl border border-emerald-100/15 bg-[#0b100d] px-3 py-3 text-sm text-white outline-none focus:border-lime-300/50 focus:ring-2 focus:ring-lime-300/10";

export default function Marketplace() {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    componentType: "",
    workingStatus: "",
    sort: "",
  });

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    browseListings(token, filters)
      .then((data) => {
        if (!cancelled) setListings(data.listings);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, filters]);

  function updateFilter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] text-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(52,211,153,0.09),transparent_35%),radial-gradient(ellipse_at_95%_40%,rgba(163,230,53,0.05),transparent_32%)]" />

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

          <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
            <Link
              to="/dashboard"
              className="text-emerald-50/60 no-underline hover:text-lime-300"
            >
              Dashboard
            </Link>
            <Link
              to="/devices"
              className="text-emerald-50/60 no-underline hover:text-lime-300"
            >
              My devices
            </Link>
            <Link
              to="/marketplace/mine"
              className="rounded-lg border border-lime-300/20 bg-lime-300/[0.05] px-3 py-2 text-lime-200 no-underline transition hover:bg-lime-300/10"
            >
              My listings →
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="grid items-end gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_auto]">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.17em] text-lime-200">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              CIRCULAR ECONOMY EXCHANGE
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Parts deserve
              <br />
              <span className="bg-gradient-to-r from-lime-200 via-lime-400 to-emerald-400 bg-clip-text text-transparent">
                a second life.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/50 sm:text-base">
              Discover reusable electronic components, compare asking prices,
              and help keep valuable hardware in circulation.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-5 sm:min-w-52">
            <p className="text-[10px] font-bold tracking-[0.16em] text-emerald-100/40">
              CURRENT INVENTORY
            </p>
            <p className="mt-3 text-4xl font-semibold text-white">
              {loading ? "—" : listings.length.toString().padStart(2, "0")}
            </p>
            <p className="mt-2 text-xs text-emerald-100/40">
              Matching active listings
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8 rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                FIND YOUR COMPONENT
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Browse inventory
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setFilters({
                  componentType: "",
                  workingStatus: "",
                  sort: "",
                })
              }
              className="text-xs font-semibold text-emerald-100/45 transition hover:text-lime-300"
            >
              Reset filters ↺
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="min-w-0">
              <span className="mb-2 block text-xs text-emerald-100/50">
                Component type
              </span>
              <select
                value={filters.componentType}
                onChange={(e) =>
                  updateFilter("componentType", e.target.value)
                }
                className={`${filterClass} w-full`}
              >
                <option value="" className="bg-[#101713]">
                  All component types
                </option>
                {COMPONENT_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-[#101713]"
                  >
                    {COMPONENT_LABELS[type] || type}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="mb-2 block text-xs text-emerald-100/50">
                Functional status
              </span>
              <select
                value={filters.workingStatus}
                onChange={(e) =>
                  updateFilter("workingStatus", e.target.value)
                }
                className={`${filterClass} w-full`}
              >
                <option value="" className="bg-[#101713]">
                  Any status
                </option>
                {WORKING_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                    className="bg-[#101713]"
                  >
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="mb-2 block text-xs text-emerald-100/50">
                Sort by
              </span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className={`${filterClass} w-full`}
              >
                <option value="" className="bg-[#101713]">
                  Newest first
                </option>
                <option value="price_asc" className="bg-[#101713]">
                  Price: low to high
                </option>
                <option value="price_desc" className="bg-[#101713]">
                  Price: high to low
                </option>
              </select>
            </label>
          </div>
        </section>

        {/* Listing results */}
        <section className="pb-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                COMMUNITY INVENTORY
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Available components
              </h2>
            </div>

            <span className="text-xs text-emerald-100/35">
              {loading ? "Updating inventory..." : `${listings.length} results`}
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5"
            >
              <p className="font-semibold text-red-300">
                Unable to load listings
              </p>
              <p className="mt-2 break-words text-sm text-red-200/70">
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilters((previous) => ({ ...previous }));
                }}
                className="mt-4 rounded-lg border border-red-300/20 px-4 py-2 text-sm text-red-200 hover:bg-red-300/[0.05]"
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-emerald-100/10 bg-[#101713]/70 p-5"
                >
                  <div className="h-12 w-12 rounded-xl bg-emerald-100/[0.06]" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-emerald-100/[0.06]" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-emerald-100/[0.05]" />
                  <div className="mt-8 h-8 rounded bg-emerald-100/[0.04]" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-emerald-100/15 bg-[#101713]/50 px-6 py-14 text-center sm:px-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-lime-300/15 bg-lime-300/[0.06] text-3xl text-lime-300">
                ◇
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">
                No matching listings yet
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-emerald-50/45">
                Try changing your filters, or return later as more reusable
                components are listed.
              </p>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    componentType: "",
                    workingStatus: "",
                    sort: "",
                  })
                }
                className="mt-6 rounded-xl border border-lime-300/20 px-4 py-2.5 text-sm font-semibold text-lime-300 transition hover:bg-lime-300/[0.06]"
              >
                Clear all filters
              </button>
            </div>
          )}

          {!loading && !error && listings.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <Link
                  key={listing._id}
                  to={`/marketplace/${listing._id}`}
                  className="group flex min-w-0 flex-col rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-5 text-emerald-50 no-underline shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-lime-300/25 hover:bg-[#131d16]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/[0.06] text-2xl text-lime-300">
                      {COMPONENT_ICONS[listing.component?.type] || "◇"}
                    </span>

                    <span className="rounded-full border border-emerald-100/10 px-2.5 py-1 text-[10px] text-emerald-100/40">
                      {COMPONENT_LABELS[listing.component?.type] ||
                        listing.component?.type ||
                        "Component"}
                    </span>
                  </div>

                  <h3 className="mt-5 break-words text-lg font-semibold text-white transition group-hover:text-lime-200">
                    {listing.title}
                  </h3>

                  <p className="mt-2 min-h-10 break-words text-sm leading-5 text-emerald-50/45">
                    {[
                      listing.component?.brand,
                      listing.component?.model,
                      listing.component?.capacity
                        ? `(${listing.component.capacity})`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || "Additional specifications not provided"}
                  </p>

                  <div className="mt-4">
                    {listing.component?.workingStatus ? (
                      <StatusBadge status={listing.component.workingStatus} />
                    ) : (
                      <span className="text-xs text-emerald-100/35">
                        Status not available
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-emerald-100/[0.08] pt-5 mt-5">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.13em] text-emerald-100/40">
                        Asking price
                      </p>
                      <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-lime-300">
                        {listing.currency} {listing.price}
                      </p>
                      <p className="mt-2 truncate text-xs text-emerald-100/40">
                        Seller: {listing.seller?.name || "Community member"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg border border-emerald-100/10 px-3 py-2 text-xs font-semibold text-emerald-50/70 transition group-hover:border-lime-300/25 group-hover:text-lime-300">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-emerald-100/10 py-6 text-xs text-emerald-100/30 sm:flex-row">
          <Link
            to="/dashboard"
            className="text-emerald-100/40 no-underline hover:text-lime-300"
          >
            ← Back to dashboard
          </Link>
          <span>ECYCLE.AI · Keep valuable electronics in circulation</span>
        </footer>
      </div>
    </main>
  );
}

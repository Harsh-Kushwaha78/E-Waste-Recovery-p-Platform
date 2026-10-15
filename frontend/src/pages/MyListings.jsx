// frontend/src/pages/MyListings.jsx
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { myListings, updateListing, deleteListing } from "../lib/listings";

const STATUS_STYLES = {
  active: "border-lime-300/20 bg-lime-300/10 text-lime-200",
  sold: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  removed: "border-red-400/20 bg-red-400/10 text-red-300",
};

const STATUS_LABELS = {
  active: "Active",
  sold: "Sold",
  removed: "Removed",
};

function formatStatus(status = "unknown") {
  return status.replaceAll("_", " ").toLowerCase();
}

function ListingStatus({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] ||
        "border-slate-400/20 bg-slate-400/10 text-slate-300"
      }`}
    >
      <span
        className={`mr-2 h-1.5 w-1.5 rounded-full ${
          status === "active"
            ? "bg-lime-300"
            : status === "sold"
              ? "bg-slate-400"
              : "bg-red-300"
        }`}
      />
      {STATUS_LABELS[status] || status || "Unknown"}
    </span>
  );
}

export default function MyListings() {
  const { token } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await myListings(token);
      setListings(data.listings || []);
    } catch (err) {
      setError(err.message || "Unable to load your listings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleMarkSold(id) {
    setActionError("");
    setBusyId(id);

    try {
      await updateListing(token, id, { status: "sold" });
      await refresh();
    } catch (err) {
      setActionError(err.message || "Could not update this listing.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this listing?")) return;

    setActionError("");
    setBusyId(id);

    try {
      await deleteListing(token, id);
      await refresh();
    } catch (err) {
      setActionError(err.message || "Could not delete this listing.");
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = listings.filter((listing) => listing.status === "active").length;
  const soldCount = listings.filter((listing) => listing.status === "sold").length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-lime-300/[0.06] blur-3xl" />
        <div className="absolute -left-40 top-[45%] h-96 w-96 rounded-full bg-emerald-500/[0.05] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-10">
        {/* Navigation */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/25 bg-lime-300/10 text-lime-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 7.5 9.2 4h5.6L17 7.5M5.2 10l2.1 8h9.4l2.1-8M8 10v5m4-5v5m4-5v5M4 7.5h16"
                />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.18em]">
                ECYCLE<span className="text-lime-300">.AI</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Circular technology
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              to="/dashboard"
              className="text-slate-400 transition hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              to="/devices"
              className="text-slate-400 transition hover:text-white"
            >
              My devices
            </Link>
            <Link
              to="/marketplace"
              className="text-lime-300 transition hover:text-lime-200"
            >
              Marketplace
            </Link>
          </nav>
        </header>

        {/* Page heading */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            <span className="h-px w-7 bg-lime-300" />
            Seller workspace
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                My <span className="text-lime-300">listings.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage your listed components, update sale status, and keep
                reusable electronics in circulation.
              </p>
            </div>

            <Link
              to="/marketplace"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-lime-300/30 hover:bg-white/[0.07]"
            >
              Browse marketplace <span aria-hidden="true">â†—</span>
            </Link>
          </div>
        </section>

        {/* Summary cards: counts are calculated from the user's actual listings */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#101512]/90 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Your listings
            </p>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {listings.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">All statuses</p>
          </div>

          <div className="rounded-2xl border border-lime-300/15 bg-lime-300/[0.04] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Active
            </p>
            <p className="mt-3 text-3xl font-bold tabular-nums text-lime-300">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Available for sale</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101512]/90 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Sold
            </p>
            <p className="mt-3 text-3xl font-bold tabular-nums text-slate-200">
              {soldCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Marked as sold</p>
          </div>
        </section>

        {/* Listing collection */}
        <section className="rounded-2xl border border-white/10 bg-[#0d120f]/90 p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your inventory</h2>
              <p className="mt-1 text-sm text-slate-500">
                Listings retrieved from your account.
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-lime-300/30 hover:text-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshingâ€¦" : "â†» Refresh"}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4"
            >
              <p className="text-sm text-red-300">{error}</p>
              <button
                type="button"
                onClick={refresh}
                className="mt-3 text-xs font-semibold text-red-200 underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {actionError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300"
            >
              {actionError}
            </div>
          )}

          {loading && listings.length === 0 && !error && (
            <div className="space-y-3" aria-label="Loading listings">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.02] p-5"
                >
                  <div className="h-4 w-2/5 rounded bg-white/10" />
                  <div className="mt-3 h-3 w-1/4 rounded bg-white/[0.06]" />
                  <div className="mt-5 h-3 w-1/3 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-300/15 bg-lime-300/[0.06] text-2xl text-lime-300">
                â†—
              </div>
              <h3 className="mt-5 text-lg font-semibold">
                No listings yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Once you have a component that is ready to sell, create its
                listing from the device details page.
              </p>
              <Link
                to="/devices"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#10150d] transition hover:bg-lime-200"
              >
                Open my devices <span aria-hidden="true">â†’</span>
              </Link>
            </div>
          )}

          {!error && listings.length > 0 && (
            <div className="space-y-3">
              {listings.map((listing) => {
                const componentType = listing.component?.type || "Component";
                const workingStatus = listing.component?.workingStatus;

                return (
                  <article
                    key={listing._id}
                    className="rounded-xl border border-white/[0.09] bg-white/[0.025] p-4 transition hover:border-white/15 sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-base font-semibold text-white">
                            {listing.title}
                          </h3>
                          <ListingStatus status={listing.status} />
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {componentType}
                          {workingStatus
                            ? ` Â· ${formatStatus(workingStatus)}`
                            : ""}
                        </p>

                        {(listing.component?.brand ||
                          listing.component?.model ||
                          listing.component?.capacity) && (
                          <p className="mt-1 text-xs text-slate-500">
                            {[
                              listing.component?.brand,
                              listing.component?.model,
                              listing.component?.capacity,
                            ]
                              .filter(Boolean)
                              .join(" Â· ")}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <p className="text-xl font-bold text-lime-300">
                          {listing.currency || "INR"}{" "}
                          {Number(listing.price).toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Listing price
                        </p>
                      </div>
                    </div>

                    {listing.status === "active" && (
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-white/[0.07] pt-4">
                        <button
                          type="button"
                          disabled={busyId === listing._id}
                          onClick={() => handleMarkSold(listing._id)}
                          className="rounded-lg bg-lime-300 px-4 py-2.5 text-xs font-bold text-[#10150d] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyId === listing._id
                            ? "Updatingâ€¦"
                            : "âœ“ Mark as sold"}
                        </button>

                        <button
                          type="button"
                          disabled={busyId === listing._id}
                          onClick={() => handleDelete(listing._id)}
                          className="rounded-lg border border-red-400/20 px-4 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete listing
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-xs text-slate-600">
          <span>ECYCLE.AI Â· Component recovery marketplace</span>
          <Link
            to="/dashboard"
            className="text-slate-400 transition hover:text-lime-300"
          >
            Return to dashboard â†‘
          </Link>
        </footer>
      </div>
    </main>
  );
}

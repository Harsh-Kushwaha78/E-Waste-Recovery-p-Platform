// frontend/src/pages/ListingDetails.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getListing } from "../lib/listings";
import StatusBadge from "../components/StatusBadge";

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;

  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.06] py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-200 sm:text-right">
        {value}
      </span>
    </div>
  );
}

export default function ListingDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setData(null);

    getListing(token, id)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load listing details.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, id]);

  const pageShell =
    "relative min-h-screen overflow-hidden bg-[#080b0a] text-white";
  const panel =
    "rounded-2xl border border-white/10 bg-[#101512]/90";

  if (loading) {
    return (
      <main className={`${pageShell} px-5 py-10 sm:px-8`}>
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse">
            <div className="h-4 w-36 rounded bg-white/10" />
            <div className="mt-8 h-9 w-2/3 rounded bg-white/10" />
            <div className="mt-4 h-4 w-1/3 rounded bg-white/[0.06]" />
            <div className={`mt-8 ${panel} p-6`}>
              <div className="h-8 w-1/2 rounded bg-white/[0.06]" />
              <div className="mt-6 h-20 rounded-xl bg-white/[0.04]" />
              <div className="mt-4 h-20 rounded-xl bg-white/[0.04]" />
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Loading component detailsâ€¦
          </p>
        </div>
      </main>
    );
  }

  if (error || !data?.listing) {
    return (
      <main className={`${pageShell} px-5 py-10 sm:px-8`}>
        <div className="mx-auto max-w-3xl">
          <Link
            to="/marketplace"
            className="text-sm text-slate-400 transition hover:text-lime-300"
          >
            â† Back to marketplace
          </Link>

          <section className={`${panel} mt-8 p-7 sm:p-10`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/[0.08] text-xl text-red-300">
              !
            </div>
            <h1 className="mt-5 text-xl font-semibold">
              Unable to load listing
            </h1>
            <p role="alert" className="mt-2 text-sm leading-6 text-red-300">
              {error || "This listing could not be found."}
            </p>
            <Link
              to="/marketplace"
              className="mt-6 inline-flex rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#10150d] transition hover:bg-lime-200"
            >
              Return to marketplace
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const { listing, latestTest } = data;
  const component = listing.component || {};

  const componentName = [
    component.brand,
    component.model,
    component.capacity ? `(${component.capacity})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const price = Number(listing.price).toLocaleString("en-IN");

  return (
    <main className={pageShell}>
      {/* Ambient background */}
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

      <div className="relative mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-10">
        {/* Navigation */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
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

          <Link
            to="/marketplace"
            className="text-sm text-slate-400 transition hover:text-lime-300"
          >
            â† Marketplace
          </Link>
        </header>

        {/* Heading */}
        <section className="mb-7">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            <span className="h-px w-7 bg-lime-300" />
            Component marketplace
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <h1 className="max-w-2xl break-words text-3xl font-bold tracking-tight sm:text-4xl">
                {listing.title}
              </h1>
              <p className="mt-3 text-sm text-slate-400">
                {componentName || component.type || "Electronic component"}
              </p>
            </div>

            <div className="rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-5 sm:min-w-44">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Asking price
              </p>
              <p className="mt-2 text-2xl font-bold text-lime-300">
                {listing.currency || "INR"} {price}
              </p>
            </div>
          </div>
        </section>

        {/* Component details */}
        <section className={`${panel} p-5 sm:p-7`}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/[0.06] text-lime-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <rect x="5" y="5" width="14" height="14" rx="2" />
                <path d="M9 9h6v6H9zM9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" />
              </svg>
            </span>
            <div>
              <h2 className="font-semibold">Component information</h2>
              <p className="mt-1 text-xs text-slate-500">
                Details provided for this listing
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <StatusBadge status={component.workingStatus} />
            {component.condition && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                Condition: {component.condition}
              </span>
            )}
          </div>

          <div className="divide-y divide-white/[0.06]">
            <DetailRow label="Component type" value={component.type} />
            <DetailRow label="Brand" value={component.brand} />
            <DetailRow label="Model" value={component.model} />
            <DetailRow label="Capacity" value={component.capacity} />
            <DetailRow
              label="Reported health"
              value={
                component.health != null ? `${component.health}%` : null
              }
            />
          </div>

          {listing.description && (
            <div className="mt-5 border-t border-white/[0.08] pt-5">
              <h3 className="text-sm font-semibold text-slate-200">
                Seller description
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                {listing.description}
              </p>
            </div>
          )}
        </section>

        {/* Verification evidence */}
        <section className={`${panel} mt-5 p-5 sm:p-7`}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300">
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
                  d="m5 12 4 4L19 6"
                />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </span>
            <div>
              <h2 className="font-semibold">Verification evidence</h2>
              <p className="mt-1 text-xs text-slate-500">
                Functional test information available for this component
              </p>
            </div>
          </div>

          {latestTest ? (
            <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.035] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-200">
                  Latest recorded test
                </span>
                <StatusBadge status={latestTest.derivedStatus} />
              </div>

              {Array.isArray(latestTest.derivedReasons) &&
                latestTest.derivedReasons.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {latestTest.derivedReasons.map((reason, index) => (
                      <li
                        key={`${index}-${reason}`}
                        className="flex items-start gap-2 text-sm leading-6 text-slate-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-300" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 text-xs text-slate-500">
                {latestTest.testDate && (
                  <span>
                    Tested{" "}
                    {new Date(latestTest.testDate).toLocaleDateString()}
                  </span>
                )}
                {latestTest.testedBy && (
                  <span>Tested by {latestTest.testedBy}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-lg text-amber-300" aria-hidden="true">
                  !
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-amber-200">
                    No functional test recorded
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    The component has no recorded functional test in the
                    available listing data. Its working status should be
                    treated as unverified until suitable testing is completed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Seller information */}
        <section className={`${panel} mt-5 p-5 sm:p-6`}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-lg font-semibold text-lime-300">
              {(listing.seller?.name || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Listed by
              </p>
              <p className="mt-1 font-semibold text-slate-100">
                {listing.seller?.name || "Seller"}
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-xs text-slate-600">
          <span>ECYCLE.AI Â· Component recovery marketplace</span>
          <Link
            to="/marketplace"
            className="text-slate-400 transition hover:text-lime-300"
          >
            Explore more components â†’
          </Link>
        </footer>
      </div>
    </main>
  );
}

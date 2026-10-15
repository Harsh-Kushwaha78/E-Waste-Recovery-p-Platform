
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    number: "01",
    title: "Component Intelligence",
    description:
      "Identify RAM, SSDs, batteries, motherboards, and displays from device images.",
    icon: "⌘",
    tag: "YOLO11n VISION",
    href: "/devices",
  },
  {
    number: "02",
    title: "Recoverable Value",
    description:
      "Estimate component value using condition, health, age, and working status.",
    icon: "↗",
    tag: "ML VALUATION",
    href: "/devices",
  },
  {
    number: "03",
    title: "Circular Marketplace",
    description:
      "Explore component listings and support the reuse of electronic resources.",
    icon: "◇",
    tag: "REUSE ECOSYSTEM",
    href: "/marketplace",
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] text-emerald-50">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(52,211,153,0.10),transparent_35%),radial-gradient(ellipse_at_90%_45%,rgba(163,230,53,0.055),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(163,230,53,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.07)_1px,transparent_1px)] [background-size:44px_44px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12">
        {/* Navigation */}
        <nav className="flex flex-wrap items-center justify-between gap-5 border-b border-emerald-100/10 pb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-white no-underline"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-300/25 bg-lime-300/10 text-2xl text-lime-300">
              ♻
            </div>
            <div>
              <p className="m-0 text-base font-bold tracking-wide">
                ECYCLE<span className="text-lime-300">.AI</span>
              </p>
              <p className="m-0 mt-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100/40">
                Recovery intelligence
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
            <Link
              to="/devices"
              className="text-emerald-50/65 no-underline hover:text-lime-300"
            >
              My devices
            </Link>
            <Link
              to="/marketplace"
              className="text-emerald-50/65 no-underline hover:text-lime-300"
            >
              Marketplace
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-emerald-50/65 no-underline hover:text-lime-300"
              >
                Admin
              </Link>
            )}
            <Link
              to="/profile"
              className="text-emerald-50/65 no-underline hover:text-lime-300"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-emerald-100/15 px-3 py-2 text-emerald-50/75 hover:border-red-400/30 hover:bg-red-400/5 hover:text-red-300"
            >
              Log out
            </button>
          </div>
        </nav>

        {/* Welcome section */}
        <section className="grid items-center gap-8 py-12 lg:grid-cols-[1fr_auto] lg:py-16">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/5 px-3 py-1.5 text-xs font-medium tracking-wide text-lime-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-300" />
              YOUR RECOVERY WORKSPACE
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Welcome back,
              <br />
              <span className="bg-gradient-to-r from-lime-200 via-lime-400 to-emerald-400 bg-clip-text text-transparent">
                {user?.name || "Recovery explorer"}.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/55 sm:text-base">
              Give your electronics a second life. Analyze components,
              evaluate recovery potential, and discover smarter ways to
              reuse electronic resources.
            </p>

            {user?.email && (
              <p className="mt-4 text-sm text-emerald-100/35">
                Signed in as {user.email}
                {user?.role === "admin" && (
                  <span className="ml-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-lime-200">
                    Admin
                  </span>
                )}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/devices"
                className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#10170c] no-underline shadow-[0_0_28px_rgba(163,230,53,0.12)] transition hover:-translate-y-0.5 hover:bg-lime-200 hover:shadow-[0_0_34px_rgba(163,230,53,0.2)]"
              >
                Explore my devices <span>→</span>
              </Link>
              <Link
                to="/devices/new"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-100/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-emerald-50 no-underline transition hover:border-lime-300/30 hover:bg-lime-300/5"
              >
                <span className="text-lime-300">+</span> Add a device
              </Link>
            </div>
          </div>

          {/* Decorative recovery indicator */}
          <div className="hidden lg:block">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-lime-300/10 bg-lime-300/[0.025]">
              <div className="absolute inset-4 rounded-full border border-dashed border-emerald-300/15" />
              <div className="absolute inset-8 rounded-full border border-lime-300/15" />
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-lime-300/20 bg-gradient-to-br from-lime-300/15 to-emerald-400/5 text-5xl text-lime-300 shadow-[0_0_60px_rgba(163,230,53,0.09)]">
                ♻
              </div>
              <span className="absolute right-7 top-9 h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(163,230,53,0.8)]" />
              <span className="absolute bottom-9 left-8 h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </div>
          </div>
        </section>

        {/* Platform overview */}
        <section className="mb-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/40">
                PLATFORM OVERVIEW
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                Your recovery toolkit
              </h2>
            </div>
            <span className="text-xs text-emerald-100/35">
              AI-assisted · Human-confirmed
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <Link
                key={feature.number}
                to={feature.href}
                className="group animate-fade-up rounded-2xl border border-emerald-100/10 bg-[#101713]/80 p-6 text-emerald-50 no-underline shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-lime-300/25 hover:bg-[#131d16]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/[0.07] text-2xl text-lime-300 transition group-hover:border-lime-300/30 group-hover:bg-lime-300/10">
                    {feature.icon}
                  </div>
                  <span className="text-xs text-emerald-100/25">
                    {feature.number}
                  </span>
                </div>

                <p className="mt-6 text-[10px] font-bold tracking-[0.17em] text-emerald-300/75">
                  {feature.tag}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-emerald-50/50">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-lime-300">
                  Open feature
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Honest project status */}
        <section className="mb-10 rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/10 text-lg text-amber-200">
              !
            </div>
            <div>
              <h2 className="text-sm font-semibold text-amber-100">
                Valuation model status
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-50/55">
                The valuation service currently uses synthetic demo data.
                Estimates demonstrate the integrated ML workflow and are
                not verified real-world market prices.
              </p>
              <Link
                to="/devices"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-lime-300 no-underline hover:text-lime-200"
              >
                Manage components <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-3 border-t border-emerald-100/10 py-6 text-xs text-emerald-100/30 sm:flex-row">
          <span>ECYCLE.AI · Electronic resource recovery</span>
          <span>Identify · Verify · Value · Recover</span>
        </footer>
      </div>
    </main>
  );
}

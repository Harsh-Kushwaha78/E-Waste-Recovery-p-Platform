// frontend/src/pages/Profile.jsx
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { listAddresses, deleteAddress, setDefaultAddress } from "../lib/addresses";
import AddressCard from "../components/AddressCard";
import AddressModal from "../components/AddressModal";

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 21a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.07] py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="break-words text-sm font-medium text-slate-100 sm:text-right">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function Profile() {
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Address book state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const res = await listAddresses(token);
      setAddresses(res.addresses || []);
    } catch (err) {
      console.error("Failed to load addresses:", err.message);
    } finally {
      setLoadingAddresses(false);
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setProfile(null);

    apiRequest("/api/users/me", { token })
      .then((data) => {
        if (!cancelled) setProfile(data.user);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load your profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [token, loadAddresses]);

  async function handleDeleteAddress(id) {
    if (!window.confirm("Delete this saved address?")) return;
    try {
      await deleteAddress(token, id);
      await loadAddresses();
    } catch (err) {
      alert(err.message || "Could not delete address.");
    }
  }

  async function handleSetDefaultAddress(id) {
    try {
      await setDefaultAddress(token, id);
      await loadAddresses();
    } catch (err) {
      alert(err.message || "Could not set default address.");
    }
  }

  const joinedDate =
    profile?.createdAt && !Number.isNaN(new Date(profile.createdAt).getTime())
      ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] px-5 py-7 text-white sm:px-8 sm:py-10">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-lime-300/[0.06] blur-3xl" />
        <div className="absolute -left-40 top-[45%] h-96 w-96 rounded-full bg-emerald-500/[0.05] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/25 bg-lime-300/10 text-lime-300 font-bold">
              ⚡
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

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/orders" className="text-slate-400 hover:text-lime-300">
              Orders & Pickups
            </Link>
            <Link to="/dashboard" className="text-slate-400 hover:text-lime-300">
              Back to dashboard →
            </Link>
          </div>
        </header>

        {/* Page heading */}
        <section className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            <span className="h-px w-7 bg-lime-300" />
            Account settings
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your <span className="text-lime-300">profile.</span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Account identity, authentication status, and saved address book.
          </p>
        </section>

        {/* Profile card */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101512]/90 shadow-2xl">
          <div className="border-b border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/[0.08] text-lime-300">
                <ProfileIcon />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold text-white">
                  {loading ? "Loading profile…" : profile?.name || "Your account"}
                </h2>

                <p className="mt-1 break-words text-sm text-slate-400">
                  {profile?.email || "Account information"}
                </p>

                {profile?.role && (
                  <span className="mt-3 inline-flex rounded-full border border-lime-300/20 bg-lime-300/[0.08] px-3 py-1 text-xs font-semibold capitalize text-lime-200">
                    {profile.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center justify-between gap-5 border-b border-white/[0.06] pb-4"
                  >
                    <div className="h-3 w-20 rounded bg-white/10" />
                    <div className="h-3 w-36 rounded bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-5 text-red-200">
                <p className="font-semibold">Could not verify your account</p>
                <p className="mt-1 text-sm text-red-300">{error}</p>
              </div>
            )}

            {profile && !loading && (
              <dl className="divide-y divide-white/[0.06]">
                <Row label="Full name" value={profile.name} />
                <Row label="Email address" value={profile.email} />
                <Row label="Account role" value={profile.role} />
                <Row label="Member since" value={joinedDate} />
              </dl>
            )}
          </div>
        </section>

        {/* Address Book Section */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#101512]/90 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <h2 className="text-xl font-bold text-white">
                Saved <span className="text-lime-300">Addresses</span>
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Addresses used for marketplace checkout delivery and doorstep e-waste recycling pickup.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setAddressModalOpen(true);
              }}
              className="rounded-xl bg-lime-300 px-4 py-2 text-xs font-bold text-black transition hover:bg-lime-200 shadow-md shadow-lime-300/10"
            >
              + Add New Address
            </button>
          </div>

          <div className="mt-6">
            {loadingAddresses ? (
              <p className="text-center text-xs text-slate-500 py-4">
                Loading saved addresses...
              </p>
            ) : addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
                <p className="text-sm text-slate-400">No saved addresses found.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add an address to easily checkout marketplace components or schedule recycling pickup.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressModalOpen(true);
                  }}
                  className="mt-4 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2 text-xs font-semibold text-lime-300 hover:bg-white/10"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr._id}
                    address={addr}
                    onEdit={(a) => {
                      setEditingAddress(a);
                      setAddressModalOpen(true);
                    }}
                    onDelete={handleDeleteAddress}
                    onSetDefault={handleSetDefaultAddress}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Navigation shortcuts */}
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            to="/orders"
            className="group rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-lime-300/25 hover:bg-white/[0.04]"
          >
            <p className="font-semibold text-slate-100 transition group-hover:text-lime-200">
              Orders & Pickups <span className="ml-1">→</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              View purchase history, sales fulfillment, and recycling collections.
            </p>
          </Link>

          <Link
            to="/devices"
            className="group rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-lime-300/25 hover:bg-white/[0.04]"
          >
            <p className="font-semibold text-slate-100 transition group-hover:text-lime-200">
              My devices <span className="ml-1">→</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Manage devices and test recovered components.
            </p>
          </Link>

          <Link
            to="/marketplace"
            className="group rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-lime-300/25 hover:bg-white/[0.04]"
          >
            <p className="font-semibold text-slate-100 transition group-hover:text-lime-200">
              Marketplace <span className="ml-1">→</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Explore and buy reusable tested hardware.
            </p>
          </Link>
        </section>

        <footer className="mt-8 border-t border-white/[0.07] pt-5 text-xs text-slate-600">
          ECYCLE.AI · Secure address & account management
        </footer>
      </div>

      <AddressModal
        isOpen={addressModalOpen}
        initialAddress={editingAddress}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSaved={loadAddresses}
      />
    </main>
  );
}

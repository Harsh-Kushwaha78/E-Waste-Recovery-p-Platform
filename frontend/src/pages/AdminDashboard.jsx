// frontend/src/pages/AdminDashboard.jsx

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { adminListPickups, adminUpdatePickupStatus, adminListOrders } from "../lib/pickups";

const TABS = [
  { id: "stats", label: "Statistics" },
  { id: "pickups", label: "Pickups" },
  { id: "orders", label: "Orders" },
  { id: "users", label: "Users" },
  { id: "logs", label: "Audit Log" },
];

const PICKUP_STATUSES = [
  "Pending",
  "Accepted",
  "Pickup Scheduled",
  "Collected",
  "Completed",
  "Rejected",
  "Cancelled",
];

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[#101512] ${className}`}
    >
      {children}
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#101512] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-4 break-words text-3xl font-bold text-lime-300">
        {value == null ? "—" : String(value)}
      </p>
    </div>
  );
}

function LoadingMessage() {
  return (
    <p className="p-6 text-sm text-slate-400" role="status">
      Loading data...
    </p>
  );
}

function EmptyMessage({ children }) {
  return (
    <p className="p-8 text-center text-sm text-slate-400">{children}</p>
  );
}

export default function AdminDashboard() {
  const { user, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [orders, setOrders] = useState([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pickupsLoading, setPickupsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [error, setError] = useState("");
  const [tab, setTab] = useState("stats");
  const [busyId, setBusyId] = useState(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/admin/stats", { token });
      setStats(result.stats);
    } catch (err) {
      setError(err.message || "Could not load statistics.");
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/admin/users", { token });
      setUsers(result.users || []);
    } catch (err) {
      setError(err.message || "Could not load users.");
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/admin/audit-logs", { token });
      setLogs(result.logs || []);
    } catch (err) {
      setError(err.message || "Could not load audit logs.");
    } finally {
      setLogsLoading(false);
    }
  }, [token]);

  const loadPickups = useCallback(async () => {
    setPickupsLoading(true);
    setError("");

    try {
      const result = await adminListPickups(token);
      setPickups(result.pickups || []);
    } catch (err) {
      setError(err.message || "Could not load pickups.");
    } finally {
      setPickupsLoading(false);
    }
  }, [token]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setError("");

    try {
      const result = await adminListOrders(token);
      setOrders(result.orders || []);
    } catch (err) {
      setError(err.message || "Could not load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadStats();
    } else {
      setStatsLoading(false);
    }
  }, [user?.role, loadStats]);

  useEffect(() => {
    if (user?.role !== "admin") return;

    if (tab === "users") loadUsers();
    if (tab === "logs") loadLogs();
    if (tab === "pickups") loadPickups();
    if (tab === "orders") loadOrders();
  }, [tab, user?.role, loadUsers, loadLogs, loadPickups, loadOrders]);

  async function handleRoleChange(targetUser, newRole) {
    if (targetUser._id === user?._id) {
      setError("You cannot change your own role from this screen.");
      return;
    }

    const confirmed = window.confirm(
      `Change ${targetUser.name || targetUser.email}'s role to ${newRole}?`
    );
    if (!confirmed) return;

    setBusyId(targetUser._id);
    setError("");

    try {
      await apiRequest(`/api/admin/users/${targetUser._id}/role`, {
        method: "PUT",
        token,
        body: { role: newRole },
      });
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not update user role.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdatePickup(pickupId, newStatus) {
    const note = window.prompt(`Enter an admin note for status change to "${newStatus}" (optional):`);
    if (note === null) return; // User cancelled

    setBusyId(pickupId);
    setError("");

    try {
      await adminUpdatePickupStatus(token, pickupId, { status: newStatus, note });
      await loadPickups();
    } catch (err) {
      alert(err.message || "Could not update pickup status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#080b0a] px-5 py-7 text-white sm:px-8 sm:py-10">
      <div className="relative mx-auto max-w-6xl">
        {/* Navigation */}
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
                Administration Console
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/orders" className="text-slate-400 hover:text-lime-300">
              Orders & Pickups
            </Link>
            <Link to="/dashboard" className="text-slate-400 hover:text-lime-300">
              User Dashboard
            </Link>
          </div>
        </header>

        {/* Heading */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            <span className="h-px w-7 bg-lime-300" />
            Operations & Control
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Admin <span className="text-lime-300">Dashboard</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor circular logistics, doorstep collection requests, transactions, and system audit logs.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                tab === t.id
                  ? "bg-lime-300 text-black shadow-lg shadow-lime-300/10"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}

          <Link
            to="/admin/prices"
            className="ml-auto rounded-xl border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-lime-200"
          >
            Price Records Database →
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4"
          >
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* 1. Statistics Tab */}
        {tab === "stats" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Platform Metrics</h2>
                <p className="mt-1 text-xs text-slate-500">Live operational counts from MongoDB</p>
              </div>

              <button
                type="button"
                onClick={loadStats}
                disabled={statsLoading}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
              >
                {statsLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {statsLoading && !stats && <LoadingMessage />}

            {!statsLoading && stats && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats).map(([key, value]) => (
                  <StatCard
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1")}
                    value={
                      typeof value === "object" && value !== null
                        ? JSON.stringify(value)
                        : value
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. Pickups Tab (Admin Dispatch & Status Control) */}
        {tab === "pickups" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Doorstep Recycling Pickups</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage e-waste collection requests, verify hardware, and update field logistics.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPickups}
                disabled={pickupsLoading}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
              >
                {pickupsLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <Panel className="overflow-hidden">
              {pickupsLoading && <LoadingMessage />}

              {!pickupsLoading && pickups.length === 0 && !error && (
                <EmptyMessage>No pickup requests currently on file.</EmptyMessage>
              )}

              {!pickupsLoading &&
                pickups.map((pck) => (
                  <div
                    key={pck._id}
                    className="border-b border-white/[0.06] p-5 last:border-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-lime-300">
                          {pck.referenceId}
                        </span>
                        <span className="ml-3 text-xs text-slate-400">
                          User: <strong className="text-white">{pck.user?.name || "Customer"}</strong> ({pck.user?.email})
                        </span>
                      </div>
                      <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2.5 py-0.5 text-xs font-semibold text-lime-200">
                        {pck.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2 text-xs text-slate-300 space-y-1">
                        <p>
                          <strong>Item:</strong>{" "}
                          {pck.itemType === "device"
                            ? `Device — ${pck.device?.name || "Registered Device"}`
                            : pck.itemType === "component"
                            ? `Component — ${pck.component?.brand || ""} ${pck.component?.model || ""}`
                            : `Custom — ${pck.customItemDetails?.title || "Mixed E-Waste"}`}
                        </p>
                        <p>
                          <strong>Scheduled Date:</strong>{" "}
                          {new Date(pck.preferredDate).toLocaleDateString()} ({pck.timeSlot})
                        </p>
                        <p>
                          <strong>Location:</strong> {pck.pickupAddress?.fullName} (📱 {pck.pickupAddress?.phone}) —{" "}
                          {pck.pickupAddress?.building}, {pck.pickupAddress?.street}, {pck.pickupAddress?.city},{" "}
                          {pck.pickupAddress?.state} - <span className="text-lime-300 font-bold">{pck.pickupAddress?.pincode}</span>
                        </p>
                        {pck.instructions && (
                          <p className="text-slate-400 italic">Note: "{pck.instructions}"</p>
                        )}
                      </div>

                      <div className="flex flex-col justify-between items-end">
                        <div className="text-right text-xs">
                          <p className="text-slate-400">Estimated Value: ₹{pck.valuationSnapshot?.estimatedValue || 0}</p>
                        </div>

                        {!["Completed", "Cancelled", "Rejected"].includes(pck.status) && (
                          <div className="mt-2 flex items-center gap-2">
                            <label className="text-[11px] text-slate-400">Update Status:</label>
                            <select
                              disabled={busyId === pck._id}
                              value={pck.status}
                              onChange={(e) => handleUpdatePickup(pck._id, e.target.value)}
                              className="rounded-lg border border-white/10 bg-[#161c18] px-2 py-1 text-xs text-lime-300 focus:outline-none"
                            >
                              {PICKUP_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </Panel>
          </section>
        )}

        {/* 3. Orders Tab (Platform Oversight) */}
        {tab === "orders" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Marketplace Transactions</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Hardware purchase orders, buyer/seller addresses, and fulfillment states.
                </p>
              </div>

              <button
                type="button"
                onClick={loadOrders}
                disabled={ordersLoading}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
              >
                {ordersLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <Panel className="overflow-hidden">
              {ordersLoading && <LoadingMessage />}

              {!ordersLoading && orders.length === 0 && !error && (
                <EmptyMessage>No marketplace orders placed yet.</EmptyMessage>
              )}

              {!ordersLoading &&
                orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="border-b border-white/[0.06] p-5 last:border-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-lime-300">
                          {ord.orderReference}
                        </span>
                        <span className="ml-3 text-xs text-slate-400">
                          Date: {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-200">
                        {ord.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2 text-xs text-slate-300 space-y-1">
                        <p>
                          <strong>Item:</strong> {ord.listing?.title || "Component Item"}
                        </p>
                        <p>
                          <strong>Buyer:</strong> {ord.buyer?.name} ({ord.buyer?.email}) ·{" "}
                          <strong>Seller:</strong> {ord.seller?.name} ({ord.seller?.email})
                        </p>
                        <p>
                          <strong>Ship To:</strong> {ord.shippingAddress?.fullName} (📱 {ord.shippingAddress?.phone}) —{" "}
                          {ord.shippingAddress?.building}, {ord.shippingAddress?.street}, {ord.shippingAddress?.city},{" "}
                          {ord.shippingAddress?.state} - {ord.shippingAddress?.pincode}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total Price</p>
                        <p className="text-lg font-bold text-lime-300">
                          ₹{Number(ord.totalPrice).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-emerald-400">Pay on Handover</p>
                      </div>
                    </div>
                  </div>
                ))}
            </Panel>
          </section>
        )}

        {/* 4. Users Tab */}
        {tab === "users" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">User Accounts</h2>
                <p className="mt-1 text-xs text-slate-500">Manage account roles and privileges.</p>
              </div>

              <button
                type="button"
                onClick={loadUsers}
                disabled={usersLoading}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
              >
                {usersLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <Panel className="overflow-hidden">
              {usersLoading && <LoadingMessage />}

              {!usersLoading && users.length === 0 && !error && (
                <EmptyMessage>No users found.</EmptyMessage>
              )}

              {!usersLoading &&
                users.map((u) => (
                  <div
                    key={u._id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-300">
                        {u.role}
                      </span>
                      {u._id !== user?.id && (
                        <button
                          type="button"
                          disabled={busyId === u._id}
                          onClick={() =>
                            handleRoleChange(u, u.role === "admin" ? "user" : "admin")
                          }
                          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
                        >
                          {u.role === "admin" ? "Demote to user" : "Promote to admin"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </Panel>
          </section>
        )}

        {/* 5. Audit Log Tab */}
        {tab === "logs" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Audit Log</h2>
                <p className="mt-1 text-xs text-slate-500">Security and lifecycle trail.</p>
              </div>

              <button
                type="button"
                onClick={loadLogs}
                disabled={logsLoading}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
              >
                {logsLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <Panel className="overflow-hidden">
              {logsLoading && <LoadingMessage />}

              {!logsLoading && logs.length === 0 && !error && (
                <EmptyMessage>No audit log entries found.</EmptyMessage>
              )}

              {!logsLoading &&
                logs.map((log) => (
                  <article
                    key={log._id}
                    className="border-b border-white/[0.06] p-4 last:border-0"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {log.action}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Actor: {log.actorName || "System"}
                        </p>
                      </div>

                      <time className="text-xs text-slate-500">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                      </time>
                    </div>

                    {log.metadata != null && (
                      <details className="mt-3 rounded-xl border border-white/[0.07] bg-black/20 p-2.5">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-lime-200">
                          Metadata payload
                        </summary>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-400">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </article>
                ))}
            </Panel>
          </section>
        )}

        <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-white/[0.07] pt-5 text-xs text-slate-600">
          <span>ECYCLE.AI · Central Operations & Logistics</span>
          <Link to="/admin/prices" className="text-slate-400 hover:text-lime-300">
            Manage Price Database →
          </Link>
        </footer>
      </div>
    </main>
  );
}

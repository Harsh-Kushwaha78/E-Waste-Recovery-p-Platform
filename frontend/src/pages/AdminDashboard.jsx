// frontend/src/pages/AdminDashboard.jsx

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

const TABS = [
  { id: "stats", label: "Statistics" },
  { id: "users", label: "Users" },
  { id: "logs", label: "Audit Log" },
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
        {value == null ? "â€”" : String(value)}
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

  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const [error, setError] = useState("");
  const [tab, setTab] = useState("stats");
  const [busyUserId, setBusyUserId] = useState(null);

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
  }, [tab, user?.role, loadUsers, loadLogs]);

  async function handleRoleChange(targetUser, newRole) {
    if (targetUser._id === user?._id) {
      setError("You cannot change your own role from this screen.");
      return;
    }

    const confirmed = window.confirm(
      `Change ${targetUser.name || targetUser.email}'s role to ${newRole}?`
    );

    if (!confirmed) return;

    setBusyUserId(targetUser._id);
    setError("");

    try {
      await apiRequest(`/api/admin/users/${targetUser._id}/role`, {
        method: "PUT",
        body: { role: newRole },
        token,
      });

      const result = await apiRequest("/api/admin/users", { token });
      setUsers(result.users || []);
    } catch (err) {
      setError(err.message || "Could not update user role.");
    } finally {
      setBusyUserId(null);
    }
  }

  // Access restriction
  if (user && user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b0a] p-5 text-white">
        <Panel className="w-full max-w-lg p-8 text-center">
          <h1 className="text-2xl font-bold">Restricted Access</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            This page requires an administrator account.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-black hover:bg-lime-200"
          >
            Back to dashboard
          </Link>
        </Panel>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b0a] text-white">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-lime-300/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link to="/" className="text-lg font-bold tracking-[0.15em]">
            ECYCLE<span className="text-lime-300">.AI</span>
            <span className="ml-3 text-xs font-normal tracking-normal text-slate-500">
              ADMIN
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="text-sm text-slate-400 hover:text-lime-300"
          >
            Back to dashboard â†’
          </Link>
        </header>

        {/* Title */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            Control Center
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Admin <span className="text-lime-300">Dashboard.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Monitor platform statistics, manage account roles, and review
            recorded audit activity.
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setError("");
                setTab(item.id);
              }}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                tab === item.id
                  ? "border border-lime-300/20 bg-lime-300/10 text-lime-200"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}

          <Link
            to="/admin/prices"
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:text-lime-200"
          >
            Price Data â†’
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4"
          >
            <p className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => {
                if (tab === "stats") loadStats();
                if (tab === "users") loadUsers();
                if (tab === "logs") loadLogs();
              }}
              className="mt-3 text-xs font-semibold text-red-200 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics tab */}
        {tab === "stats" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Platform Statistics</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Values returned by the backend.
                </p>
              </div>

              <button
                type="button"
                onClick={loadStats}
                disabled={statsLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
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

            {!statsLoading && !stats && !error && (
              <Panel>
                <EmptyMessage>No statistics were returned.</EmptyMessage>
              </Panel>
            )}
          </section>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">User Management</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage registered accounts and roles.
                </p>
              </div>

              <button
                type="button"
                onClick={loadUsers}
                disabled={usersLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
              >
                {usersLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <Panel className="overflow-hidden">
              {usersLoading && <LoadingMessage />}

              {!usersLoading && users.length === 0 && !error && (
                <EmptyMessage>No user accounts found.</EmptyMessage>
              )}

              {!usersLoading &&
                users.map((targetUser) => {
                  const isAdmin = targetUser.role === "admin";
                  const isSelf = targetUser._id === user?._id;
                  const isBusy = busyUserId === targetUser._id;

                  return (
                    <div
                      key={targetUser._id}
                      className="flex flex-col justify-between gap-4 border-b border-white/[0.06] p-5 last:border-0 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-white">
                          {targetUser.name || "Unnamed user"}
                          {isSelf && (
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          {targetUser.email}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            isAdmin
                              ? "border-lime-300/20 bg-lime-300/10 text-lime-200"
                              : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {targetUser.role || "user"}
                        </span>

                        <button
                          type="button"
                          disabled={isSelf || isBusy}
                          onClick={() =>
                            handleRoleChange(
                              targetUser,
                              isAdmin ? "user" : "admin"
                            )
                          }
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isBusy
                            ? "Updating..."
                            : isAdmin
                              ? "Demote"
                              : "Promote"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </Panel>
          </section>
        )}

        {/* Audit logs tab */}
        {tab === "logs" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Audit Log</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review events recorded by the platform.
                </p>
              </div>

              <button
                type="button"
                onClick={loadLogs}
                disabled={logsLoading}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
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
                    className="border-b border-white/[0.06] p-5 last:border-0"
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div>
                        <p className="break-words text-sm font-semibold text-slate-100">
                          {log.action || "Recorded event"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          By {log.actorName || "Unknown actor"}
                        </p>
                      </div>

                      <time className="text-xs text-slate-500">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </time>
                    </div>

                    {log.metadata != null && (
                      <details className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-3">
                        <summary className="cursor-pointer text-xs font-semibold text-slate-400 hover:text-lime-200">
                          View metadata
                        </summary>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">
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
          <span>ECYCLE.AI Â· Administrator Workspace</span>
          <Link
            to="/admin/prices"
            className="text-slate-400 hover:text-lime-300"
          >
            Manage price data â†’
          </Link>
        </footer>
      </div>
    </main>
  );
}

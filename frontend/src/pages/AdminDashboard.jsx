// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("stats");

  useEffect(() => {
    if (user?.role !== "admin") return;
    apiRequest("/api/admin/stats", { token }).then((d) => setStats(d.stats)).catch((e) => setError(e.message));
  }, [user]);

  useEffect(() => {
    if (tab === "users") {
      apiRequest("/api/admin/users", { token }).then((d) => setUsers(d.users)).catch((e) => setError(e.message));
    }
    if (tab === "logs") {
      apiRequest("/api/admin/audit-logs", { token }).then((d) => setLogs(d.logs)).catch((e) => setError(e.message));
    }
  }, [tab]);

  async function handleRoleChange(userId, newRole) {
    try {
      await apiRequest(`/api/admin/users/${userId}/role`, { method: "PUT", body: { role: newRole }, token });
      const d = await apiRequest("/api/admin/users", { token });
      setUsers(d.users);
    } catch (e) {
      setError(e.message);
    }
  }

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600">This page requires admin access.</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline text-sm mt-3 inline-block">
            &larr; Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          &larr; Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-slate-800 mt-4 mb-4">Admin Dashboard</h1>

        <div className="flex gap-4 mb-4 text-sm border-b border-slate-200">
          {["stats", "users", "logs"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 px-1 ${tab === t ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-slate-500"}`}
            >
              {t === "stats" ? "Statistics" : t === "users" ? "Users" : "Audit Log"}
            </button>
          ))}
          <Link to="/admin/prices" className="pb-2 px-1 text-slate-500 hover:text-slate-800">
            Price Data &rarr;
          </Link>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {tab === "stats" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <p className="text-2xl font-semibold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {users.map((u) => (
              <div key={u._id} className="flex justify-between items-center p-4 border-b border-slate-100 last:border-0 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {u.role}
                  </span>
                  <button
                    onClick={() => handleRoleChange(u._id, u.role === "admin" ? "user" : "admin")}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "logs" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {logs.map((l) => (
              <div key={l._id} className="p-3 border-b border-slate-100 last:border-0 text-xs">
                <span className="font-medium text-slate-700">{l.action}</span>
                <span className="text-slate-400"> by {l.actorName} · {new Date(l.createdAt).toLocaleString()}</span>
                {l.metadata && (
                  <pre className="text-slate-400 mt-1 whitespace-pre-wrap">{JSON.stringify(l.metadata)}</pre>
                )}
              </div>
            ))}
            {logs.length === 0 && <p className="p-4 text-slate-400 text-sm">No audit log entries yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

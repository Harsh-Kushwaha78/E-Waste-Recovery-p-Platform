// frontend/src/pages/Profile.jsx
//
// Deliberately re-fetches /api/users/me from the backend using the stored
// token, rather than just showing the cached user from context. This is
// the real end-to-end proof that the JWT + protect middleware works,
// not just that login succeeded once.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

export default function Profile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/users/me", { token })
      .then((data) => setProfile(data.user))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-lg mx-auto">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          &larr; Back to dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-4">
          <h1 className="text-xl font-semibold text-slate-800 mb-4">Profile</h1>

          {loading && <p className="text-slate-400">Loading...</p>}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </p>
          )}

          {profile && (
            <dl className="space-y-3 text-sm">
              <Row label="Name" value={profile.name} />
              <Row label="Email" value={profile.email} />
              <Row label="Role" value={profile.role} />
              <Row
                label="Joined"
                value={new Date(profile.createdAt).toLocaleDateString()}
              />
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-800 font-medium">{value}</dd>
    </div>
  );
}

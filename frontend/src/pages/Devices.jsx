// frontend/src/pages/Devices.jsx
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

export default function Devices() {
  const { token, user, logout } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    listDevices(token)
      .then((data) => setDevices(data.devices))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <nav className="flex justify-between items-center mb-8">
          <span className="font-semibold text-slate-800">E-Waste Platform</span>
          <div className="flex gap-4 items-center text-sm">
            <span className="text-slate-500">{user?.name}</span>
            <Link to="/profile" className="text-slate-600 hover:text-slate-900">
              Profile
            </Link>
            <button onClick={logout} className="text-red-600 hover:text-red-700 font-medium">
              Log out
            </button>
          </div>
        </nav>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-slate-800">Your Devices</h1>
          <Link
            to="/devices/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + Add Device
          </Link>
        </div>

        {loading && <p className="text-slate-400">Loading devices...</p>}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">
              No devices yet. Add your first non-working device to get started.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {devices.map((device) => (
            <Link
              key={device._id}
              to={`/devices/${device._id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-blue-300 transition block"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-slate-800">{device.name}</h2>
                  <p className="text-sm text-slate-500">
                    {CATEGORY_LABELS[device.category] || device.category}
                    {device.brand ? ` · ${device.brand}` : ""}
                    {device.model ? ` ${device.model}` : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(device.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

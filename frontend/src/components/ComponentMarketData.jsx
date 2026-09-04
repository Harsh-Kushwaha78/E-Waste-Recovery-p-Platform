// frontend/src/components/ComponentMarketData.jsx
//
// Shows the "used-market price" range distinct from the ML "recoverable
// value" prediction and from admin/new price (three price types must
// stay visually distinct). Always honest about whether this is live
// data (never available yet - no provider configured) or historical/
// admin data with a last-updated date.

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMarketData } from "../lib/market";

export default function ComponentMarketData({ componentType, brand }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    try {
      const result = await getMarketData(token, componentType, brand);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <button
        onClick={handleFetch}
        disabled={loading}
        className="text-xs text-blue-600 hover:underline font-medium disabled:text-blue-300"
      >
        {loading ? "Checking..." : "Check used-market price"}
      </button>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {data && (
        <div className="mt-2 bg-slate-50 rounded-lg p-3 text-xs">
          <p className="font-medium text-slate-700 mb-1">
            {data.usedSource === "live" ? "Live market data" : "Historical price data"}
          </p>

          {data.usedSource === "historical" && data.historical.available && (
            <>
              <p className="text-slate-800 font-semibold text-sm">
                ₹{data.historical.min} – ₹{data.historical.max}
                <span className="text-slate-400 font-normal"> (avg ₹{data.historical.average})</span>
              </p>
              <p className="text-slate-500 mt-1">
                Based on {data.historical.sampleSize} record(s) · Last updated{" "}
                {new Date(data.historical.lastUpdated).toLocaleDateString()}
              </p>
              <p className="text-slate-400">Sources: {data.historical.sources.join(", ")}</p>
            </>
          )}

          {data.usedSource === "historical" && !data.historical.available && (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5">
              {data.historical.note}
            </p>
          )}

          <p className="text-slate-400 mt-1 italic">
            Live market data unavailable - no live provider configured for this deployment.
          </p>
        </div>
      )}
    </div>
  );
}

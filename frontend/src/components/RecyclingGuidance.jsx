// frontend/src/components/RecyclingGuidance.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

const CATEGORY_LABELS = {
  hazardous: "Hazardous - special handling required",
  e_waste_recyclable: "E-waste recyclable",
  general_recyclable: "General recyclable",
};

export default function RecyclingGuidance({ componentType }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest(`/api/recycling?componentType=${componentType}`, { token });
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
        {loading ? "Loading..." : "Recycling guidance"}
      </button>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {data && (
        <div className="mt-2 bg-slate-50 rounded-lg p-3 text-xs">
          <p className={`font-semibold mb-1 ${data.classification.hazardous ? "text-red-700" : "text-slate-700"}`}>
            {CATEGORY_LABELS[data.classification.category]}
          </p>
          <ul className="list-disc list-inside text-slate-600 mb-2">
            {data.classification.guidance.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>

          {data.localOptions.length > 0 ? (
            <div>
              <p className="font-medium text-slate-700 mb-1">Local drop-off points:</p>
              {data.localOptions.map((o) => (
                <div key={o._id} className="mb-1">
                  <p className="text-slate-700">{o.recyclerName}</p>
                  {o.address && <p className="text-slate-400">{o.address}</p>}
                  {o.contact && <p className="text-slate-400">{o.contact}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">{data.localOptionsNote}</p>
          )}
        </div>
      )}
    </div>
  );
}

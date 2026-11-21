// frontend/src/components/RecyclingGuidance.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import PickupModal from "./PickupModal";

const CATEGORY_LABELS = {
  hazardous: "Hazardous - special handling required",
  e_waste_recyclable: "E-waste recyclable",
  general_recyclable: "General recyclable",
};

export default function RecyclingGuidance({ componentType, component = null }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);

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
    <div className="mt-3 pt-3 border-t border-white/[0.08]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="text-xs text-lime-300 hover:underline font-semibold disabled:text-slate-500"
        >
          {loading ? "Loading guidance..." : "♻️ Recycling & drop-off guidance"}
        </button>

        <button
          type="button"
          onClick={() => setPickupModalOpen(true)}
          className="rounded-lg bg-lime-300/10 border border-lime-300/30 px-2.5 py-1 text-[11px] font-bold text-lime-300 hover:bg-lime-300/20"
        >
          🚚 Schedule Doorstep Pickup
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      {data && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs">
          <p
            className={`font-semibold mb-1 ${
              data.classification.hazardous ? "text-amber-300" : "text-emerald-300"
            }`}
          >
            {CATEGORY_LABELS[data.classification.category] || data.classification.category}
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 mb-3">
            {data.classification.guidance.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>

          {data.localOptions?.length > 0 ? (
            <div className="border-t border-white/[0.06] pt-2">
              <p className="font-semibold text-slate-300 mb-1">Local physical drop-off points:</p>
              {data.localOptions.map((o) => (
                <div key={o._id} className="mb-2 last:mb-0 rounded bg-white/[0.02] p-2">
                  <p className="text-slate-200 font-medium">{o.recyclerName}</p>
                  {o.address && <p className="text-slate-400 text-[11px]">{o.address}</p>}
                  {o.contact && <p className="text-slate-400 text-[11px]">Contact: {o.contact}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic text-[11px]">{data.localOptionsNote}</p>
          )}
        </div>
      )}

      <PickupModal
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        initialComponent={component}
      />
    </div>
  );
}

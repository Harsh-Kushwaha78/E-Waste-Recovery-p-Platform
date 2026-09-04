// frontend/src/components/ValuationReport.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { generateValuation } from "../lib/valuation";

const TYPE_LABELS = {
  ram: "RAM", ssd: "SSD", hdd: "HDD", battery: "Battery", motherboard: "Motherboard",
  display: "Display", gpu: "GPU", cooling_fan: "Cooling Fan", wifi_card: "Wi-Fi Card",
  charger: "Charger", keyboard: "Keyboard", camera: "Camera", speaker: "Speaker", other: "Other",
};

const BASIS_LABELS = {
  ml_prediction: "ML estimate",
  scrap_estimate: "Scrap estimate",
  unavailable: "Unavailable",
};

const CONFIDENCE_STYLES = {
  HIGH: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-red-100 text-red-700",
};

export default function ValuationReport({ deviceId, onGenerated }) {
  const { token } = useAuth();
  const [valuation, setValuation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await generateValuation(token, deviceId);
      setValuation(data.valuation);
      if (onGenerated) onGenerated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium text-slate-800">Valuation Report</h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
        >
          {loading ? "Calculating..." : valuation ? "Regenerate" : "Generate Report"}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Combines functional test results, ML price predictions, and
        scrap estimates. Not a live market price - see basis per component below.
      </p>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {valuation && (
        <div>
          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 mb-3">
            <div>
              <p className="text-xs text-slate-500">Total recoverable value</p>
              <p className="text-2xl font-semibold text-slate-800">
                ₹{valuation.totalRecoverableValue}
              </p>
              {valuation.usedMarketRangeLow != null && (
                <p className="text-xs text-slate-500 mt-1">
                  Used-market range (sum of component ranges): ₹{valuation.usedMarketRangeLow} – ₹{valuation.usedMarketRangeHigh}
                </p>
              )}
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${CONFIDENCE_STYLES[valuation.overallConfidence]}`}
            >
              {valuation.overallConfidence} confidence
            </span>
          </div>

          {valuation.hasDemoData && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
              ⚠ Includes predictions from a model trained on DEMO DATA - not real market prices.
            </p>
          )}
          {valuation.hasUnavailableComponents && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
              ⚠ One or more components could not be priced (a service was unavailable) - total may be understated.
            </p>
          )}

          <div className="divide-y divide-slate-100">
            {valuation.componentValuations.map((cv, i) => (
              <div key={i} className="flex justify-between items-center py-2 text-sm">
                <div>
                  <span className="font-medium text-slate-700">
                    {TYPE_LABELS[cv.componentType] || cv.componentType}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {cv.workingStatus.replace("_", " ")} · {BASIS_LABELS[cv.valueBasis]}
                  </span>
                </div>
                <span className="font-medium text-slate-800">
                  ₹{cv.valueBasis === "scrap_estimate" ? cv.scrapValue : cv.recoverableValue}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Generated {new Date(valuation.createdAt).toLocaleString()}. Note:
            this system does not track new/retail prices, so only
            used-market range and recoverable value are shown here.
          </p>
        </div>
      )}
    </div>
  );
}

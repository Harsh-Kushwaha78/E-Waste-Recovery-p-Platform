// frontend/src/components/ComponentPrediction.jsx
//
// Requests and displays a price prediction for one component. Always
// shows the demo-data disclaimer prominently when applicable (master
// prompt section 6 - No Fake AI Rule extends to "no fake real data").
// Handles the ml-service-down case gracefully rather than crashing the
// component card.

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { requestPrediction } from "../lib/predictions";
import { apiRequest } from "../lib/api";

const CONFIDENCE_STYLES = {
  HIGH: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-red-100 text-red-700",
};

export default function ComponentPrediction({ componentId }) {
  const { token } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [why, setWhy] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);

  async function handlePredict() {
    setLoading(true);
    setError(null);
    setWhy(null);
    try {
      const data = await requestPrediction(token, componentId);
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleWhy() {
    setWhyLoading(true);
    try {
      const data = await apiRequest(`/api/predictions/components/${componentId}/why`, { token });
      setWhy(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setWhyLoading(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <button
        onClick={handlePredict}
        disabled={loading}
        className="text-xs text-blue-600 hover:underline font-medium disabled:text-blue-300"
      >
        {loading ? "Estimating..." : "Estimate recoverable value"}
      </button>

      {error && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
          {error}
        </p>
      )}

      {prediction && (
        <div className="mt-2 bg-slate-50 rounded-lg p-3 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-800 text-sm">
              ₹{prediction.rangeLow} – ₹{prediction.rangeHigh}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                CONFIDENCE_STYLES[prediction.confidence] || CONFIDENCE_STYLES.LOW
              }`}
            >
              {prediction.confidence} confidence
            </span>
          </div>
          <p className="text-slate-500">
            Point estimate: ₹{prediction.pointEstimate} · Model {prediction.modelName}{" "}
            ({prediction.modelVersion}, {prediction.algorithm})
          </p>
          {prediction.isDemoData && (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5 mt-1.5 font-medium">
              ⚠ {prediction.dataDisclaimer}
            </p>
          )}

          <button
            onClick={handleWhy}
            disabled={whyLoading}
            className="text-blue-600 hover:underline font-medium mt-2"
          >
            {whyLoading ? "Loading..." : why ? "Refresh explanation" : "Why this price?"}
          </button>

          {why && (
            <div className="mt-2 space-y-2">
              <div>
                <p className="font-semibold text-slate-600">Model-derived (what mattered most to the model overall):</p>
                <ul className="list-disc list-inside text-slate-500">
                  {why.modelDerived.topFeatureImportances.slice(0, 5).map((f, i) => (
                    <li key={i}>
                      {f.feature} <span className="text-slate-400">({(f.importance * 100).toFixed(1)}%)</span>
                    </li>
                  ))}
                </ul>
                <p className="text-slate-400 italic mt-0.5">{why.modelDerived.caveat}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600">About this specific component:</p>
                <ul className="list-disc list-inside text-slate-500">
                  {why.generalExplanation.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

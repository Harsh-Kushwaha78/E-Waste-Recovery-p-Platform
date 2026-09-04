// frontend/src/components/ValuationHistoryChart.jsx
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { getValuationHistory } from "../lib/valuationHistory";

export default function ValuationHistoryChart({ deviceId, refreshKey }) {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getValuationHistory(token, deviceId)
      .then((data) => setHistory(data.history))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [deviceId, refreshKey]);

  if (loading || history.length < 2) return null;

  const chartData = history.map((h) => ({
    date: new Date(h.createdAt).toLocaleDateString(),
    value: h.totalRecoverableValue,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
      <h3 className="font-medium text-slate-800 mb-3">Valuation History</h3>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`₹${v}`, "Total recoverable value"]} />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        {history.length} valuation{history.length !== 1 ? "s" : ""} generated over time.
      </p>
    </div>
  );
}

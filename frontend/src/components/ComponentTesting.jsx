// frontend/src/components/ComponentTesting.jsx
//
// Renders a type-specific test form (booleans/numbers depending on
// component type) and the test history log for one component. Submitting
// a test updates the component's workingStatus via the backend's
// deriveWorkingStatus logic - the frontend never computes a status
// itself, it only displays what the backend derived (single source of
// truth for the trust system).

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listTests, submitTest, TEST_FIELDS } from "../lib/tests";
import StatusBadge from "./StatusBadge";

export default function ComponentTesting({ component, onComponentUpdated }) {
  const { token } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fields = TEST_FIELDS[component.type] || TEST_FIELDS.other;

  function loadHistory() {
    setLoadingHistory(true);
    listTests(token, component._id)
      .then((data) => setHistory(data.tests))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory]);

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex gap-3 text-xs">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-blue-600 hover:underline font-medium"
        >
          {showForm ? "Cancel test" : "Run a test"}
        </button>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="text-slate-500 hover:underline"
        >
          {showHistory ? "Hide history" : "View test history"}
        </button>
      </div>

      {showForm && (
        <TestForm
          fields={fields}
          componentId={component._id}
          token={token}
          onSubmitted={(result) => {
            setShowForm(false);
            onComponentUpdated(result.component);
            if (showHistory) loadHistory();
          }}
        />
      )}

      {showHistory && (
        <div className="mt-3 space-y-2">
          {loadingHistory && <p className="text-xs text-slate-400">Loading history...</p>}
          {!loadingHistory && history.length === 0 && (
            <p className="text-xs text-slate-400">No tests recorded yet.</p>
          )}
          {history.map((t) => (
            <div key={t._id} className="bg-slate-50 rounded-lg p-3 text-xs">
              <div className="flex justify-between items-center mb-1">
                <StatusBadge status={t.derivedStatus} />
                <span className="text-slate-400">
                  {new Date(t.testDate).toLocaleString()}
                  {t.testedBy ? ` · ${t.testedBy}` : ""}
                </span>
              </div>
              <ul className="text-slate-600 list-disc list-inside">
                {t.derivedReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              {t.evidenceNotes && (
                <p className="text-slate-500 mt-1 italic">"{t.evidenceNotes}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestForm({ fields, componentId, token, onSubmitted }) {
  const initial = {};
  for (const f of fields) initial[f.key] = "";
  const [values, setValues] = useState(initial);
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const results = {};
      for (const f of fields) {
        const raw = values[f.key];
        if (raw === "") continue; // not answered - leave undefined
        if (f.type === "bool") results[f.key] = raw === "true";
        if (f.type === "number") results[f.key] = Number(raw);
      }
      const data = await submitTest(token, componentId, { results, evidenceNotes });
      onSubmitted(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 bg-slate-50 rounded-lg p-4">
      <p className="text-xs text-slate-500 mb-3">
        Leave a field blank if you didn't check it - the result is derived
        from what you actually observed, not guessed.
      </p>

      {fields.map((f) => (
        <label key={f.key} className="block mb-2">
          <span className="block text-xs font-medium text-slate-600 mb-1">{f.label}</span>
          {f.type === "bool" ? (
            <select
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1.5"
            >
              <option value="">Not checked</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : (
            <input
              type="number"
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1.5"
            />
          )}
        </label>
      ))}

      <label className="block mb-3">
        <span className="block text-xs font-medium text-slate-600 mb-1">
          Evidence notes (optional)
        </span>
        <textarea
          rows={2}
          placeholder="e.g. 'Ran memtest86, no errors after 2 passes.'"
          value={evidenceNotes}
          onChange={(e) => setEvidenceNotes(e.target.value)}
          className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1.5"
        />
      </label>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
      >
        {submitting ? "Submitting..." : "Submit test"}
      </button>
    </form>
  );
}

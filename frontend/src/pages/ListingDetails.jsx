// frontend/src/pages/ListingDetails.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getListing } from "../lib/listings";
import StatusBadge from "../components/StatusBadge";

export default function ListingDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListing(token, id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 p-6 text-slate-400">Loading...</div>;
  if (error) return <div className="min-h-screen bg-slate-50 p-6 text-red-600">{error}</div>;

  const { listing, latestTest } = data;
  const c = listing.component;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/marketplace" className="text-sm text-blue-600 hover:underline">
          &larr; Back to marketplace
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{listing.title}</h1>
              <p className="text-slate-500">{c.brand} {c.model} {c.capacity ? `(${c.capacity})` : ""}</p>
            </div>
            <p className="text-2xl font-semibold text-slate-800">{listing.currency} {listing.price}</p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={c.workingStatus} />
            {c.health != null && <span className="text-sm text-slate-500">Health: {c.health}%</span>}
            <span className="text-sm text-slate-400">Condition: {c.condition}</span>
          </div>

          {listing.description && (
            <p className="text-slate-600 text-sm border-t border-slate-100 pt-4 mb-4">{listing.description}</p>
          )}

          <div className="bg-slate-50 rounded-lg p-4 text-sm mb-4">
            <p className="font-medium text-slate-700 mb-1">Verification evidence</p>
            {latestTest ? (
              <>
                <StatusBadge status={latestTest.derivedStatus} />
                <ul className="list-disc list-inside text-slate-600 mt-2">
                  {latestTest.derivedReasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                <p className="text-xs text-slate-400 mt-2">
                  Tested {new Date(latestTest.testDate).toLocaleDateString()}
                  {latestTest.testedBy ? ` by ${latestTest.testedBy}` : ""}
                </p>
              </>
            ) : (
              <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                ⚪ No functional test has been recorded for this component. Working status shown
                is unverified.
              </p>
            )}
          </div>

          <p className="text-sm text-slate-500">Seller: {listing.seller?.name}</p>
        </div>
      </div>
    </div>
  );
}

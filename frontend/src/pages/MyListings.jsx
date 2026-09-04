// frontend/src/pages/MyListings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { myListings, updateListing, deleteListing } from "../lib/listings";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  sold: "bg-slate-200 text-slate-600",
  removed: "bg-red-100 text-red-700",
};

export default function MyListings() {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setLoading(true);
    myListings(token)
      .then((data) => setListings(data.listings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleMarkSold(id) {
    await updateListing(token, id, { status: "sold" });
    refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this listing?")) return;
    await deleteListing(token, id);
    refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/marketplace" className="text-sm text-blue-600 hover:underline">
          &larr; Back to marketplace
        </Link>
        <h1 className="text-2xl font-semibold text-slate-800 mt-4 mb-4">My Listings</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {loading && <p className="text-slate-400">Loading...</p>}

        {!loading && listings.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">
              No listings yet. List a tested component for sale from its device page.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {listings.map((l) => (
            <div key={l._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-slate-800">{l.title}</h2>
                  <p className="text-sm text-slate-500">
                    {l.component?.type} · {l.component?.workingStatus?.replace("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{l.currency} {l.price}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status]}`}>
                    {l.status}
                  </span>
                </div>
              </div>
              {l.status === "active" && (
                <div className="flex gap-3 mt-3 text-xs">
                  <button onClick={() => handleMarkSold(l._id)} className="text-blue-600 hover:underline">
                    Mark as sold
                  </button>
                  <button onClick={() => handleDelete(l._id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

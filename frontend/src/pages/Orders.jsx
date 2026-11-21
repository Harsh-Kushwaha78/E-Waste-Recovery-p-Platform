// frontend/src/pages/Orders.jsx
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listMyOrders, updateOrderStatus } from "../lib/orders";
import { listMyPickups, cancelMyPickup } from "../lib/pickups";

const ORDER_STATUS_STYLES = {
  confirmed: "border-lime-300/20 bg-lime-300/10 text-lime-200",
  shipped: "border-blue-400/20 bg-blue-400/10 text-blue-200",
  delivered: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  cancelled: "border-red-400/20 bg-red-400/10 text-red-300",
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-200",
};

const PICKUP_STATUS_STYLES = {
  Pending: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  Accepted: "border-blue-400/20 bg-blue-400/10 text-blue-200",
  "Pickup Scheduled": "border-lime-300/20 bg-lime-300/10 text-lime-200",
  Collected: "border-purple-400/20 bg-purple-400/10 text-purple-200",
  Completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Rejected: "border-red-400/20 bg-red-400/10 text-red-300",
  Cancelled: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

export default function Orders() {
  const { token } = useAuth();

  const [tab, setTab] = useState("purchases"); // 'purchases', 'sales', 'pickups'
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [pickups, setPickups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusyId, setActionBusyId] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      if (tab === "purchases" || tab === "sales") {
        const orderRes = await listMyOrders(token);
        setPurchases(orderRes.purchases || []);
        setSales(orderRes.sales || []);
      } else if (tab === "pickups") {
        const pickupRes = await listMyPickups(token);
        setPickups(pickupRes.pickups || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUpdateOrderStatus(orderId, newStatus, note = "") {
    setActionBusyId(orderId);
    try {
      await updateOrderStatus(token, orderId, { status: newStatus, note });
      await loadData();
    } catch (err) {
      alert(err.message || "Could not update order status.");
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleCancelPickup(pickupId) {
    if (!window.confirm("Are you sure you want to cancel this scheduled pickup?")) return;
    setActionBusyId(pickupId);
    try {
      await cancelMyPickup(token, pickupId, "Cancelled by user via dashboard");
      await loadData();
    } catch (err) {
      alert(err.message || "Could not cancel pickup.");
    } finally {
      setActionBusyId(null);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#080b0a] px-5 py-7 text-white sm:px-8 sm:py-10">
      <div className="relative mx-auto max-w-5xl">
        {/* Navigation */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/25 bg-lime-300/10 text-lime-300 font-bold">
              ⚡
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.18em]">
                ECYCLE<span className="text-lime-300">.AI</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Circular Marketplace & Logistics
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/marketplace" className="text-slate-400 hover:text-lime-300">
              Marketplace
            </Link>
            <Link to="/dashboard" className="text-slate-400 hover:text-lime-300">
              Dashboard
            </Link>
            <Link to="/profile" className="text-slate-400 hover:text-lime-300">
              Profile
            </Link>
          </div>
        </header>

        {/* Title */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Activity & <span className="text-lime-300">Transactions</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Track your marketplace orders, sales fulfillment, and recycling doorstep pickups.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setTab("purchases")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "purchases"
                ? "bg-lime-300 text-black shadow-lg shadow-lime-300/10"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            My Purchases ({purchases.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("sales")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "sales"
                ? "bg-lime-300 text-black shadow-lg shadow-lime-300/10"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            Sales Fulfillment ({sales.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("pickups")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === "pickups"
                ? "bg-lime-300 text-black shadow-lg shadow-lime-300/10"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            Recycling Pickups ({pickups.length})
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500 animate-pulse">
            Loading transaction history...
          </div>
        ) : (
          <div>
            {/* 1. Purchases Tab */}
            {tab === "purchases" && (
              <div className="space-y-4">
                {purchases.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#101512] p-8 text-center">
                    <p className="text-sm text-slate-400">You haven't purchased any components yet.</p>
                    <Link
                      to="/marketplace"
                      className="mt-3 inline-block rounded-xl bg-lime-300 px-4 py-2 text-xs font-bold text-black hover:bg-lime-200"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  purchases.map((ord) => (
                    <div
                      key={ord._id}
                      className="rounded-2xl border border-white/10 bg-[#101512] p-5 shadow-xl"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-lime-300">
                            {ord.orderReference}
                          </span>
                          <span className="ml-3 text-xs text-slate-500">
                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            ORDER_STATUS_STYLES[ord.status] || "border-white/10 text-slate-300"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <h3 className="font-semibold text-white">
                            {ord.listing?.title || "Component Item"}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            Seller: {ord.seller?.name || "Community Seller"} ({ord.seller?.email})
                          </p>
                          <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs">
                            <p className="text-slate-400 font-medium">Delivery Address Snapshot:</p>
                            <p className="mt-0.5 text-slate-300">
                              {ord.shippingAddress?.fullName} ({ord.shippingAddress?.phone}) —{" "}
                              {ord.shippingAddress?.building}, {ord.shippingAddress?.street},{" "}
                              {ord.shippingAddress?.city}, {ord.shippingAddress?.state} -{" "}
                              {ord.shippingAddress?.pincode}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-right">
                          <div>
                            <p className="text-xs text-slate-400">Total Amount</p>
                            <p className="text-xl font-bold text-lime-300">
                              ₹{Number(ord.totalPrice).toLocaleString("en-IN")}
                            </p>
                            <p className="mt-1 text-[11px] text-emerald-400">
                              Pay on Delivery / Handover
                            </p>
                          </div>

                          {ord.status === "confirmed" && (
                            <button
                              type="button"
                              disabled={actionBusyId === ord._id}
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  ord._id,
                                  "cancelled",
                                  "Cancelled by buyer"
                                )
                              }
                              className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. Sales Tab */}
            {tab === "sales" && (
              <div className="space-y-4">
                {sales.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#101512] p-8 text-center">
                    <p className="text-sm text-slate-400">You haven't made any component sales yet.</p>
                    <Link
                      to="/devices"
                      className="mt-3 inline-block rounded-xl bg-lime-300 px-4 py-2 text-xs font-bold text-black hover:bg-lime-200"
                    >
                      Inspect Devices & List Parts
                    </Link>
                  </div>
                ) : (
                  sales.map((ord) => (
                    <div
                      key={ord._id}
                      className="rounded-2xl border border-white/10 bg-[#101512] p-5 shadow-xl"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-lime-300">
                            {ord.orderReference}
                          </span>
                          <span className="ml-3 text-xs text-slate-500">
                            Ordered: {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            ORDER_STATUS_STYLES[ord.status] || "border-white/10 text-slate-300"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <h3 className="font-semibold text-white">
                            {ord.listing?.title || "Sold Component"}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            Buyer: {ord.buyer?.name || "Customer"} ({ord.buyer?.email})
                          </p>
                          <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs">
                            <p className="text-slate-400 font-medium">Ship To Address:</p>
                            <p className="mt-0.5 text-slate-300">
                              {ord.shippingAddress?.fullName} (📱 {ord.shippingAddress?.phone}) —{" "}
                              {ord.shippingAddress?.building}, {ord.shippingAddress?.street},{" "}
                              {ord.shippingAddress?.city}, {ord.shippingAddress?.state} -{" "}
                              {ord.shippingAddress?.pincode}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-right">
                          <div>
                            <p className="text-xs text-slate-400">Payout to Collect</p>
                            <p className="text-xl font-bold text-lime-300">
                              ₹{Number(ord.totalPrice).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-col gap-2">
                            {ord.status === "confirmed" && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionBusyId === ord._id}
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      ord._id,
                                      "shipped",
                                      "Dispatched via courier / local handover"
                                    )
                                  }
                                  className="w-full rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/30"
                                >
                                  Mark as Shipped
                                </button>
                                <button
                                  type="button"
                                  disabled={actionBusyId === ord._id}
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      ord._id,
                                      "cancelled",
                                      "Cancelled by seller"
                                    )
                                  }
                                  className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                                >
                                  Cancel Sale
                                </button>
                              </>
                            )}

                            {ord.status === "shipped" && (
                              <button
                                type="button"
                                disabled={actionBusyId === ord._id}
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    ord._id,
                                    "delivered",
                                    "Confirmed delivered and handed over"
                                  )
                                }
                                className="w-full rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Recycling Pickups Tab */}
            {tab === "pickups" && (
              <div className="space-y-4">
                {pickups.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#101512] p-8 text-center">
                    <p className="text-sm text-slate-400">No recycling pickup requests recorded.</p>
                    <Link
                      to="/devices"
                      className="mt-3 inline-block rounded-xl bg-lime-300 px-4 py-2 text-xs font-bold text-black hover:bg-lime-200"
                    >
                      View Devices to Schedule Pickup
                    </Link>
                  </div>
                ) : (
                  pickups.map((pck) => (
                    <div
                      key={pck._id}
                      className="rounded-2xl border border-white/10 bg-[#101512] p-5 shadow-xl"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-lime-300">
                            {pck.referenceId}
                          </span>
                          <span className="ml-3 text-xs text-slate-500">
                            Slot: {new Date(pck.preferredDate).toLocaleDateString()} ({pck.timeSlot})
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            PICKUP_STATUS_STYLES[pck.status] || "border-white/10 text-slate-300"
                          }`}
                        >
                          {pck.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <h3 className="font-semibold text-white">
                            {pck.itemType === "device"
                              ? `Device: ${pck.device?.name || "Registered Device"}`
                              : pck.itemType === "component"
                              ? `Component: ${pck.component?.brand || ""} ${pck.component?.model || ""}`
                              : `Custom E-Waste: ${pck.customItemDetails?.title || "Mixed E-Waste"}`}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            Type: <span className="capitalize">{pck.itemType.replaceAll("_", " ")}</span>
                            {pck.instructions ? ` · Instructions: "${pck.instructions}"` : ""}
                          </p>

                          <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs">
                            <p className="text-slate-400 font-medium">Pickup Address Snapshot:</p>
                            <p className="mt-0.5 text-slate-300">
                              {pck.pickupAddress?.fullName} ({pck.pickupAddress?.phone}) —{" "}
                              {pck.pickupAddress?.building}, {pck.pickupAddress?.street},{" "}
                              {pck.pickupAddress?.city}, {pck.pickupAddress?.state} -{" "}
                              {pck.pickupAddress?.pincode}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-right">
                          <div>
                            <p className="text-xs text-slate-400">Estimated Value</p>
                            <p className="text-lg font-bold text-lime-300">
                              ₹{pck.valuationSnapshot?.estimatedValue || 0}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Collection Fee: <span className="text-emerald-400 font-semibold">FREE</span>
                            </p>
                          </div>

                          {["Pending", "Accepted"].includes(pck.status) && (
                            <button
                              type="button"
                              disabled={actionBusyId === pck._id}
                              onClick={() => handleCancelPickup(pck._id)}
                              className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                            >
                              Cancel Pickup
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

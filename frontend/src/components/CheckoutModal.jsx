// frontend/src/components/CheckoutModal.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listAddresses } from "../lib/addresses";
import { createOrder } from "../lib/orders";
import AddressCard from "./AddressCard";
import AddressModal from "./AddressModal";

export default function CheckoutModal({
  isOpen,
  onClose,
  listing,
  onOrderSuccess,
}) {
  const { token, user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const res = await listAddresses(token);
      const list = res.addresses || [];
      setAddresses(list);
      // Automatically select default address or first address
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      if (defaultAddr && !selectedAddressId) {
        setSelectedAddressId(defaultAddr._id);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err.message);
    } finally {
      setLoadingAddresses(false);
    }
  }, [token, selectedAddressId]);

  useEffect(() => {
    if (isOpen) {
      setConfirmedOrder(null);
      setError("");
      fetchAddresses();
    }
  }, [isOpen, fetchAddresses]);

  if (!isOpen || !listing) return null;

  const itemPrice = Number(listing.price || 0);
  const deliveryFee = 0; // Transparent zero-delivery fee policy
  const totalPrice = itemPrice + deliveryFee;

  const isSeller = user?.id === listing.seller?._id || user?.id === listing.seller;

  async function handleConfirmOrder() {
    if (!selectedAddressId) {
      setError("Please select or add a delivery address to proceed.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await createOrder(token, {
        listingId: listing._id,
        addressId: selectedAddressId,
      });

      setConfirmedOrder(result.order);
      if (onOrderSuccess) {
        onOrderSuccess(result.order);
      }
    } catch (err) {
      setError(err.message || "Failed to complete checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAddressSaved(newAddress) {
    fetchAddresses().then(() => {
      setSelectedAddressId(newAddress._id);
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#101512] p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {confirmedOrder ? "Order Confirmed!" : "Secure Marketplace Checkout"}
              </h2>
              <p className="text-xs text-slate-400">
                {confirmedOrder
                  ? "Your hardware component reservation is locked in."
                  : "Verified hardware handover and circular reuse"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Success View */}
          {confirmedOrder ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/20 text-2xl text-emerald-300">
                  ✓
                </span>
                <h3 className="mt-3 text-lg font-bold text-emerald-200">
                  Order Successfully Placed
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  Order Reference:{" "}
                  <span className="font-mono font-bold text-lime-300">
                    {confirmedOrder.orderReference}
                  </span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  The listing has been marked as sold and reserved for you.
                </p>
              </div>

              {/* Delivery Snapshot */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs">
                <p className="font-semibold text-slate-300">Shipping To:</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {confirmedOrder.shippingAddress.fullName} (📱 {confirmedOrder.shippingAddress.phone})
                </p>
                <p className="text-slate-400">
                  {confirmedOrder.shippingAddress.building}, {confirmedOrder.shippingAddress.street},{" "}
                  {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} —{" "}
                  {confirmedOrder.shippingAddress.pincode}
                </p>
              </div>

              {/* Cost Summary */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Component Price</span>
                  <span className="font-medium text-white">
                    ₹{Number(confirmedOrder.itemPrice).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-400 font-medium">FREE (Community policy)</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-bold text-lime-300">
                  <span>Total Amount</span>
                  <span>₹{Number(confirmedOrder.totalPrice).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-3">
                <Link
                  to="/orders"
                  className="rounded-xl bg-lime-300 px-5 py-2.5 text-sm font-bold text-black hover:bg-lime-200"
                >
                  View My Orders →
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <div className="mt-5 space-y-5">
              {/* Self-purchase warning */}
              {isSeller && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
                  ⚠️ You cannot purchase this listing because you are the seller.
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Item Card */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div>
                  <h3 className="font-semibold text-white">{listing.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Seller: {listing.seller?.name || "Verified Community Member"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Price</p>
                  <p className="text-lg font-bold text-lime-300">
                    ₹{itemPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    1. Select Delivery Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-xs font-semibold text-lime-300 hover:underline"
                  >
                    + Add New Address
                  </button>
                </div>

                {loadingAddresses ? (
                  <p className="p-4 text-center text-xs text-slate-500">
                    Loading your saved addresses...
                  </p>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/20 p-5 text-center">
                    <p className="text-xs text-slate-400">No saved addresses found.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="mt-3 rounded-lg bg-lime-300/10 px-3 py-1.5 text-xs font-bold text-lime-300 hover:bg-lime-300/20"
                    >
                      + Add Shipping Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr._id}
                        address={addr}
                        selectable
                        isSelected={selectedAddressId === addr._id}
                        onSelect={() => setSelectedAddressId(addr._id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method Notice */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs">
                <h4 className="font-semibold text-slate-300">2. Payment & Settlement</h4>
                <p className="mt-1 text-slate-400">
                  <span className="font-medium text-lime-300">Pay on Handover / Delivery</span>{" "}
                  — Settle payment directly upon receiving and physically inspecting the component. No upfront card charges.
                </p>
              </div>

              {/* Order Cost Breakdown */}
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Item Subtotal</span>
                  <span className="font-medium text-white">
                    ₹{itemPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery & Handling</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-lime-300">
                  <span>Final Total</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={submitting || isSeller || addresses.length === 0}
                  className="rounded-xl bg-lime-300 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-lime-200 disabled:opacity-40"
                >
                  {submitting ? "Reserving Listing..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Add Address Modal (keeps checkout state intact!) */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSaved={handleAddressSaved}
      />
    </>
  );
}

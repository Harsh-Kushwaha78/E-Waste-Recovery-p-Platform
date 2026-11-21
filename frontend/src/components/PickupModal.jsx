// frontend/src/components/PickupModal.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listAddresses } from "../lib/addresses";
import { checkServiceability, createPickupRequest } from "../lib/pickups";
import AddressCard from "./AddressCard";
import AddressModal from "./AddressModal";

export default function PickupModal({
  isOpen,
  onClose,
  initialDevice = null,
  initialComponent = null,
  onSuccess,
}) {
  const { token } = useAuth();

  const [itemType, setItemType] = useState(
    initialComponent ? "component" : initialDevice ? "device" : "custom_e_waste"
  );
  const [customDetails, setCustomDetails] = useState({
    title: "",
    category: "mixed_e_waste",
    approxWeightKg: 1,
    notes: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [serviceability, setServiceability] = useState(null);
  const [checkingService, setCheckingService] = useState(false);

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  const [preferredDate, setPreferredDate] = useState(minDateStr);
  const [timeSlot, setTimeSlot] = useState("09:00 - 12:00");
  const [instructions, setInstructions] = useState("");

  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [confirmedPickup, setConfirmedPickup] = useState(null);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const res = await listAddresses(token);
      const list = res.addresses || [];
      setAddresses(list);
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
      setConfirmedPickup(null);
      setError("");
      fetchAddresses();
    }
  }, [isOpen, fetchAddresses]);

  // When selected address changes, check PIN serviceability
  useEffect(() => {
    const selected = addresses.find((a) => a._id === selectedAddressId);
    if (selected?.pincode && token) {
      setCheckingService(true);
      setServiceability(null);
      checkServiceability(token, selected.pincode)
        .then((res) => {
          setServiceability(res);
        })
        .catch(() => {
          setServiceability({ serviceable: false, message: "Could not verify serviceability." });
        })
        .finally(() => setCheckingService(false));
    }
  }, [selectedAddressId, addresses, token]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedAddressId) {
      setError("Please select a pickup address.");
      return;
    }
    if (serviceability && !serviceability.serviceable) {
      setError(serviceability.message || "Doorstep collection is not available in this PIN code.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        itemType,
        deviceId: itemType === "device" ? initialDevice?._id : undefined,
        componentId: itemType === "component" ? initialComponent?._id : undefined,
        customItemDetails: itemType === "custom_e_waste" ? customDetails : undefined,
        addressId: selectedAddressId,
        preferredDate,
        timeSlot,
        instructions,
      };

      const result = await createPickupRequest(token, payload);
      setConfirmedPickup(result.pickup);
      if (onSuccess) onSuccess(result.pickup);
    } catch (err) {
      setError(err.message || "Failed to schedule pickup.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#101512] p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {confirmedPickup ? "Pickup Scheduled!" : "Schedule Doorstep E-Waste Pickup"}
              </h2>
              <p className="text-xs text-slate-400">
                Authorized recycling pickup & safe hazardous waste disposal
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

          {confirmedPickup ? (
            /* Success confirmation */
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/20 text-2xl text-emerald-300">
                  ✓
                </span>
                <h3 className="mt-3 text-lg font-bold text-emerald-200">
                  Pickup Request Submitted
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  Reference ID:{" "}
                  <span className="font-mono font-bold text-lime-300">
                    {confirmedPickup.referenceId}
                  </span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Status: <span className="text-lime-300 font-semibold">{confirmedPickup.status}</span>. Our collection team will contact you prior to arrival.
                </p>
              </div>

              {/* Pickup details */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="text-white font-medium">
                    {new Date(confirmedPickup.preferredDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Slot:</span>
                  <span className="text-white font-medium">{confirmedPickup.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Collection Fee:</span>
                  <span className="text-emerald-400 font-semibold">FREE (Eco-Drive)</span>
                </div>
                <div className="border-t border-white/10 pt-2 text-slate-400">
                  <p className="font-medium text-slate-300">Pickup Address:</p>
                  <p className="mt-0.5 text-white">
                    {confirmedPickup.pickupAddress.fullName} — {confirmedPickup.pickupAddress.building},{" "}
                    {confirmedPickup.pickupAddress.street}, {confirmedPickup.pickupAddress.city},{" "}
                    {confirmedPickup.pickupAddress.state} ({confirmedPickup.pickupAddress.pincode})
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Link
                  to="/orders"
                  className="rounded-xl bg-lime-300 px-5 py-2.5 text-sm font-bold text-black hover:bg-lime-200"
                >
                  View My Requests →
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
            /* Form view */
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Item selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  1. E-Waste Item Details
                </label>
                {initialComponent ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <p className="font-semibold text-white">
                      Component: {initialComponent.brand} {initialComponent.model} ({initialComponent.type})
                    </p>
                    <p className="text-slate-400 mt-1">Status: {initialComponent.workingStatus}</p>
                  </div>
                ) : initialDevice ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <p className="font-semibold text-white">
                      Device: {initialDevice.name} ({initialDevice.category})
                    </p>
                    <p className="text-slate-400 mt-1">
                      {initialDevice.brand} {initialDevice.model}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="e.g. Broken Laptop, CRT Monitor, Li-ion Batteries"
                      value={customDetails.title}
                      onChange={(e) =>
                        setCustomDetails((p) => ({ ...p, title: e.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white focus:border-lime-300 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400">Category</label>
                        <select
                          value={customDetails.category}
                          onChange={(e) =>
                            setCustomDetails((p) => ({ ...p, category: e.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#161c18] px-3 py-2 text-xs text-white"
                        >
                          <option value="computers">Computers & Laptops</option>
                          <option value="batteries">Batteries & Power Units</option>
                          <option value="monitors">Monitors & Displays</option>
                          <option value="cables_chargers">Cables & Accessories</option>
                          <option value="mixed_e_waste">Mixed E-Waste</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400">Estimated Weight (kg)</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={customDetails.approxWeightKg}
                          onChange={(e) =>
                            setCustomDetails((p) => ({
                              ...p,
                              approxWeightKg: Number(e.target.value),
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Selection */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    2. Pickup Location & PIN Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-xs font-semibold text-lime-300 hover:underline"
                  >
                    + Add New Address
                  </button>
                </div>

                {loadingAddresses ? (
                  <p className="text-xs text-slate-500">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/20 p-4 text-center">
                    <p className="text-xs text-slate-400">No saved address found.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="mt-2 rounded-lg bg-lime-300/10 px-3 py-1.5 text-xs font-bold text-lime-300 hover:bg-lime-300/20"
                    >
                      + Add Pickup Address
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

                {/* Serviceability feedback banner */}
                {selectedAddressId && (
                  <div className="mt-3">
                    {checkingService ? (
                      <p className="text-xs text-slate-400">Checking PIN code serviceability...</p>
                    ) : serviceability?.serviceable ? (
                      <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                        <span>✓</span>
                        <span>{serviceability.message}</span>
                      </div>
                    ) : serviceability ? (
                      <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-2.5 text-xs text-amber-300 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{serviceability.message}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    3. Preferred Pickup Date *
                  </label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#161c18] px-3 py-2 text-sm text-white focus:border-lime-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time Window *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#161c18] px-3 py-2 text-sm text-white focus:border-lime-300 focus:outline-none"
                  >
                    <option value="09:00 - 12:00">Morning (09:00 - 12:00)</option>
                    <option value="12:00 - 15:00">Afternoon (12:00 - 15:00)</option>
                    <option value="15:00 - 18:00">Evening (15:00 - 18:00)</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pickup Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Items packed in carton at security gate; ring apartment 402."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-xs text-white focus:border-lime-300 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (serviceability && !serviceability.serviceable)}
                  className="rounded-xl bg-lime-300 px-6 py-2 text-sm font-bold text-black transition hover:bg-lime-200 disabled:opacity-40"
                >
                  {submitting ? "Scheduling..." : "Confirm Doorstep Pickup"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSaved={(newAddr) => {
          fetchAddresses().then(() => setSelectedAddressId(newAddr._id));
        }}
      />
    </>
  );
}

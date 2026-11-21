// frontend/src/components/AddressModal.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createAddress, updateAddress } from "../lib/addresses";

export default function AddressModal({
  isOpen,
  onClose,
  initialAddress = null,
  onSaved,
}) {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    building: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    label: "Home",
    isDefault: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAddress) {
      setFormData({
        fullName: initialAddress.fullName || "",
        phone: initialAddress.phone || "",
        building: initialAddress.building || "",
        street: initialAddress.street || "",
        landmark: initialAddress.landmark || "",
        city: initialAddress.city || "",
        state: initialAddress.state || "",
        pincode: initialAddress.pincode || "",
        label: initialAddress.label || "Home",
        isDefault: Boolean(initialAddress.isDefault),
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        building: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        label: "Home",
        isDefault: false,
      });
    }
    setError("");
  }, [initialAddress, isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate fields
    if (!formData.fullName.trim()) {
      setError("Recipient full name is required.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    if (!formData.building.trim()) {
      setError("Flat / House / Building details are required.");
      return;
    }

    if (!formData.street.trim()) {
      setError("Street / Area / Locality is required.");
      return;
    }

    if (!formData.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!formData.state.trim()) {
      setError("State is required.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      setError("Please enter a valid 6-digit Indian PIN code (e.g. 560001).");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        phone: cleanPhone,
        pincode: formData.pincode.trim(),
      };

      let result;
      if (initialAddress?._id) {
        result = await updateAddress(token, initialAddress._id, payload);
      } else {
        result = await createAddress(token, payload);
      }

      if (onSaved) {
        onSaved(result.address);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#101512] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white">
            {initialAddress ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400">
                10-Digit Mobile Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                maxLength={12}
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400">
              Flat / House / Building *
            </label>
            <input
              type="text"
              name="building"
              value={formData.building}
              onChange={handleChange}
              placeholder="e.g. Flat 301, Sunrise Apartments"
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400">
              Street / Area / Locality *
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="e.g. 5th Main, 2nd Stage, Indiranagar"
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="e.g. Near Metro Station / Behind Post Office"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-400">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Bengaluru"
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Karnataka"
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400">
                PIN Code *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="560038"
                maxLength={6}
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-lime-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400">
                Address Type
              </label>
              <select
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#1a201d] px-3 py-2 text-sm text-white focus:border-lime-300 focus:outline-none"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-white/10 bg-white/[0.05] text-lime-300 focus:ring-0"
                />
                Make this my default address
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-lime-300 px-5 py-2 text-sm font-bold text-black transition hover:bg-lime-200 disabled:opacity-50"
            >
              {loading ? "Saving..." : initialAddress ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

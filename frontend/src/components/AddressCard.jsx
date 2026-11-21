// frontend/src/components/AddressCard.jsx
import React from "react";

export default function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
}) {
  const isDefault = address.isDefault;

  return (
    <div
      onClick={selectable && onSelect ? () => onSelect(address) : undefined}
      className={`relative rounded-xl border p-4 transition ${
        selectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-lime-300 bg-lime-300/[0.08] shadow-lg shadow-lime-300/10"
          : "border-white/10 bg-[#141916]/80 hover:border-white/20"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100">{address.fullName}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-xs text-slate-300">
            {address.label || "Home"}
          </span>
          {isDefault && (
            <span className="rounded-full border border-lime-300/30 bg-lime-300/10 px-2 py-0.5 text-[11px] font-semibold text-lime-300">
              Default
            </span>
          )}
        </div>

        {selectable && (
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
              isSelected
                ? "border-lime-300 bg-lime-300 text-black font-bold text-xs"
                : "border-slate-500"
            }`}
          >
            {isSelected ? "✓" : ""}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400">📱 {address.phone}</p>

      <p className="mt-1 text-sm text-slate-300">
        {address.building}, {address.street}
        {address.landmark ? `, Near ${address.landmark}` : ""}
      </p>
      <p className="text-sm font-medium text-slate-200">
        {address.city}, {address.state} — <span className="text-lime-300">{address.pincode}</span>
      </p>

      {/* Action buttons (only when not purely in select mode) */}
      {(!selectable || onEdit || onDelete || onSetDefault) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-2 text-xs">
          {!isDefault && onSetDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address._id);
              }}
              className="text-slate-400 transition hover:text-lime-300"
            >
              Set as default
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              className="text-slate-400 transition hover:text-white"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(address._id);
              }}
              className="text-red-400 transition hover:text-red-300"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

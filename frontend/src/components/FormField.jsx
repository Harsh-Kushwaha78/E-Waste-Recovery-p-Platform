
export default function FormField({ label, ...inputProps }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-medium text-emerald-50/85">
        {label}
      </span>

      <input
        {...inputProps}
        className="w-full rounded-xl border border-emerald-100/15 bg-[#0b100d] px-4 py-3 text-white caret-lime-300 placeholder:text-emerald-100/35 shadow-inner shadow-black/20 transition duration-200 focus:border-lime-300/70 focus:outline-none focus:ring-2 focus:ring-lime-300/15 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

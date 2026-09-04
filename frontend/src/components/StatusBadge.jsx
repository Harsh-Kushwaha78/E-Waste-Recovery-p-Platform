// frontend/src/components/StatusBadge.jsx
//
// The badge visuals for working status (master prompt section 12):
// green = verified working, yellow = likely working, red = not working,
// gray = not tested.

const STYLES = {
  VERIFIED_WORKING: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-100", label: "Verified Working" },
  LIKELY_WORKING: { dot: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-100", label: "Likely Working" },
  NOT_WORKING: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-100", label: "Not Working" },
  NOT_TESTED: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100", label: "Not Tested" },
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.NOT_TESTED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

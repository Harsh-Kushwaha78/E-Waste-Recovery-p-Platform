// frontend/src/components/hero3d/HeroFallback.jsx
// Lightweight fallback visual when WebGL is unavailable or reduced-motion is preferred.

export default function HeroFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Ambient Radial Glows */}
      <div className="absolute h-[420px] w-[420px] rounded-full bg-lime-300/[0.07] blur-3xl" />
      <div className="absolute h-[340px] w-[340px] rounded-full bg-emerald-500/[0.08] blur-2xl" />

      {/* Stylized SVG Motherboard Silhouette & Circuit Traces */}
      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[540px] opacity-75 drop-shadow-[0_0_35px_rgba(163,230,53,0.15)]"
      >
        {/* PCB Outer Plate */}
        <rect
          x="100"
          y="100"
          width="400"
          height="400"
          rx="24"
          fill="#0c1612"
          stroke="rgba(163, 230, 53, 0.3)"
          strokeWidth="2"
        />

        {/* Mounting Holes */}
        <circle cx="130" cy="130" r="12" fill="#080b0a" stroke="#eab308" strokeWidth="3" />
        <circle cx="470" cy="130" r="12" fill="#080b0a" stroke="#eab308" strokeWidth="3" />
        <circle cx="130" cy="470" r="12" fill="#080b0a" stroke="#eab308" strokeWidth="3" />
        <circle cx="470" cy="470" r="12" fill="#080b0a" stroke="#eab308" strokeWidth="3" />

        {/* Central CPU Socket */}
        <rect
          x="220"
          y="180"
          width="160"
          height="160"
          rx="12"
          fill="#14211a"
          stroke="rgba(163, 230, 53, 0.45)"
          strokeWidth="2"
        />
        <rect
          x="250"
          y="210"
          width="100"
          height="100"
          rx="8"
          fill="#1c2f25"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1.5"
        />
        {/* Glowing Center Core */}
        <circle cx="300" cy="260" r="28" fill="rgba(163, 230, 53, 0.2)" stroke="#a3e635" strokeWidth="2" />
        <circle cx="300" cy="260" r="10" fill="#a3e635" />

        {/* RAM DIMM Slots */}
        <rect x="410" y="170" width="16" height="220" rx="4" fill="#18231e" stroke="#eab308" strokeWidth="1.5" />
        <rect x="440" y="170" width="16" height="220" rx="4" fill="#18231e" stroke="#eab308" strokeWidth="1.5" />

        {/* PCIe Expansion Slot */}
        <rect x="150" y="380" width="230" height="20" rx="4" fill="#18231e" stroke="#94a3b8" strokeWidth="1.5" />

        {/* VRM Heatsink & Capacitors */}
        <rect x="140" y="180" width="45" height="150" rx="6" fill="#1e2c24" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
        <circle cx="162" cy="205" r="10" fill="#94a3b8" />
        <circle cx="162" cy="240" r="10" fill="#94a3b8" />
        <circle cx="162" cy="275" r="10" fill="#94a3b8" />
        <circle cx="162" cy="310" r="10" fill="#94a3b8" />

        {/* Circuit Traces */}
        <path
          d="M 300 340 L 300 380 M 320 340 L 320 370 L 350 370 L 350 380 M 280 340 L 280 370 L 250 370 L 250 380"
          stroke="#a3e635"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        <path
          d="M 380 230 L 410 230 M 380 250 L 410 250 M 380 270 L 410 270 M 380 290 L 410 290"
          stroke="#eab308"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

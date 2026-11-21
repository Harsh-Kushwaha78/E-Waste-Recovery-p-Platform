// frontend/src/components/hero3d/Hero3D.jsx
// Premium, cinematic 3D Hero section themed around e-waste recovery and sustainability.
// Lazy-loads the Three.js WebGL scene with an elegant fallback for reduced-motion and mobile.

import React, { Suspense, lazy, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroFallback from "./HeroFallback";

// Lazy-load the WebGL 3D scene for optimal page load performance
const Scene3D = lazy(() => import("./Scene3D"));

// Safe Error Boundary for WebGL initialization
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("[Hero3D] WebGL Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function Hero3D() {
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => motionQuery.removeEventListener("change", handleMotionChange);
  }, []);

  return (
    <section className="relative min-h-[82vh] lg:min-h-[88vh] w-full overflow-hidden bg-[#080b0a] flex items-center">
      {/* Background radial gradients for ambient depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(163,230,53,0.07),transparent_60%),radial-gradient(ellipse_at_85%_20%,rgba(52,211,153,0.06),transparent_50%)]" />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(163,230,53,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(163,230,53,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* 3D Scene Layer / Fallback */}
      <div className="absolute inset-0 z-0">
        {isReducedMotion ? (
          <HeroFallback />
        ) : (
          <WebGLErrorBoundary fallback={<HeroFallback />}>
            <Suspense fallback={<HeroFallback />}>
              <Scene3D />
            </Suspense>
          </WebGLErrorBoundary>
        )}
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-12 pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline, Description & Action Buttons (pointer-events-auto for clicks) */}
          <div className="lg:col-span-7 space-y-6 pointer-events-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-[#0d1611]/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.15)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
              <span>CIRCULAR ELECTRONICS & AI RECOVERY</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
              Give Your Electronics a{" "}
              <span className="block bg-gradient-to-r from-lime-200 via-lime-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(163,230,53,0.25)]">
                Second Life.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-emerald-100/70 font-normal">
              Extract high-value components from retired hardware, verify functionality
              with automated testing, estimate fair market valuation, and divert hazardous e-waste
              from landfills through certified circular reuse.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2.5 rounded-xl bg-lime-300 px-6 py-3.5 text-sm font-bold text-[#080d09] shadow-[0_0_30px_rgba(163,230,53,0.25)] transition hover:-translate-y-0.5 hover:bg-lime-200"
              >
                <span>Explore Marketplace</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                to="/devices"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-100/20 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-lime-300/40 hover:bg-white/[0.08]"
              >
                <span>Diagnose a Device</span>
              </Link>

              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-lime-300 transition px-2 py-1"
              >
                <span>Schedule Pickup</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            {/* Technical Capability Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/[0.08] text-xs">
              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2.5 backdrop-blur-sm">
                <p className="text-lime-300 font-bold">YOLO11n</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Component Vision</p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2.5 backdrop-blur-sm">
                <p className="text-emerald-300 font-bold">Rule Engine</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Hardware Testing</p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2.5 backdrop-blur-sm">
                <p className="text-lime-300 font-bold">RandomForest</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Fair ML Valuation</p>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2.5 backdrop-blur-sm">
                <p className="text-emerald-300 font-bold">Zero-Waste</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Doorstep Pickup</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Stage / Floating Info Pill */}
          <div className="lg:col-span-5 flex justify-end">
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#0d1410]/75 p-5 shadow-2xl backdrop-blur-xl max-w-sm hidden sm:block">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    INTERACTIVE 3D STAGE
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-lime-300 font-mono">
                  60 FPS WEBGL
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Move your cursor across the screen to experience mouse-responsive parallax depth.
                Floating RAM, NVMe SSDs, and silicon dies illustrate reclaimed components being sorted
                for circular reuse.
              </p>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-white/[0.05]">
                <span>MOTHERBOARD REV 3.8</span>
                <span className="text-lime-300">GPU ACCELERATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { analyzeDeviceImage } from "../lib/cv";
import { createComponent } from "../lib/devices";

const TYPE_LABELS = {
  ram: "RAM",
  ssd: "SSD",
  battery: "Battery",
  motherboard: "Motherboard",
  display: "Display",
};

const TYPE_ICONS = {
  ram: "▤",
  ssd: "▰",
  battery: "ϟ",
  motherboard: "▦",
  display: "▱",
};

export default function ImageAnalysis({ deviceId, onComponentAdded }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingComponent, setAddingComponent] = useState(null);
  const [addedTypes, setAddedTypes] = useState(new Set());

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);

    setError(null);
    setResult(null);
    setAddedTypes(new Set());
    setImagePreviewUrl(URL.createObjectURL(file));
    setLoading(true);

    try {
      const data = await analyzeDeviceImage(token, deviceId, file);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddSuggestion(detection, index) {
    setError(null);
    setAddingComponent(index);

    try {
      await createComponent(token, deviceId, {
        type: detection.component,
        workingStatus: "NOT_TESTED",
        condition: "unknown",
        notes: `Suggested by trained YOLO11n model (confidence ${Math.round(
          detection.confidence * 100
        )}%). Run a functional test to verify.`,
      });

      setAddedTypes((previous) => new Set(previous).add(index));
      onComponentAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingComponent(null);
    }
  }

  const detections = result?.detections ?? [];

  return (
    <section className="min-w-0 text-emerald-50">
      {/* Model header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.65)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-200">
              Vision engine
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white">
            Component detection
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/45">
            Upload a device image to find possible reusable parts with your
            trained computer-vision model.
          </p>
        </div>

        <span className="shrink-0 rounded-lg border border-lime-300/20 bg-lime-300/[0.06] px-2.5 py-1.5 text-[10px] font-semibold text-lime-200">
          YOLO11n
        </span>
      </div>

      {/* Upload area */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="group flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-100/20 bg-[#0b100d]/80 px-5 py-8 text-center transition hover:border-lime-300/40 hover:bg-lime-300/[0.025] disabled:cursor-wait disabled:opacity-60 sm:py-10"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/[0.07] text-2xl text-lime-300 transition group-hover:scale-105">
          {loading ? "◌" : "↑"}
        </span>

        <span className="mt-4 text-sm font-semibold text-white">
          {loading ? "Analyzing image..." : "Upload an image"}
        </span>

        <span className="mt-2 text-xs leading-5 text-emerald-100/40">
          {loading
            ? "The vision model is processing your image."
            : "JPG, PNG or WebP · Maximum 8 MB"}
        </span>

        {!loading && (
          <span className="mt-4 rounded-lg bg-lime-300 px-4 py-2 text-xs font-bold text-[#10170c] transition group-hover:bg-lime-200">
            Choose image
          </span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          aria-label="Choose device image"
        />
      </button>

      <p className="mt-3 text-center text-[11px] leading-5 text-emerald-100/35">
        Best results: clear, well-lit photos with components visible and
        minimal obstruction.
      </p>

      {/* Loading status */}
      {loading && (
        <div
          className="mt-5 rounded-xl border border-lime-300/15 bg-lime-300/[0.04] p-4"
          role="status"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-white">
              Running computer vision
            </span>
            <span className="animate-pulse text-xs text-lime-300">
              Processing
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-emerald-100/10">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
          </div>
        </div>
      )}

      {/* Errors */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4"
        >
          <p className="text-sm font-semibold text-red-300">
            Analysis or component action failed
          </p>
          <p className="mt-1 break-words text-sm text-red-200/70">
            {error}
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                Analysis report
              </p>
              <h4 className="mt-1 text-lg font-semibold text-white">
                {detections.length}{" "}
                {detections.length === 1 ? "suggestion" : "suggestions"} found
              </h4>
            </div>

            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-1.5 text-[10px] font-semibold text-emerald-200">
              {result.mode || "Model response"}
            </span>
          </div>

          {result.disclaimer && (
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.045] p-3">
              <p className="text-xs leading-5 text-amber-100/75">
                <span className="mr-1 font-bold text-amber-300">
                  Important:
                </span>
                {result.disclaimer}
              </p>
            </div>
          )}

          {/* Image and bounding boxes */}
          {imagePreviewUrl && result.imageInfo && (
            <div className="overflow-hidden rounded-2xl border border-emerald-100/10 bg-[#080b0a]">
              <div className="flex items-center justify-between gap-3 border-b border-emerald-100/10 px-4 py-3">
                <span className="text-xs font-semibold text-emerald-50/70">
                  Detection preview
                </span>
                <span className="text-[10px] text-emerald-100/35">
                  Bounding boxes
                </span>
              </div>

              <div className="flex justify-center overflow-hidden p-2 sm:p-4">
                <div className="relative inline-block max-w-full overflow-hidden rounded-lg">
                  <img
                    src={imagePreviewUrl}
                    alt="Uploaded electronic device with AI detection overlays"
                    className="block max-h-[440px] max-w-full object-contain"
                  />

                  {detections.map((d, i) => {
                    const box = d.boundingBox;
                    if (!box || !result.imageInfo.width || !result.imageInfo.height) {
                      return null;
                    }

                    return (
                      <div
                        key={i}
                        className="pointer-events-none absolute border-2 border-lime-300 bg-lime-300/[0.08]"
                        style={{
                          left: `${(box.x / result.imageInfo.width) * 100}%`,
                          top: `${(box.y / result.imageInfo.height) * 100}%`,
                          width: `${(box.width / result.imageInfo.width) * 100}%`,
                          height: `${(box.height / result.imageInfo.height) * 100}%`,
                        }}
                      >
                        <span className="absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded-t-md bg-lime-300 px-1.5 py-1 text-[10px] font-bold text-[#10170c]">
                          {TYPE_LABELS[d.component] || d.component}{" "}
                          {Math.round(d.confidence * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Detection list */}
          {detections.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100/45">
                Review suggestions
              </p>

              {detections.map((d, i) => {
                const added = addedTypes.has(i);
                const adding = addingComponent === i;
                const confidence = Math.round(d.confidence * 100);

                return (
                  <div
                    key={i}
                    className="rounded-xl border border-emerald-100/10 bg-[#0b100d]/80 p-3 sm:p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-300/15 bg-lime-300/[0.06] text-lg text-lime-300">
                          {TYPE_ICONS[d.component] || "◇"}
                        </span>

                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-white">
                            {TYPE_LABELS[d.component] || d.component}
                          </p>
                          <p className="mt-1 text-xs text-emerald-100/40">
                            Model confidence: {confidence}%
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSuggestion(d, i)}
                        disabled={added || adding || addingComponent !== null}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                          added
                            ? "border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200"
                            : "bg-lime-300 text-[#10170c] hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                        }`}
                      >
                        {added
                          ? "✓ Added"
                          : adding
                            ? "Adding..."
                            : "Confirm component"}
                      </button>
                    </div>

                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-emerald-100/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, confidence))}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] leading-4 text-emerald-100/35">
                      A detection is a suggestion, not proof that the part
                      works. Confirm it and run a functional test.
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-100/10 bg-[#0b100d]/80 p-6 text-center">
              <p className="text-sm font-semibold text-white">
                No components detected
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-50/45">
                Try a clearer image with the components more visible. A
                missing detection does not mean the device has no reusable
                parts.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full rounded-xl border border-emerald-100/15 px-4 py-3 text-sm font-semibold text-emerald-50/70 transition hover:border-lime-300/30 hover:text-lime-200 disabled:opacity-50"
          >
            Analyze another image
          </button>
        </div>
      )}

      <div className="mt-5 border-t border-emerald-100/[0.08] pt-4">
        <p className="text-[10px] leading-5 text-emerald-100/35">
          AI-generated detections require human confirmation. Components are
          added as NOT_TESTED and should undergo functional verification
          before being listed for sale or used in recovery decisions.
        </p>
      </div>
    </section>
  );
}

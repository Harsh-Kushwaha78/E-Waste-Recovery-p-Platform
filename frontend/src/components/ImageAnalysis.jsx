// frontend/src/components/ImageAnalysis.jsx
//
// Lets the user upload a device photo and see DEMO_CV_MODE component
// suggestions (bounding boxes drawn as an overlay on the image, at
// their real relative position/size). Every suggestion requires the
// user to explicitly click "Add as component" - nothing is
// auto-created, per the master flow ("user confirms components") and
// the No Fake AI Rule (never silently trust unverified detections).

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

export default function ImageAnalysis({ deviceId, onComponentAdded }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedTypes, setAddedTypes] = useState(new Set());

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

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

  async function handleAddSuggestion(detection) {
    try {
      await createComponent(token, deviceId, {
        type: detection.component,
        workingStatus: "NOT_TESTED",
        condition: "unknown",
        notes: `Suggested by CV demo mode (confidence ${Math.round(detection.confidence * 100)}%) - not a real detection, run a functional test to verify.`,
      });
      setAddedTypes((prev) => new Set(prev).add(detection.component));
      onComponentAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
      <h3 className="font-medium text-slate-800 mb-1">Analyze a photo (optional)</h3>
      <p className="text-xs text-slate-500 mb-3">
        Upload a photo of the open device to get suggested components. This
        speeds up manual entry - it doesn't replace it.
      </p>

      <label className="inline-block bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer">
        {loading ? "Analyzing..." : "Upload Photo"}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />
      </label>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-3 font-medium">
            ⚠ {result.disclaimer}
          </div>

          {imagePreviewUrl && result.imageInfo && (
            <div
              className="relative inline-block mb-3 rounded-lg overflow-hidden border border-slate-200"
              style={{ maxWidth: "100%" }}
            >
              <img
                src={imagePreviewUrl}
                alt="Uploaded device"
                className="block w-full max-w-md"
              />
              {result.detections.map((d, i) => (
                <div
                  key={i}
                  className="absolute border-2 border-blue-500 bg-blue-500/10"
                  style={{
                    left: `${(d.boundingBox.x / result.imageInfo.width) * 100}%`,
                    top: `${(d.boundingBox.y / result.imageInfo.height) * 100}%`,
                    width: `${(d.boundingBox.width / result.imageInfo.width) * 100}%`,
                    height: `${(d.boundingBox.height / result.imageInfo.height) * 100}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                    {TYPE_LABELS[d.component] || d.component} ({Math.round(d.confidence * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-2">
            {result.detections.map((d, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-slate-50 rounded-lg p-3 text-sm"
              >
                <span>
                  {TYPE_LABELS[d.component] || d.component}{" "}
                  <span className="text-slate-400 text-xs">
                    ({Math.round(d.confidence * 100)}% - demo confidence, not real)
                  </span>
                </span>
                <button
                  onClick={() => handleAddSuggestion(d)}
                  disabled={addedTypes.has(d.component)}
                  className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-3 py-1.5 rounded-lg"
                >
                  {addedTypes.has(d.component) ? "Added" : "Add as component"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

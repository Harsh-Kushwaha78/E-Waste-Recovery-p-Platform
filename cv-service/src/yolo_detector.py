"""
yolo_detector.py

Real YOLO inference detector for the e-waste platform.
Uses the trained YOLO11n model stored at ../models/best.pt.
"""

from pathlib import Path

from PIL import Image
from ultralytics import YOLO


MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "best.pt"

TARGET_CLASSES = ["ram", "ssd", "battery", "motherboard", "display"]

# Load the trained model once when the service starts.
model = YOLO(str(MODEL_PATH))


def run_yolo_detection(image, filename=None):
    """
    Run trained YOLO inference on a PIL image.

    Returns the same general detection structure used by the
    existing CV API, but with real model predictions.
    """

    width, height = image.size

    results = model.predict(
        source=image,
        conf=0.25,
        verbose=False,
    )

    detections = []

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())

            component = model.names.get(class_id, str(class_id))

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "component": component,
                "confidence": round(confidence, 2),
                "boundingBox": {
                    "x": round(x1),
                    "y": round(y1),
                    "width": round(x2 - x1),
                    "height": round(y2 - y1),
                },
            })

    detections.sort(
        key=lambda detection: detection["confidence"],
        reverse=True,
    )

    return {
        "mode": "YOLO11n",
        "disclaimer": (
            "AI-generated component detections from the trained "
            "YOLO11n e-waste model. Confirm detections manually "
            "before making recovery or recycling decisions."
        ),
        "targetClasses": TARGET_CLASSES,
        "imageInfo": {
            "width": width,
            "height": height,
            "filename": filename,
        },
        "detections": detections,
    }
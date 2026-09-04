"""
demo_detector.py

*** THIS IS NOT A TRAINED COMPUTER VISION MODEL. ***

Per the master project plan (section 9): "If a proper dataset is not yet
available: Implement a clearly labeled DEMO CV MODE so the rest of the
application can still work. Later replace Demo CV Mode with the real
trained model."

There is no annotated e-waste image dataset available to train a real
detector (see cv-service/dataset/ANNOTATION_FORMAT.md for what one would
need to look like). This module reads the actual uploaded image only to
get its real dimensions (so bounding boxes are at least placed within
the image's real bounds) - it does NOT analyze pixel content in any way.
The set of "detected" components and their confidence scores are
randomly chosen from the target class list, not learned from anything.

Every response from this module must be labeled DEMO_CV_MODE and include
a disclaimer. Never remove or soften that labeling - see master prompt
section 6 (No Fake AI Rule).
"""

import random

TARGET_CLASSES = ["ram", "ssd", "battery", "motherboard", "display"]


def run_demo_detection(image_width, image_height, filename=None, seed=None):
    """
    Returns a plausible-looking but RANDOM set of "detections" within the
    real image bounds. Confidence scores are randomly generated - they do
    not reflect any actual visual analysis.
    """
    rng = random.Random(seed)

    num_detections = rng.randint(1, min(4, len(TARGET_CLASSES)))
    chosen_classes = rng.sample(TARGET_CLASSES, num_detections)

    detections = []
    for component_class in chosen_classes:
        box_w = rng.randint(int(image_width * 0.15), int(image_width * 0.4))
        box_h = rng.randint(int(image_height * 0.15), int(image_height * 0.4))
        x = rng.randint(0, max(0, image_width - box_w))
        y = rng.randint(0, max(0, image_height - box_h))

        confidence = round(rng.uniform(0.55, 0.97), 2)

        detections.append({
            "component": component_class,
            "confidence": confidence,
            "boundingBox": {"x": x, "y": y, "width": box_w, "height": box_h},
        })

    detections.sort(key=lambda d: d["confidence"], reverse=True)

    return {
        "mode": "DEMO_CV_MODE",
        "disclaimer": (
            "DEMO CV MODE: these are randomly generated example detections "
            "for testing the pipeline, NOT the output of a trained computer "
            "vision model. The image's real dimensions were used to place "
            "bounding boxes, but its actual visual content was not analyzed. "
            "Confirm every component manually before relying on this."
        ),
        "targetClasses": TARGET_CLASSES,
        "imageInfo": {
            "width": image_width,
            "height": image_height,
            "filename": filename,
        },
        "detections": detections,
    }

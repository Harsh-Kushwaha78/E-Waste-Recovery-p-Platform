"""
app.py - cv-service inference API

Exposes:
  GET  /health   - service status
  POST /detect   - accepts an uploaded image, returns DEMO_CV_MODE detections

Run: ./venv/bin/python src/app.py
Default port: 8002

File upload validation (master prompt section 35): checks file
extension, verifies the file actually decodes as an image (via
Pillow), and enforces a size limit.
"""

import io
import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError

from demo_detector import run_demo_detection

app = Flask(__name__)
CORS(app)

MAX_SIZE_BYTES = 8 * 1024 * 1024  # 8MB
app.config["MAX_CONTENT_LENGTH"] = MAX_SIZE_BYTES

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def allowed_filename(filename):
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "cv-service",
        "mode": "DEMO_CV_MODE",
        "note": "No trained detection model - see README for why.",
    }), 200


@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({
            "status": "error",
            "message": "No image uploaded. Send as multipart/form-data field 'image'.",
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"status": "error", "message": "Empty filename."}), 400

    if not allowed_filename(file.filename):
        return jsonify({
            "status": "error",
            "message": f"Unsupported file extension. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        }), 400

    raw_bytes = file.read()

    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img.verify()
        img = Image.open(io.BytesIO(raw_bytes))
        width, height = img.size
    except UnidentifiedImageError:
        return jsonify({
            "status": "error",
            "message": "File could not be decoded as a valid image.",
        }), 400
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error reading image: {str(e)}",
        }), 400

    result = run_demo_detection(width, height, filename=file.filename)

    return jsonify({"status": "ok", **result}), 200


@app.errorhandler(413)
def file_too_large(e):
    return jsonify({
        "status": "error",
        "message": f"File too large. Max size is {MAX_SIZE_BYTES // (1024*1024)}MB.",
    }), 413


if __name__ == "__main__":
    port = int(os.environ.get("CV_SERVICE_PORT", 8002))
    print(f"[cv-service] Starting on port {port} (DEMO_CV_MODE)")
    app.run(host="0.0.0.0", port=port)

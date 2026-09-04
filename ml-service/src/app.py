"""
app.py - ml-service inference API

Exposes:
  GET  /health     - service + model status
  POST /predict     - price prediction for one component

Run: ./venv/bin/python src/app.py
Default port: 8001

This service does NOT scan the internet or know "current" prices (see
master prompt section 18 - market data is a separate system, Phase 7).
It only predicts from the patterns in whatever dataset it was trained
on. If that dataset is demo/synthetic data, every prediction response
says so explicitly - this must never be silently dropped by the caller.
"""

import glob
import json
import os

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

CATEGORICAL_FEATURES = ["componentType", "brand", "condition", "workingStatus"]
NUMERIC_FEATURES = ["ageYears", "health"]


def find_latest_version():
    metadata_files = glob.glob(os.path.join(MODELS_DIR, "model_metadata_*.json"))
    if not metadata_files:
        return None
    metadata_files.sort(key=os.path.getmtime, reverse=True)
    latest = metadata_files[0]
    version = os.path.basename(latest).replace("model_metadata_", "").replace(".json", "")
    return version


def load_model_and_metadata(version):
    model_path = os.path.join(MODELS_DIR, f"price_model_{version}.joblib")
    metadata_path = os.path.join(MODELS_DIR, f"model_metadata_{version}.json")

    if not os.path.exists(model_path) or not os.path.exists(metadata_path):
        return None, None

    model = joblib.load(model_path)
    with open(metadata_path) as f:
        metadata = json.load(f)
    return model, metadata


@app.route("/health", methods=["GET"])
def health():
    version = find_latest_version()
    if version is None:
        return jsonify({
            "status": "ok",
            "service": "ml-service",
            "modelLoaded": False,
            "message": "No trained model found. Run train.py first.",
        }), 200

    _, metadata = load_model_and_metadata(version)
    return jsonify({
        "status": "ok",
        "service": "ml-service",
        "modelLoaded": True,
        "modelVersion": version,
        "modelName": metadata.get("modelName"),
        "isDemoData": metadata.get("isDemoData"),
    }), 200


@app.route("/predict", methods=["POST"])
def predict():
    version = find_latest_version()
    if version is None:
        return jsonify({
            "status": "error",
            "message": "No trained model available. Run train.py first.",
        }), 503

    model, metadata = load_model_and_metadata(version)

    body = request.get_json(silent=True) or {}

    missing = [
        f for f in CATEGORICAL_FEATURES + NUMERIC_FEATURES if f not in body
    ]
    if missing:
        return jsonify({
            "status": "error",
            "message": f"Missing required fields: {', '.join(missing)}",
            "requiredFields": CATEGORICAL_FEATURES + NUMERIC_FEATURES,
        }), 400

    try:
        row = {f: [body[f]] for f in CATEGORICAL_FEATURES + NUMERIC_FEATURES}
        X = pd.DataFrame(row)
        point_estimate = float(model.predict(X)[0])
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Prediction failed: {str(e)}",
        }), 400

    mae = metadata["metrics"]["selected"]["MAE"]
    r2 = metadata["metrics"]["selected"]["R2"]

    low = max(0, round(point_estimate - mae, -1))
    high = round(point_estimate + mae, -1)

    if r2 >= 0.85:
        confidence = "HIGH"
    elif r2 >= 0.6:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    response = {
        "status": "ok",
        "prediction": {
            "pointEstimate": round(point_estimate, -1),
            "rangeLow": low,
            "rangeHigh": high,
            "confidence": confidence,
            "confidenceBasis": f"Derived from model R2={r2} on held-out test data (not a probabilistic guarantee).",
        },
        "model": {
            "name": metadata.get("modelName"),
            "version": metadata.get("modelVersion"),
            "algorithm": metadata.get("algorithm"),
            "trainedAt": metadata.get("trainedAt"),
            "evaluationMetrics": metadata["metrics"]["selected"],
            "topFeatureImportances": metadata.get("featureImportances", []),
            "featureImportanceNote": metadata.get("featureImportanceNote"),
        },
        "isDemoData": metadata.get("isDemoData", False),
        "dataDisclaimer": metadata.get("dataDisclaimer"),
    }

    return jsonify(response), 200


if __name__ == "__main__":
    port = int(os.environ.get("ML_SERVICE_PORT", 8001))
    print(f"[ml-service] Starting on port {port}")
    print(f"[ml-service] Latest model version on disk: {find_latest_version()}")
    app.run(host="0.0.0.0", port=port)

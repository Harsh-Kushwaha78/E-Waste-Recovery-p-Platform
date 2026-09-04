"""
train.py

Trains the price-prediction model. Run manually (not on every request -
see master prompt section 29: "Never silently replace training
datasets"). Produces:
  - models/price_model_v1.joblib          (the trained sklearn pipeline)
  - models/model_metadata_v1.json         (version, dataset, metrics)

Usage:
    ./venv/bin/python src/train.py --dataset data/demo_prices_v1.csv --version v1
"""

import argparse
import json
import os
from datetime import datetime, timezone

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import joblib
import numpy as np

CATEGORICAL_FEATURES = ["componentType", "brand", "condition", "workingStatus"]
NUMERIC_FEATURES = ["ageYears", "health"]
TARGET = "price"


def load_and_clean(dataset_path):
    df = pd.read_csv(dataset_path)

    required_cols = CATEGORICAL_FEATURES + NUMERIC_FEATURES + [TARGET]
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    before = len(df)
    df = df.dropna(subset=required_cols)
    dropped = before - len(df)
    if dropped:
        print(f"[clean] Dropped {dropped} rows with missing required values.")

    df = df[df[TARGET] > 0]

    return df


def build_pipeline(model):
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ],
        remainder="passthrough",
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", model)])


def evaluate(model, X_test, y_test):
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    return {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2, 4)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, help="Path to training CSV")
    parser.add_argument("--version", required=True, help="Model version label, e.g. v1")
    parser.add_argument(
        "--is-demo-data",
        action="store_true",
        default=True,
        help="Flag this training run as using demo/synthetic data (default: True)",
    )
    args = parser.parse_args()

    print(f"[train] Loading dataset: {args.dataset}")
    df = load_and_clean(args.dataset)
    print(f"[train] {len(df)} usable rows after cleaning.")

    feature_cols = CATEGORICAL_FEATURES + NUMERIC_FEATURES
    X = df[feature_cols]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"[train] Split: {len(X_train)} train / {len(X_test)} test rows.")

    print("[train] Training baseline (Linear Regression)...")
    baseline = build_pipeline(LinearRegression())
    baseline.fit(X_train, y_train)
    baseline_metrics = evaluate(baseline, X_test, y_test)
    print(f"[train] Baseline metrics: {baseline_metrics}")

    print("[train] Training candidate (Random Forest)...")
    forest = build_pipeline(
        RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1)
    )
    forest.fit(X_train, y_train)
    forest_metrics = evaluate(forest, X_test, y_test)
    print(f"[train] Random Forest metrics: {forest_metrics}")

    if forest_metrics["MAE"] < baseline_metrics["MAE"]:
        best_name, best_model, best_metrics = "RandomForestRegressor", forest, forest_metrics
    else:
        best_name, best_model, best_metrics = "LinearRegression", baseline, baseline_metrics

    print(f"[train] Selected model: {best_name} (lower MAE wins)")

    # --- Feature importances for explainability (Phase 9 - "Why this price") ---
    # Real, model-derived values - not invented. For RandomForest this is
    # feature_importances_; for LinearRegression we use absolute
    # coefficients as a rough analog. Encoded feature names come straight
    # from the OneHotEncoder, so they're exact, not guessed.
    try:
        encoder = best_model.named_steps["preprocess"].named_transformers_["cat"]
        encoded_cat_names = list(encoder.get_feature_names_out(CATEGORICAL_FEATURES))
        all_feature_names = encoded_cat_names + NUMERIC_FEATURES

        inner_model = best_model.named_steps["model"]
        if hasattr(inner_model, "feature_importances_"):
            raw_importances = inner_model.feature_importances_
        elif hasattr(inner_model, "coef_"):
            raw_importances = np.abs(inner_model.coef_)
        else:
            raw_importances = None

        if raw_importances is not None:
            pairs = sorted(
                zip(all_feature_names, raw_importances), key=lambda x: x[1], reverse=True
            )
            feature_importances = [
                {"feature": name, "importance": round(float(imp), 4)} for name, imp in pairs[:10]
            ]
        else:
            feature_importances = []
    except Exception as e:
        print(f"[train] Could not compute feature importances: {e}")
        feature_importances = []

    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, f"price_model_{args.version}.joblib")
    joblib.dump(best_model, model_path)
    print(f"[train] Saved model to {model_path}")

    metadata = {
        "modelName": f"PriceModel-{args.version}",
        "modelVersion": args.version,
        "algorithm": best_name,
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "datasetPath": os.path.basename(args.dataset),
        "datasetRowCount": len(df),
        "isDemoData": args.is_demo_data,
        "dataDisclaimer": (
            "DEMO DATA - NOT REAL MARKET DATA. This model was trained on synthetic "
            "data for pipeline development. Predictions must not be presented as "
            "real market estimates until retrained on real price data."
            if args.is_demo_data
            else None
        ),
        "features": {"categorical": CATEGORICAL_FEATURES, "numeric": NUMERIC_FEATURES},
        "target": TARGET,
        "featureImportances": feature_importances,
        "featureImportanceNote": (
            "Global feature importances from the trained model (not specific to any "
            "single prediction). For RandomForest this is scikit-learn's "
            "feature_importances_; for LinearRegression it's |coefficient|. "
            "Categorical features appear one-hot encoded (e.g. 'componentType_ssd' "
            "means the effect of that value specifically)."
        ),
        "metrics": {
            "baseline_LinearRegression": baseline_metrics,
            "candidate_RandomForest": forest_metrics,
            "selected": best_metrics,
        },
        "metricDefinitions": {
            "MAE": "Mean Absolute Error - average absolute difference between predicted and actual price, in the same currency units. Lower is better.",
            "RMSE": "Root Mean Squared Error - like MAE but penalizes large errors more heavily. Lower is better.",
            "R2": "R-squared - proportion of price variance explained by the model, from 0 (no better than guessing the mean) to 1 (perfect). Higher is better.",
        },
    }

    metadata_path = os.path.join(models_dir, f"model_metadata_{args.version}.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[train] Saved metadata to {metadata_path}")

    print("\n=== TRAINING SUMMARY ===")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()

# ml-service

Python price-prediction microservice. Trains a regression model on price
data and serves predictions to the Node backend over HTTP.

## Setup

```bash
cd ml-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

## Generate demo data and train (first time)

```bash
./venv/bin/python src/generate_demo_dataset.py   # writes data/demo_prices_v1.csv
./venv/bin/python src/train.py --dataset data/demo_prices_v1.csv --version v1
```

This prints real evaluation metrics (MAE, RMSE, R²) comparing a Linear
Regression baseline against a Random Forest, and saves the better one to
`models/price_model_v1.joblib` with metadata in
`models/model_metadata_v1.json`.

**The generated dataset is synthetic** - clearly labeled
`DEMO DATA - NOT REAL MARKET DATA` in every place it's referenced
(dataset file, model metadata, and every prediction API response). It
exists to develop and test the ML pipeline itself. Replace
`data/demo_prices_v1.csv` with real price data (exported from Phase 4's
PriceRecord collection, once enough real data has been entered) and
retrain with a new `--version` when ready - see "Retraining on real
data" below.

## Run the inference API

```bash
./venv/bin/python src/app.py
```

Starts on port 8001 by default (override with `ML_SERVICE_PORT`).

- `GET /health` - service + loaded model status
- `POST /predict` - body: `{ componentType, brand, condition, workingStatus, ageYears, health }`, all required

## Retraining on real data

Once you have real price data (e.g. exported from MongoDB's
`PriceRecord` collection as CSV, matching the same column names used in
`data/demo_prices_v1.csv`: `componentType, brand, ageYears, health,
condition, workingStatus, price`), retrain with a new version:

```bash
./venv/bin/python src/train.py --dataset data/real_prices_v2.csv --version v2 --is-demo-data=False
```

Never overwrite `price_model_v1.joblib` - versioning means old models
stay on disk. The Node backend automatically uses whichever version was
trained most recently (`app.py` picks the newest metadata file by
modification time).

## Model versioning

Every training run produces two files: `price_model_<version>.joblib`
(the model) and `model_metadata_<version>.json` (name, algorithm,
training date, dataset used, row count, demo-data flag, and full
evaluation metrics with plain-English definitions). Nothing is
overwritten - old versions remain on disk for reproducibility.

"""
generate_demo_dataset.py

Generates a DEMO price dataset for developing/testing the ML pipeline.

*** THIS DATA IS SYNTHETIC. IT DOES NOT REPRESENT REAL MARKET PRICES. ***

Per the master project plan (section 14): demo data may be created for
development, but must never be presented to a user as real market
information. Every place this dataset's origin is surfaced (model
metadata, API responses, UI) must say "DEMO DATA" explicitly.

The generation logic uses plausible, explainable relationships (newer /
higher-capacity / healthier / working components cost more; brand tier
adds a premium) so the resulting model actually learns something
sensible for demo purposes - but the specific numbers are made up, not
observed. Real data (via Phase 4's CSV import or admin entry) should
replace this before any real deployment.
"""

import csv
import random
from datetime import datetime, timedelta

random.seed(42)  # reproducible - same "dataset version" every regeneration

COMPONENT_TYPES = ["ram", "ssd", "hdd", "battery", "display", "gpu"]

# Base new-condition price per component type (INR) - rough starting points
BASE_PRICE = {
    "ram": 1800,      # per typical 8GB stick
    "ssd": 3200,      # per typical 512GB
    "hdd": 2800,      # per typical 1TB
    "battery": 2500,
    "display": 5500,
    "gpu": 12000,
}

BRANDS = {
    "ram": ["Corsair", "Kingston", "Crucial", "Generic"],
    "ssd": ["Samsung", "WD", "Crucial", "Generic"],
    "hdd": ["Seagate", "WD", "Toshiba", "Generic"],
    "battery": ["Dell", "HP", "Lenovo", "Generic"],
    "display": ["Dell", "HP", "Lenovo", "Generic"],
    "gpu": ["Nvidia", "AMD", "Generic"],
}

BRAND_MULTIPLIER = {
    "Samsung": 1.15, "WD": 1.05, "Seagate": 1.0, "Toshiba": 0.95,
    "Corsair": 1.1, "Kingston": 1.0, "Crucial": 1.05,
    "Dell": 1.05, "HP": 1.0, "Lenovo": 1.0,
    "Nvidia": 1.2, "AMD": 1.1,
    "Generic": 0.8,
}

CONDITIONS = ["excellent", "good", "fair", "poor"]
CONDITION_MULTIPLIER = {"excellent": 0.85, "good": 0.65, "fair": 0.45, "poor": 0.2}

WORKING_STATUSES = ["VERIFIED_WORKING", "LIKELY_WORKING", "NOT_WORKING"]
STATUS_MULTIPLIER = {"VERIFIED_WORKING": 1.0, "LIKELY_WORKING": 0.75, "NOT_WORKING": 0.1}


def random_date_within_last_year():
    days_ago = random.randint(0, 365)
    return (datetime(2026, 8, 22) - timedelta(days=days_ago)).strftime("%Y-%m-%d")


def generate_row():
    component_type = random.choice(COMPONENT_TYPES)
    brand = random.choice(BRANDS[component_type])
    age_years = round(random.uniform(0.5, 6), 1)
    health = max(5, min(100, round(random.gauss(70, 20))))
    condition = random.choice(CONDITIONS)
    working_status = random.choices(
        WORKING_STATUSES, weights=[0.5, 0.3, 0.2]
    )[0]

    base = BASE_PRICE[component_type]
    brand_mult = BRAND_MULTIPLIER.get(brand, 0.9)
    age_mult = max(0.3, 1 - age_years * 0.1)  # depreciate ~10%/yr, floor at 30%
    health_mult = health / 100
    condition_mult = CONDITION_MULTIPLIER[condition]
    status_mult = STATUS_MULTIPLIER[working_status]

    price = base * brand_mult * age_mult * health_mult * condition_mult * status_mult
    # add noise so it's not a perfectly learnable formula (real markets aren't)
    price *= random.uniform(0.85, 1.15)
    price = max(50, round(price, -1))  # round to nearest 10, floor at 50

    return {
        "componentType": component_type,
        "brand": brand,
        "ageYears": age_years,
        "health": health,
        "condition": condition,
        "workingStatus": working_status,
        "price": int(price),
        "source": "DEMO DATA - synthetic, generated for pipeline development",
        "observedDate": random_date_within_last_year(),
    }


def generate_dataset(n_rows, out_path):
    rows = [generate_row() for _ in range(n_rows)]
    fieldnames = list(rows[0].keys())
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {n_rows} DEMO rows to {out_path}")
    print("REMINDER: this is synthetic data, not real market prices.")


if __name__ == "__main__":
    import os
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    generate_dataset(1200, os.path.join(out_dir, "demo_prices_v1.csv"))

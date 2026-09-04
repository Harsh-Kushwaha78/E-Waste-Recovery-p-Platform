# E-Waste Recovery, Valuation, Reuse & Recycling Platform

> "What value can still be recovered from my non-working electronic device?"

An AI/ML-powered platform that helps users identify reusable components
inside non-working electronics, verify their real condition through
functional testing, estimate their fair recoverable value using market
data and machine learning, and decide whether to reuse, sell, donate, or
recycle each part.

**Project status: all 17 phases complete.** Architecture, auth,
devices/components, functional testing, price data, ML prediction,
computer vision (demo mode), market data, valuation engine,
why-this-price, valuation history, GenAI chatbot, marketplace,
recycling, admin dashboard, testing, and deployment prep are all built.
See `docs/deployment.md` for what's genuinely verified vs. what you
need to test yourself (no live MongoDB or Docker was available in the
sandbox this was built in - see that doc and `docs/testing.md` for
exactly what that means).

## Problem

Users usually don't know which components inside a broken device still
work, what they're worth, or where to sell/recycle them safely. This
project turns that guesswork into a structured, evidence-based process.

## Core principle: no fake AI

This project never labels something "AI detected" or "ML predicted"
unless a real model actually produced that result. Anything not yet
implemented is clearly marked **Demo Mode / Prototype / Coming Soon** in
the UI. See `docs/` for details on each subsystem's real vs. planned
status.

## Architecture (short version)

```
Computer Vision   -> identifies components + visible damage
Functional Testing -> determines if components actually work
Market Data        -> current/recent pricing information
Price ML            -> estimates fair recoverable value
GenAI               -> explains results, answers questions
```

These stay as separate systems. Full diagram: `docs/architecture.md`.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **ML service:** Python, pandas, scikit-learn (Phase 5+)
- **CV service:** Python, OpenCV, YOLO/pretrained detector (Phase 6+)
- **GenAI:** pluggable LLM API integration (Phase 11+)

## Project structure

```
e-waste-platform/
  backend/         Node/Express API + MongoDB models
  frontend/        React app
  ml-service/       Python price-prediction service (not implemented yet)
  cv-service/       Python computer-vision service (not implemented yet)
  datasets/         Price/market CSVs, CV training data (not populated yet)
  docs/            Architecture, API, database, ML, CV, deployment docs
  docker-compose.yml  Orchestration stub (used from Phase 17)
  .env.example      Root-level environment variable reference
```

## Requirements

- Node.js 18+ and npm
- MongoDB (local install or MongoDB Atlas free tier) — optional for
  Phase 0; the backend runs without it and reports its absence honestly
  via `/api/health`
- Python 3.10+ (only needed starting Phase 5)
- Git

## Environment variables

Copy the example files and fill in real values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`:
| Variable      | Purpose                          |
|----------------|-----------------------------------|
| PORT           | Port Express listens on (default 5000) |
| MONGODB_URI    | MongoDB connection string          |
| JWT_SECRET     | Will be used from Phase 1 (auth)   |

`frontend/.env`:
| Variable            | Purpose                            |
|----------------------|--------------------------------------|
| VITE_API_BASE_URL    | Base URL of the backend API          |

## Running locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit MONGODB_URI if you have MongoDB running
npm run dev
```

Visit http://localhost:5000/api/health — you should see JSON reporting
server status and whether MongoDB is connected.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit the URL Vite prints (typically http://localhost:5173). You should
see a card showing "Backend server: Running" and the MongoDB connection
status.

### 3. ML service (optional but needed for price predictions)

In a third terminal:

```bash
cd ml-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python src/generate_demo_dataset.py
./venv/bin/python src/train.py --dataset data/demo_prices_v1.csv --version v1
./venv/bin/python src/app.py
```

Runs on http://localhost:8001. The backend auto-detects it - check
`http://localhost:5000/api/health` for `"mlService": { "reachable": true, ... }`.
Everything else in the app works fine without this service running; only
the "Estimate recoverable value" button on components will show a clear
"unavailable" message instead of a prediction.

### 4. CV service (optional - runs in DEMO CV MODE, see limitations)

In a fourth terminal:

```bash
cd cv-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python src/app.py
```

Runs on http://localhost:8002. Check `/api/health` for
`"cvService": { "reachable": true, "mode": "DEMO_CV_MODE" }`. Without
this running, image analysis shows a clear "unavailable" message but
manual component entry (Phase 2) still works fully.

## Testing Phase 0 (still applies)

1. Start the backend. Confirm `/api/health` returns
   `"database": { "connected": false, ... }` if you have no
   `MONGODB_URI` set — this proves the fallback mode works.
2. If you have MongoDB installed/Atlas configured, add `MONGODB_URI` to
   `backend/.env`, restart, and confirm `"connected": true`.
3. Start the frontend and confirm the page loads the health status live
   from the backend (not hardcoded).
4. Stop the backend and reload the frontend — confirm it shows a clear
   "Could not reach the backend" message instead of crashing blank.

## Testing Phase 1 (authentication) — requires MongoDB running

You need a real MongoDB connection for this phase (local install or
Atlas free tier). Add it to `backend/.env` as `MONGODB_URI`, and add a
real `JWT_SECRET` (any long random string). Restart the backend and
confirm `/api/health` shows `"connected": true` before testing below.

1. **No-DB behavior (works even without MongoDB):** stop MongoDB (or
   just don't set `MONGODB_URI`) and call
   `POST /api/auth/register` — you should get a fast `503` with
   `"Database unavailable..."`, not a hang or a crash.
2. **Register:** with MongoDB connected, go to `/register` in the
   frontend, create an account. You should land on `/dashboard` showing
   your name and email.
3. **Duplicate email:** try registering the same email again — expect a
   clear `409` "An account with this email already exists" error shown
   in the form.
4. **Log out / log in:** click "Log out" on the dashboard, then log back
   in at `/login` with the same credentials. Confirm you land on
   `/dashboard` again.
5. **Wrong password:** try logging in with the wrong password — expect
   "Invalid email or password" (deliberately vague, doesn't reveal which
   field was wrong).
6. **Protected routes:** visit `/dashboard` or `/profile` in a private/
   incognito window (no token stored) — you should be redirected to
   `/login` automatically instead of seeing the page.
7. **Profile page:** while logged in, visit `/profile` — it re-fetches
   your data live from `GET /api/users/me` using your token (not just
   showing cached data), proving the JWT middleware works end to end.
8. **Password hashing:** if you have access to your MongoDB database,
   inspect the `users` collection directly — confirm the `password`
   field is a bcrypt hash (starts with `$2a$` or `$2b$`), never plain
   text.

## Testing Phase 2 (devices & components) — requires MongoDB + login

1. **Add a device:** log in, go to `/devices`, click "+ Add Device",
   fill in name/category, submit. You should land on that device's
   detail page.
2. **Add components:** on the device page, click "+ Add Component",
   pick a type (e.g. SSD), set a working status, submit. It should
   appear in the components list immediately with the correct status
   badge color (gray = Not Tested, green = Verified Working, etc).
3. **Change working status inline:** use the dropdown under a component
   card to change its status — confirm the badge color updates after
   the change is saved.
4. **Edit persistence:** refresh the page — confirm your device and
   components are still there (proves it's really saved in MongoDB, not
   just local state).
5. **Ownership scoping:** register a second account, log in as that
   user, and confirm `/devices` shows an empty list — not the first
   user's devices. If you have the first device's id, try
   `GET /api/devices/<that-id>` with the second user's token — expect a
   `404`, not the device data.
6. **Delete component:** delete a single component — confirm it
   disappears and the count updates, without affecting the device or
   other components.
7. **Delete device:** delete a device with components on it — confirm
   the device and all its components are gone (the API response
   reports `componentsDeleted` count).
8. **Validation:** try adding a device with no name, or a component with
   an invalid type via curl — confirm you get a clear `400` error
   message, not a crash.

## Testing Phase 3 (functional testing) — requires MongoDB + a device with components

1. **Run a test:** open a device, find a component (e.g. an SSD), click
   "Run a test". Answer a few fields (e.g. Detected? Yes, Read/write
   test passed? Yes, SMART health: 87), add an evidence note, submit.
2. **Status updates from evidence:** confirm the component's status
   badge changes to reflect the derived result (e.g. green "Verified
   Working") — not something you picked from a dropdown.
3. **Reasoning is visible:** click "View test history" — confirm each
   past test shows the plain-English reasons behind its derived status
   (e.g. "Detected by the system. Read/write test passed. SMART health:
   87%.").
4. **Negative case:** run a test on a different component marking a
   critical field "No" (e.g. Battery → Swelling? Yes, or Display → Turns
   on? No) — confirm it comes back `NOT_WORKING`, not something milder.
5. **Partial test:** submit a test leaving every field blank — confirm
   the result is `NOT_TESTED`, not a false positive.
6. **History persists:** refresh the page, reopen "View test history" —
   confirm all past tests are still there with correct timestamps.
7. **Health percentage flows through:** if you provided a
   `smartHealthPercent` or `healthPercent` value, confirm the
   component's health display updates to match.
8. **No fake AI:** confirm nowhere in the UI does it say "AI detected"
   or "ML predicted" for these results — the app should read as a
   rule-based evidence log, which is what it actually is.

## Testing Phase 4 (price data) — requires MongoDB + admin account

**Note:** the first account ever registered on your database
automatically becomes admin. If you already registered a test account
in Phase 1-3, that one is your admin — log in with it. If you want a
fresh admin, wipe the `users` collection first.

1. **Admin nav link:** log in as your admin account, go to `/dashboard`
   — confirm you see an "Admin: Prices" link and an "admin" badge next
   to your email. Log in as a second (non-admin) account and confirm
   that link is absent.
2. **Non-admin blocked:** as the non-admin account, try visiting
   `/admin/prices` directly — confirm it shows "This page requires
   admin access" rather than the admin UI. Try `POST /api/prices` via
   curl with the non-admin's token — expect a `403`.
3. **Manual entry:** as admin, add a price record (e.g. SSD, 512GB,
   ₹1900, source "OLX listing", today's date). Confirm it appears in
   the list immediately with its source and date shown.
4. **CSV import (valid file):** upload `datasets/samples/sample_prices.csv`
   — confirm all 5 rows import successfully and appear in the list.
5. **CSV import (rows with errors):** create a CSV with an intentionally
   bad row (e.g. `price` = "abc", or missing `source`) mixed with good
   rows — confirm the good rows still import and the response clearly
   lists which row failed and why, instead of rejecting the whole file
   or silently skipping the bad row.
6. **Delete:** delete a price record — confirm it's removed from the
   list.
7. **Non-admin can still view:** confirm a logged-in non-admin user CAN
   call `GET /api/prices` (view-only) even though they can't create,
   edit, or import.

## Testing Phase 5 (price prediction ML) — requires ml-service running

1. **Health check shows ML status:** with ml-service running, check
   `/api/health` — confirm `"mlService": { "reachable": true, "modelLoaded": true, "isDemoData": true }`.
2. **Get a prediction:** open a device, find a component, click
   "Estimate recoverable value" — confirm you get a price range, a
   confidence label (HIGH/MEDIUM/LOW), and the model name/version.
3. **Demo disclaimer is visible:** confirm the amber "DEMO DATA - NOT
   REAL MARKET DATA" warning is shown directly under the prediction —
   never silently hidden.
4. **Sensible relationships:** try predicting for a `NOT_WORKING`
   component vs the same component `VERIFIED_WORKING` — confirm the
   working one predicts meaningfully higher. Try low health % vs high
   health % — confirm health matters directionally.
5. **Service-down fallback:** stop ml-service (Ctrl+C in its terminal),
   refresh `/api/health` — confirm `"reachable": false` with a clear
   note, and that clicking "Estimate recoverable value" shows an
   amber "ML price-prediction service is unavailable..." message
   instead of crashing the page. Confirm the rest of the app (devices,
   tests, prices) still works fine with ml-service down.
6. **Training metrics are real:** run `train.py` yourself (see
   ml-service/README.md) and check the printed MAE/RMSE/R² — these are
   computed on a real held-out test split, not invented.
7. **Model versioning:** run `train.py` again with `--version v2` —
   confirm both `price_model_v1.joblib` and `price_model_v2.joblib`
   exist afterward (nothing overwritten), and that the backend picks up
   v2 automatically (check `/api/health` or a new prediction's
   `modelVersion`).

## Testing Phase 6 (computer vision) — requires cv-service running

1. **Health check shows CV status:** with cv-service running, check
   `/api/health` — confirm `"cvService": { "reachable": true, "mode": "DEMO_CV_MODE" }`.
2. **Upload a photo:** open a device, in "Analyze a photo" upload any
   real image file (a JPG/PNG of anything — the demo detector doesn't
   actually look at content). Confirm you see 1-4 suggested components
   with bounding boxes drawn on the image and a confidence percentage
   each.
3. **Demo disclaimer is unmissable:** confirm the amber "DEMO CV MODE"
   warning is shown directly above the results, and each suggestion
   explicitly says "demo confidence, not real."
4. **Add a suggestion:** click "Add as component" on one suggestion —
   confirm it appears in the real components list below (via the normal
   Phase 2 flow), with a note referencing it was CV-suggested.
5. **Nothing auto-adds:** confirm uploading a photo does NOT
   automatically create any components — you must click "Add as
   component" for each one you want.
6. **Reject a disguised file:** rename a `.txt` file to `.jpg` and try
   uploading it — confirm you get a clear "could not be decoded as a
   valid image" error, not a crash or a fake detection result.
7. **Service-down fallback:** stop cv-service, try uploading a photo —
   confirm a clear "unavailable" message, and that manually adding
   components (without a photo) still works fine.

## Running tests

```bash
cd backend
npm test
```

Runs 25 automated unit tests (Node's built-in test runner, no extra
dependency) covering all pure/logic functions - status derivation, CSV
validation, recycling classification, scrap value estimation, price
explanations, chatbot prompt construction, and market data aggregation.
See `docs/testing.md` for full coverage details and honest limitations.

## Documentation

See `docs/`:
- `architecture.md` — system design and data flow
- `api.md` — API route plan
- `database.md` — MongoDB entity overview
- `testing.md` — Phase 16 test coverage summary (what's automated, what's not, and why)
- `end-to-end-test.md` — Phase 15 full user-journey integration test
- `deployment.md` — Phase 17 deployment guide (Docker Compose, standalone hosting, env vars, production checklist)

More docs (`ml.md`, `computer-vision.md`, `chatbot.md`, `market-data.md`,
`deployment.md`, `testing.md`, `datasets.md`, `models.md`) will be added
as their corresponding phases are built.

## Development phases

This project was built in small, tested phases rather than all at once.
All 17 phases are complete:

0. Architecture & setup
1. Authentication
2. Device & component management
3. Functional testing
4. Price data
5. Price prediction ML
6. Computer vision (demo mode - see limitations)
7. Market data
8. Valuation engine
9. Why this price
10. Valuation history
11. GenAI chatbot
12. Marketplace
13. Recycling
14. Admin dashboard
15. Complete integration
16. Testing & quality
17. Deployment

Each phase's commit in git history documents exactly what was added and
why. See `docs/` for full detail on each subsystem.

## License

Educational / final-year project. License to be decided.

# API Overview

Base URL (local dev): `http://localhost:5000`

## Implemented

| Method | Route                                   | Auth?     | Purpose                                   |
|--------|-------------------------------------------|-----------|----------------------------------------------|
| GET    | /api/health                               | No        | Server status + MongoDB connection state      |
| POST   | /api/auth/register                        | No        | Create a new user account                     |
| POST   | /api/auth/login                           | No        | Authenticate, returns a JWT                    |
| POST   | /api/auth/logout                          | No        | Stateless - tells client to discard its token  |
| GET    | /api/users/me                             | Yes (JWT) | Returns the currently authenticated user's profile |
| GET    | /api/devices                              | Yes (JWT) | List the current user's devices               |
| POST   | /api/devices                              | Yes (JWT) | Create a device                               |
| GET    | /api/devices/:id                          | Yes (JWT) | Get one device + its components               |
| PUT    | /api/devices/:id                          | Yes (JWT) | Update a device                               |
| DELETE | /api/devices/:id                          | Yes (JWT) | Delete a device (cascades to its components)  |
| GET    | /api/devices/:deviceId/components         | Yes (JWT) | List components for a device                  |
| POST   | /api/devices/:deviceId/components         | Yes (JWT) | Add a component to a device                    |
| GET    | /api/components/:id                       | Yes (JWT) | Get one component                              |
| PUT    | /api/components/:id                       | Yes (JWT) | Update a component                             |
| DELETE | /api/components/:id                       | Yes (JWT) | Delete a component                             |
| GET    | /api/components/:id/tests                 | Yes (JWT) | List test history for a component             |
| POST   | /api/components/:id/tests                 | Yes (JWT) | Submit a functional test, updates workingStatus |

### Ownership scoping

Every device/component/test query is filtered by `owner: req.user._id`
(or via the device's owner) at the database level. Requesting another
user's data returns `404 Not Found`, never their data.

### Middleware order

All protected routes run `requireDb` then `protect`: DB-down returns
`503` regardless of token; DB-up with a bad/missing token returns `401`.

### Functional testing (Phase 3)

`POST /api/components/:id/tests` accepts:
```json
{
  "results": { "detected": true, "memoryTestPassed": true },
  "evidenceNotes": "Ran memtest86, no errors after 2 passes."
}
```

The exact fields inside `results` depend on the component's `type` -
see `backend/src/utils/deriveWorkingStatus.js` for the full field list
per type (RAM, SSD/HDD, battery, display, keyboard, camera, speaker, and
a generic powersOn check for everything else).

The backend derives `VERIFIED_WORKING` / `LIKELY_WORKING` /
`NOT_WORKING` / `NOT_TESTED` from those observations using a **plain
rule-based heuristic** - not a machine-learning model. It is never
labeled "AI" or "ML" anywhere in the UI or API responses. The response
includes `derivedReasons`, a plain-English list of exactly why that
status was chosen, so nothing is a black box:

```json
{
  "status": "ok",
  "test": {
    "derivedStatus": "VERIFIED_WORKING",
    "derivedReasons": ["Detected by the system.", "Memory test passed."],
    "evidenceNotes": "Ran memtest86, no errors after 2 passes.",
    "testDate": "2026-08-22T..."
  },
  "component": { "workingStatus": "VERIFIED_WORKING", "...": "..." }
}
```

Submitting a test **overwrites** the component's `workingStatus` with
the derived result - the manual status a user might have set when first
adding the component (Phase 2) is only a placeholder until a real test
is run.

**Known limitation:** evidence is currently text notes only. Screenshot/
photo evidence attachments require file-upload infrastructure (storage,
validation per project section 35) that hasn't been built yet - planned
alongside Phase 6 (Computer Vision), which needs image upload too.

### Example requests

```bash
TOKEN="<paste JWT from login/register>"

# Submit a test for an SSD component
curl -X POST http://localhost:5000/api/components/COMPONENT_ID/tests \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"results":{"detected":true,"readWriteTestPassed":true,"smartHealthPercent":87},"evidenceNotes":"CrystalDiskInfo screenshot attached."}'

# View test history
curl http://localhost:5000/api/components/COMPONENT_ID/tests \
  -H "Authorization: Bearer $TOKEN"
```

## Planned routes (not yet implemented)

```
/api/prices             Phase 4  - admin price records
/api/market             Phase 7  - market data retrieval
/api/predictions         Phase 5  - ML price predictions
/api/valuation           Phase 8  - combined valuation engine
/api/listings            Phase 12 - marketplace
/api/chat               Phase 11 - GenAI chatbot
/api/recycling           Phase 13 - recycling guidance
/api/verification         Phase 3/12 - trust/verification status (badge display exists; formal verification records don't yet)
/api/admin              Phase 14 - admin dashboard endpoints
/api/datasets            Phase 4/5/6 - dataset upload/versioning
/api/models              Phase 5/6 - model version metadata
```

## Conventions

- JSON request/response bodies.
- Standard HTTP verbs: GET (read), POST (create), PUT/PATCH (update),
  DELETE (remove).
- Errors always return `{ status: "error", message: "..." }` with an
  appropriate HTTP status code - never a bare 500 with no explanation.
- Successful responses return `{ status: "ok", ...data }`.
- Protected routes use the `protect` middleware (checks JWT).
- Database-dependent routes use the `requireDb` middleware (checks
  MongoDB connection state before touching the DB).

## Price data (Phase 4)

| Method | Route              | Auth?       | Purpose                                |
|--------|--------------------|-------------|-------------------------------------------|
| GET    | /api/prices        | Yes (any user) | List price records, filterable by `?componentType=` and `?brand=` |
| POST   | /api/prices        | Yes (admin) | Create a price record manually            |
| PUT    | /api/prices/:id    | Yes (admin) | Update a price record                      |
| DELETE | /api/prices/:id    | Yes (admin) | Delete a price record                      |
| POST   | /api/prices/import | Yes (admin) | Import price records from a CSV file (multipart/form-data, field `file`) |

### Admin bootstrap

There's no separate admin-invite flow yet. **The very first user account
ever registered on a fresh database automatically becomes an admin.**
Every account after that is a normal `user`. If you need another admin
later, promote them by editing their `role` field directly in MongoDB.

### CSV import format

Header row required. Columns (in any order):
```
componentType, brand, model, capacity, condition, workingStatus,
price, currency, source, sourceUrl, observedDate, notes
```
Required: `componentType` (must match a known component type),
`price` (non-negative number), `source`, `observedDate` (valid date).
Everything else is optional.

Every row is validated independently - valid rows are imported even if
other rows in the same file fail. The response always includes an
`errors` array listing exactly which row failed and why, e.g.:
```json
{ "row": 4, "message": "price \"not_a_number\" is not a valid non-negative number" }
```
A sample CSV is at `datasets/samples/sample_prices.csv`.

### Honesty about what this data is

Every price record requires a `source` and `observedDate` and is always
displayed with both - this is historical/admin-curated data, never
presented as live pricing. Live market retrieval is a separate system
planned for Phase 7.

## Price prediction (Phase 5)

| Method | Route                              | Auth?     | Purpose                                |
|--------|--------------------------------------|-----------|--------------------------------------------|
| POST   | /api/predictions/components/:id     | Yes (JWT) | Request a fresh ML price prediction for a component, saves it |
| GET    | /api/predictions/components/:id     | Yes (JWT) | List past predictions for a component      |

### Architecture

```
React -> POST /api/predictions/components/:id -> Node/Express
                                                       |
                                                       v
                                          ml-service (Python, port 8001)
                                                       |
                                                       v
                                             loads price_model_v1.joblib
                                                       |
                                                       v
                                     { pointEstimate, rangeLow, rangeHigh,
                                       confidence, model info, isDemoData }
                                                       |
                                                       v
                                     Node saves a Prediction record, returns it
```

The Node backend never trains or loads the model itself - it only calls
ml-service's `/predict` endpoint over HTTP and stores the result. This
keeps the Python ML stack fully separate from the Node API stack (see
`docs/architecture.md`).

### Fallback behavior

If `ml-service` is unreachable, `/api/health` reports
`"mlService": { "reachable": false, ... }` (checked live, non-blocking,
2s timeout) and `POST /api/predictions/components/:id` returns a clear
`503` explaining that predictions are unavailable but the rest of the
app still works. The backend never crashes because ml-service is down.

### Demo data disclosure

The currently trained model (`v1`) was trained on **synthetic demo
data** (see `ml-service/README.md`). Every prediction response includes
`"isDemoData": true` and a `dataDisclaimer` string, and the frontend
displays this disclaimer prominently on every prediction - it is never
silently hidden. Once real price data exists (via Phase 4's CSV
import/admin entry) and the model is retrained on it, `isDemoData` will
be `false` and the disclaimer will be absent.

### Example request

```bash
curl -X POST http://localhost:5000/api/predictions/components/COMPONENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Computer vision (Phase 6)

| Method | Route                                   | Auth?     | Purpose                                |
|--------|--------------------------------------------|-----------|-------------------------------------------|
| POST   | /api/cv/devices/:deviceId/analyze          | Yes (JWT) | Upload a device photo, get demo component suggestions |

### DEMO CV MODE

**This is not a trained computer vision model.** No annotated e-waste
image dataset was available to train one (fabricating training images
isn't allowed). Every response is labeled `"mode": "DEMO_CV_MODE"` with
a `disclaimer` field, and the frontend displays this prominently -
never hidden. See `cv-service/README.md` and
`cv-service/dataset/ANNOTATION_FORMAT.md` for what would be needed to
replace this with a real trained detector later (the API contract is
designed to stay the same).

Detections use the image's real dimensions for bounding box placement,
but do not analyze actual pixel/visual content - the component classes
and confidence scores are randomly generated from a small target list
(`ram`, `ssd`, `battery`, `motherboard`, `display`).

**No detection is ever auto-added as a component.** The user must click
"Add as component" for each suggestion, which goes through the normal
Phase 2 `POST /api/devices/:deviceId/components` flow - suggestions are
an optional shortcut, not an automatic action.

### Image upload validation

- Extension + MIME type checked in Node (`imageUpload` middleware) before
  forwarding to cv-service.
- cv-service independently verifies the bytes actually decode as a real
  image (via Pillow) - catches disguised files with a fake extension.
- 8MB size limit, enforced at both layers.

### Fallback behavior

If cv-service is down, `/api/health` reports
`"cvService": { "reachable": false, ... }` and
`POST /api/cv/devices/:deviceId/analyze` returns a `503` explaining that
manual component entry still works. The backend never crashes because
cv-service is unavailable.

### Example request

```bash
curl -X POST http://localhost:5000/api/cv/devices/DEVICE_ID/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@photo.jpg"
```

## Market data (Phase 7)

| Method | Route     | Auth?     | Purpose                                       |
|--------|-----------|-----------|------------------------------------------------|
| GET    | /api/market?componentType=ssd&brand=Samsung | Yes (JWT) | Get market price info: live if available, historical (PriceRecord) fallback otherwise |

### Honesty about live data

No live market API/provider is configured (would require a real
subscription and to respect that provider's terms of service, which
this project doesn't have). `getLiveMarketData()` in
`backend/src/services/marketDataService.js` is the intended integration
point for a real provider later - it always returns
`{ available: false, note: "..." }` right now. Every response therefore
uses `"usedSource": "historical"`, backed by Phase 4's admin/CSV price
data, with `lastUpdated` always shown. This matches master prompt
section 18: "If live market data is unavailable: Show 'Live market data
unavailable.' Use stored historical/verified data with 'Last updated:
[date]'."

## Valuation engine (Phase 8)

| Method | Route                          | Auth?     | Purpose                              |
|--------|----------------------------------|-----------|------------------------------------------|
| POST   | /api/valuation/devices/:deviceId | Yes (JWT) | Generate a fresh valuation snapshot for a device |
| GET    | /api/valuation/devices/:deviceId | Yes (JWT) | Get the most recent valuation for a device |

Combines: functional test status (Phase 3) → ML prediction for working
components (Phase 5) or a rule-based scrap estimate for non-working ones
→ used-market historical range for context (Phase 7). Every component
line item shows its `valueBasis` (`ml_prediction` / `scrap_estimate` /
`unavailable`) so nothing is presented as more certain than it is.

**"New price" is intentionally not shown** - this system has no data
source for retail/new prices, and inventing one would violate the
project's no-fabrication rule. Only used-market range and ML-derived
recoverable value appear.

Overall confidence is the *worst* confidence among all components (any
`unavailable` component forces overall `LOW`) - deliberately pessimistic
rather than averaging away a real gap in the data.

## Why this price (Phase 9)

| Method | Route                                       | Auth?     | Purpose                       |
|--------|-----------------------------------------------|-----------|---------------------------------|
| GET    | /api/predictions/components/:id/why           | Yes (JWT) | Explain the latest prediction for a component |

Returns two explicitly separate kinds of explanation, never blended:
- **`modelDerived`**: real feature importances computed at training time
  (scikit-learn's `feature_importances_` for Random Forest, or absolute
  coefficients for Linear Regression) - genuine model output, with a
  caveat that these are global (whole-model) importances, not a
  per-prediction breakdown.
- **`generalExplanation`**: plain-language, rule-based statements about
  *this* component's recorded attributes (age, health, condition,
  working status) - explicitly labeled as context, not the model's
  internal reasoning.

## Valuation history (Phase 10)

| Method | Route                                     | Auth?     | Purpose                              |
|--------|----------------------------------------------|-----------|------------------------------------------|
| GET    | /api/valuation/devices/:deviceId/history      | Yes (JWT) | List all past valuation snapshots for a device |

Every `POST /api/valuation/devices/:deviceId` call (Phase 8) creates a
new `Valuation` document rather than overwriting the last one, so
history accumulates naturally. The frontend charts total recoverable
value over time (only once 2+ snapshots exist - a single point isn't a
trend). Per-component prediction history (Phase 5's
`GET /api/predictions/components/:id`) and price/market history
(Phase 4/7's `PriceRecord` `observedDate` field) already provide the
other historical views the master plan calls for (test history,
condition/market history, model version history via each prediction's
`modelVersion` field).

## GenAI chatbot (Phase 11)

| Method | Route                        | Auth?     | Purpose                              |
|--------|--------------------------------|-----------|------------------------------------------|
| POST   | /api/chat/devices/:deviceId    | Yes (JWT) | Send a message, get an AI reply grounded in this device's data |
| GET    | /api/chat/devices/:deviceId    | Yes (JWT) | Get chat history for a device            |

### Configuration required

Not configured by default. Set `GENAI_API_KEY` in `backend/.env` (an
Anthropic API key) to enable it. Without it, `POST` returns a `503`
explaining the chatbot isn't configured - the rest of the app works
fully without it. `GET` still works and returns `"configured": false`
so the frontend can show an appropriate message instead of a broken
chat box.

### How context is built

Every chat request rebuilds a system prompt (see
`backend/src/utils/buildChatSystemPrompt.js`) from the device's current
components, test statuses, and latest valuation - not from general
knowledge. The system prompt explicitly instructs the model to:
- Only use the structured data given, never invent a current market price
- Label claims as FACT / PREDICTION / ESTIMATE / UNKNOWN
- Say "unknown" plainly rather than guess
- Mention when a figure comes from a demo-data-trained model

### Never tested live in this project

No API key was available in the development sandbox this was built in.
The fallback path (`GENAI_API_KEY` unset → clean `503`) was verified
live. The actual LLM call path requires your own key - see
`backend/.env.example`.

## Marketplace (Phase 12)

| Method | Route              | Auth?             | Purpose                                  |
|--------|--------------------|-------------------|---------------------------------------------|
| GET    | /api/listings       | Yes (any user)    | Browse active listings, filter by componentType/workingStatus/price, sort |
| POST   | /api/listings       | Yes (own component)| Create a listing for a component you own    |
| GET    | /api/listings/:id   | Yes (any user)    | Full listing details + latest test evidence  |
| PUT    | /api/listings/:id   | Yes (seller only) | Update price/description/status              |
| DELETE | /api/listings/:id   | Yes (seller only) | Delete a listing                              |
| GET    | /api/listings/mine  | Yes (own listings)| All your listings regardless of status        |

### Trust model

Listings reference the live `Component`, never a snapshot - so
`workingStatus`/`health`/`condition` shown on a listing always reflect
the most recent functional test (Phase 3), and a seller cannot "freeze"
a fake good status. `GET /api/listings/:id` also returns the component's
`latestTest` (from `ComponentTest`) with its full reasoning, so buyers
see real evidence, not just a badge. A component with `NOT_TESTED`
status can still technically be listed via the API, but the frontend
blocks this from the UI and nudges the user to test first.

Only the component's actual owner can create a listing for it (checked
via `owner: req.user._id` on the underlying Component, same pattern as
every other ownership check in this app). Only the listing's seller can
edit or delete it.

## Recycling (Phase 13)

| Method | Route                       | Auth?     | Purpose                                  |
|--------|-------------------------------|-----------|------------------------------------------|
| GET    | /api/recycling?componentType=battery | Yes (any user) | Get disposal classification + guidance + local drop-off points |
| POST   | /api/recycling/options         | Yes (admin) | Add a local recycler/drop-off point       |
| DELETE | /api/recycling/options/:id     | Yes (admin) | Remove a local recycler/drop-off point    |

### Classification

Rule-based (not AI/ML) mapping in `backend/src/utils/classifyForRecycling.js`:
each component type maps to a category (`hazardous` /
`e_waste_recyclable` / `general_recyclable`) and a fixed list of safe,
general guidance strings. Batteries and displays are marked hazardous
and their guidance explicitly tells users NOT to puncture, crush, open,
or break them - no instructions ever direct the user to handle hazardous
materials unsafely.

### Local drop-off directory

No real recycler-directory API is integrated. `RecyclingOption` is an
admin-managed manual list (same pattern as Phase 4's `PriceRecord`) -
when none exist for a category, the response says so plainly instead of
pretending options exist.

## Admin dashboard (Phase 14)

| Method | Route                       | Auth?     | Purpose                              |
|--------|-------------------------------|-----------|------------------------------------------|
| GET    | /api/admin/stats               | Yes (admin) | System-wide counts (users, devices, components, tests, listings, valuations, price records) |
| GET    | /api/admin/users               | Yes (admin) | List all users                            |
| PUT    | /api/admin/users/:id/role       | Yes (admin) | Promote/demote a user (can't demote yourself) |
| GET    | /api/admin/audit-logs           | Yes (admin) | Recent system events                      |
| DELETE | /api/admin/listings/:id         | Yes (admin) | Moderate/remove any listing (marks `removed`, unlike the seller-only hard delete) |

### Audit log

`AuditLog` records key admin-sensitive events: price record
create/delete, CSV import (with row counts), recycling option creation,
user role changes, and admin listing removal. Each entry captures who
did what, when, and to what - viewable in the admin dashboard's Audit
Log tab. A failed audit write never blocks the actual operation it
describes (logged to console instead, per `backend/src/utils/auditLog.js`).

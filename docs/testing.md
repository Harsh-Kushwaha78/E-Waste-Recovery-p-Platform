# Testing & Quality Summary (Phase 16)

## Automated unit tests

`backend/tests/` - run with `npm test` inside `backend/`. **25 tests,
all passing** as of this phase. Covers every pure/logic function in the
codebase that doesn't require a database:

- `deriveWorkingStatus.js` - all 14 component types, empty-input safety
  (must return `NOT_TESTED`, not a false positive), critical-failure
  overrides (e.g. battery swelling always wins regardless of other
  fields)
- `parsePriceCsv.js` - valid CSV, every individual validation failure
  (bad type, non-numeric price, missing source, invalid date), and the
  "one bad row doesn't block good rows" guarantee
- `classifyForRecycling.js` - hazardous classification for batteries,
  safe-guidance wording, unknown-type fallback
- `estimateScrapValue.js` - positive values for all types, unknown-type
  fallback
- `buildPriceExplanation.js` - explanation direction matches the
  underlying data (negative factors lead for bad components, positive
  for good ones)
- `buildChatSystemPrompt.js` - the "never invent prices" instruction is
  present, and demo-data flagging works
- `marketDataService.computeStats` - aggregation math (min/max/average)
  and the empty-input case

## ML evaluation (Phase 5)

Real, not fabricated: `ml-service/src/train.py` computes MAE, RMSE, and
R2 on a genuine held-out test split (80/20) every time it runs. Current
numbers on the demo dataset: Random Forest MAE around 148, RMSE around
249, R2 around 0.95 (vs a Linear Regression baseline at R2 around 0.63)
- re-verified during this phase's clean rebuild. See
`ml-service/models/model_metadata_v1.json` for the full numbers.

## CV evaluation (Phase 6) - honestly, there isn't one

The master plan asks for precision/recall/mAP. There is no trained
detection model to evaluate - cv-service runs in DEMO_CV_MODE (random
detections within real image bounds, clearly labeled - see Phase 6).
Precision/recall/mAP figures would have to be invented against a fake
model, which this project's own rules forbid. This gets revisited once a
real annotated dataset and trained detector exist (see
`cv-service/dataset/ANNOTATION_FORMAT.md`).

## Upload security tests

- **cv-service (Python/Pillow)**: live-tested in Phase 6 - a `.txt` file
  renamed to `.jpg` was correctly rejected with "could not be decoded as
  a valid image," not silently accepted or crashed.
- **Node layer (multer)**: `backend/src/middleware/imageUpload.js` and
  `csvUpload.js` apply extension + MIME type checks before a file
  reaches cv-service or the CSV parser. Structurally identical pattern
  to what was already verified live in cv-service. Could not be
  independently fired through the Node layer in this sandbox because
  `requireDb` middleware runs first and blocks on the missing MongoDB
  connection - same limitation documented for every DB-dependent route
  throughout this project. Verify this yourself locally with MongoDB
  running: try uploading a `.exe` renamed to `.csv` to
  `/api/prices/import` and confirm a `400` with a clear message.

## Integration / API tests

No live MongoDB was available in this development sandbox at any point
(no internet access to a Mongo binary, network restricted to package
registries only). Every DB-dependent route was verified for:
- Correct route wiring (loads without errors, responds instead of
  hanging)
- Correct `requireDb` fail-fast behavior (503, not a hang, confirmed
  with elapsed-time-measured curl calls back in Phase 1)
- Correct validation logic *up to* the point where DB access is needed

The full request-to-database-to-response round trip for every CRUD
endpoint requires running this locally against real MongoDB.
`docs/end-to-end-test.md` (Phase 15) is the checklist for that - it's
the single source of truth for "does this actually work end to end,"
since this sandbox couldn't provide that proof itself.

## Security review checklist (manual code review this phase)

- [x] Passwords hashed with bcrypt, never returned in API responses
      (`select: false` on the schema field)
- [x] JWT verified on every protected route, invalid/expired tokens
      rejected with 401
- [x] Ownership scoping (`owner: req.user._id`) on every device/
      component/prediction/listing query - verified by code review
      across all controllers
- [x] Admin-only routes gated by `adminOnly` middleware, checked after
      `protect` so `req.user` is populated first
- [x] File uploads validated for extension + MIME type + size limit
      (both CSV and image paths)
- [x] No secrets in frontend code - `.env` files gitignored,
      `.env.example` files contain no real values
- [x] CORS is currently permissive (`cors()` with no options) - flagged
      for tightening in Phase 17 (deployment)

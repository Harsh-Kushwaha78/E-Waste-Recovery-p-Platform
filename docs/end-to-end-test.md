# End-to-End Integration Test (Phase 15)

This walks the full user journey described in the master project plan,
tying together every phase built so far (0-14). Run this after starting
all four services (see README "Running locally").

Unlike the per-phase checklists in the README (which test one feature
at a time), this test follows one continuous story: a single device,
from creation through to a sell/recycle decision.

## Prerequisites

- MongoDB running, `MONGODB_URI` set in `backend/.env`
- `JWT_SECRET` set in `backend/.env`
- ml-service running (port 8001) with a trained model
- cv-service running (port 8002)
- (Optional) `GENAI_API_KEY` set if you want to test the chatbot step

Confirm all four are up: `GET /api/health` should show
`database.connected: true`, `mlService.reachable: true`,
`cvService.reachable: true`.

## The journey

1. **Register** the first account (becomes admin automatically) at
   `/register`. Register a second, normal account too - you'll use both.

2. **Add price data** (as admin): go to `/admin/prices`, either add a
   few manual records or import `datasets/samples/sample_prices.csv`.
   This gives Phase 7 (market data) and Phase 8 (valuation) something
   real to fall back on beyond the ML model alone.

3. **Add a device** (as the normal user): `/devices/new` - e.g. "Dell
   Inspiron 15", laptop, age 4 years.

4. **Upload a photo** on the device page - confirm DEMO CV MODE
   suggestions appear with the amber disclaimer, bounding boxes drawn on
   the image. Click "Add as component" on 2-3 suggestions.

5. **Add one more component manually** (skip CV) to confirm both entry
   paths work side by side - e.g. a Battery.

6. **Run functional tests** on each component:
   - SSD: detected=yes, read/write passed=yes, SMART health=87
   - RAM: detected=yes, memory test passed=yes
   - Battery: charges=no, swelling=yes (to test the NOT_WORKING path)

   Confirm each component's status badge updates to match the derived
   result, and that reasoning is visible in "View test history".

7. **Check market data** on the SSD - confirm it shows the historical
   range from step 2 (or an honest "no data yet" if you skipped it).

8. **Get an ML prediction** on the SSD and RAM (both working) - confirm
   ranges, confidence, and the demo-data disclaimer appear.

9. **Generate a valuation report** for the whole device - confirm:
   - SSD and RAM show `ml_prediction` basis with real numbers
   - Battery shows `scrap_estimate` basis (since it's NOT_WORKING)
   - Total recoverable value = sum of all of the above
   - Overall confidence reflects the weakest link
   - Demo-data warning is shown

10. **Check "Why this price?"** on the SSD - confirm both the
    model-derived feature importances AND the general plain-language
    explanation appear, clearly separated.

11. **Generate a second valuation** after changing something (e.g.
    re-testing the battery as working) - confirm the Valuation History
    chart now shows 2 points and a line between them.

12. **Ask the chatbot** (if configured) "What's my SSD worth and why?"
    - confirm the answer references the actual numbers from step 8-9,
    not invented ones, and mentions the demo-data caveat.

13. **List the SSD for sale** on the marketplace. Log in as the second
    user, browse `/marketplace`, filter by componentType=ssd, open the
    listing - confirm you see the real test evidence (from step 6), not
    just a badge.

14. **Check recycling guidance** on the battery (NOT_WORKING) - confirm
    it's marked hazardous with safety-conscious guidance (no unsafe
    instructions).

15. **As admin**, check `/admin`:
    - Statistics tab shows non-zero counts matching what you just did
    - Users tab shows both accounts with correct roles
    - Audit Log tab shows entries for the price records you added and
      any CSV import from step 2

## What this proves

- Every phase's output feeds correctly into the next (CV suggestions ->
  real components -> real tests -> real-evidence-backed status -> ML
  predictions using that status -> valuation combining ML + scrap +
  market data -> chatbot grounded in that valuation -> marketplace
  showing that same evidence -> recycling guidance for what's not
  reusable -> admin visibility into all of it).
- No step silently fabricates data - every "unavailable" or "demo" case
  surfaces honestly instead of being hidden.
- Ownership scoping holds throughout: the second user can browse the
  marketplace but never sees the first user's raw device/component data
  directly.

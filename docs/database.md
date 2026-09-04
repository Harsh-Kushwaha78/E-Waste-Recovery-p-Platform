# Database Entity Overview

Database: MongoDB (via Mongoose in the backend).

## Collections (all implemented as of Phase 14)

| Collection      | Phase | Purpose                                            |
|------------------|-------|-----------------------------------------------------|
| User             | 1     | Accounts, auth, roles (user/admin)                  |
| Device           | 2     | A non-working device the user added                 |
| Component        | 2     | A part belonging to a Device (RAM, SSD, etc.)        |
| ComponentTest     | 3     | Functional test result + evidence for a Component    |
| PriceRecord       | 4     | Admin-entered / CSV-imported historical price data    |
| Prediction        | 5     | Output of the ML price model for a Component (incl. feature importances, Phase 9) |
| MarketRecord      | 7     | Schema ready for live market data - currently unused since no live provider is configured (see `marketDataService.js`) |
| Valuation         | 8/10  | Combined recoverable value snapshot for a Device, kept as history |
| Message           | 11    | Chatbot conversation turns                            |
| Listing           | 12    | Marketplace listing for a sellable Component           |
| RecyclingOption    | 13    | Admin-entered local recycler/drop-off info             |
| AuditLog          | 14    | System event log for traceability                     |

Not implemented as separate collections (folded into existing ones or
file-based instead, since the MVP didn't need the extra complexity):
- **Verification**: handled by `ComponentTest.derivedStatus` directly on
  the Component, rather than a separate collection - one component has
  one current trust status, backed by its test history.
- **DatasetVersion / ModelVersion**: handled as JSON metadata files
  (`ml-service/models/model_metadata_*.json`) rather than DB documents,
  since they describe files on disk (the trained model itself), not
  relational data. Each file already carries name, version, training
  date, dataset used, and metrics.

## Relationships

```
User 1---* Device 1---* Component 1---* ComponentTest
                                  |
                                  1---* Prediction
                                  |
                                  0..1---* Listing (via seller + component)
                                  |
                                  0..1 active Listing at a time

Device 1---* Valuation (history, sorted by createdAt)
Device 1---* Message (chat history)

User (admin) 1---* PriceRecord
User (admin) 1---* RecyclingOption
User (any)   1---* AuditLog (as actor)
```

Ownership scoping is enforced at the database query level everywhere
(`owner: req.user._id` or via the parent Device's owner) - see
`docs/api.md` for the specific pattern used on each route.

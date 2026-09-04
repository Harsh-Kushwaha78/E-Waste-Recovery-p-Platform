// backend/src/services/marketDataService.js
//
// Architecture (master prompt section 18):
//   MARKET SOURCES/API -> MARKET DATA SERVICE -> NORMALIZATION -> DATABASE -> VALUATION
//
// No live market API/provider is configured in this project (would need
// a real subscription/API key and to respect that provider's terms of
// service). getLiveMarketData() is the real integration point: honestly
// returns "unavailable" right now. Adding a real provider later only
// means filling in this one function.
//
// When live data is unavailable, callers fall back to PriceRecord
// (Phase 4, admin-entered/CSV-imported data) - the master prompt's
// required fallback (section 18).

const PriceRecord = require("../models/PriceRecord");

async function getLiveMarketData(/* componentType, brand */) {
  return {
    available: false,
    note: "No live market data provider is configured for this deployment.",
  };
}

// Pure function - no DB access - so it's independently unit-testable.
function computeStats(records) {
  if (records.length === 0) {
    return {
      available: false,
      note: "No historical price data available for this component yet.",
    };
  }

  const prices = records.map((r) => r.price);
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const lastUpdated = records[0].observedDate; // caller must pass sorted-desc records

  return {
    available: true,
    sampleSize: records.length,
    average: Math.round(avg),
    min,
    max,
    lastUpdated,
    sources: [...new Set(records.map((r) => r.source))],
  };
}

async function getHistoricalStats(componentType, brand) {
  const query = { componentType };
  if (brand) query.brand = new RegExp(brand, "i");

  const records = await PriceRecord.find(query).sort({ observedDate: -1 });
  return computeStats(records);
}

async function getMarketData(componentType, brand) {
  const live = await getLiveMarketData(componentType, brand);

  if (live.available) {
    return { usedSource: "live", live, historical: null };
  }

  const historical = await getHistoricalStats(componentType, brand);
  return { usedSource: "historical", live, historical };
}

module.exports = { getMarketData, getLiveMarketData, getHistoricalStats, computeStats };

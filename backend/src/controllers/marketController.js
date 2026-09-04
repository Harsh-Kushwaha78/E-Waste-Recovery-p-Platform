// backend/src/controllers/marketController.js
const { getMarketData } = require("../services/marketDataService");
const Component = require("../models/Component");

// GET /api/market?componentType=ssd&brand=Samsung
async function getMarket(req, res, next) {
  try {
    const { componentType, brand } = req.query;

    if (!componentType) {
      return res.status(400).json({ status: "error", message: "componentType query param is required." });
    }
    if (!Component.TYPES.includes(componentType)) {
      return res.status(400).json({
        status: "error",
        message: `componentType must be one of: ${Component.TYPES.join(", ")}`,
      });
    }

    const data = await getMarketData(componentType, brand);
    res.status(200).json({ status: "ok", componentType, brand: brand || null, ...data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMarket };

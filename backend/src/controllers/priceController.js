// backend/src/controllers/priceController.js
//
// All write routes here are admin-only (mounted with adminOnly
// middleware). Regular users can only view price data (GET), not
// create/edit/import it - price data is admin-curated, per the master
// prompt's admin price management section.

const mongoose = require("mongoose");
const PriceRecord = require("../models/PriceRecord");
const Component = require("../models/Component");
const { parsePriceCsv } = require("../utils/parsePriceCsv");
const { logEvent } = require("../utils/auditLog");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/prices?componentType=ssd
async function listPrices(req, res, next) {
  try {
    const { componentType, brand, limit } = req.query;
    const query = {};
    if (componentType) query.componentType = componentType;
    if (brand) query.brand = new RegExp(brand, "i");

    const records = await PriceRecord.find(query)
      .sort({ observedDate: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.status(200).json({ status: "ok", count: records.length, records });
  } catch (err) {
    next(err);
  }
}

// POST /api/prices  (admin only)
async function createPrice(req, res, next) {
  try {
    const {
      componentType,
      brand,
      model,
      capacity,
      condition,
      workingStatus,
      price,
      currency,
      source,
      sourceUrl,
      observedDate,
      notes,
    } = req.body;

    if (!componentType || !Component.TYPES.includes(componentType)) {
      return res.status(400).json({
        status: "error",
        message: `componentType is required and must be one of: ${Component.TYPES.join(", ")}`,
      });
    }
    if (price === undefined || price === null || Number(price) < 0) {
      return res.status(400).json({
        status: "error",
        message: "price is required and must be a non-negative number.",
      });
    }
    if (!source) {
      return res.status(400).json({ status: "error", message: "source is required." });
    }
    if (!observedDate || isNaN(new Date(observedDate).getTime())) {
      return res.status(400).json({
        status: "error",
        message: "observedDate is required and must be a valid date.",
      });
    }

    const record = await PriceRecord.create({
      componentType,
      brand,
      model,
      capacity,
      condition,
      workingStatus,
      price,
      currency,
      source,
      sourceUrl,
      observedDate,
      notes,
      enteredBy: req.user._id,
    });

    await logEvent(req.user, "price_record.created", {
      targetType: "PriceRecord",
      targetId: record._id,
      metadata: { componentType, price, source },
    });

    res.status(201).json({ status: "ok", record });
  } catch (err) {
    next(err);
  }
}

// PUT /api/prices/:id  (admin only)
async function updatePrice(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid price record id." });
    }

    const allowedFields = [
      "componentType",
      "brand",
      "model",
      "capacity",
      "condition",
      "workingStatus",
      "price",
      "currency",
      "source",
      "sourceUrl",
      "observedDate",
      "notes",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const record = await PriceRecord.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({ status: "error", message: "Price record not found." });
    }

    res.status(200).json({ status: "ok", record });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/prices/:id  (admin only)
async function deletePrice(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ status: "error", message: "Invalid price record id." });
    }

    const record = await PriceRecord.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({ status: "error", message: "Price record not found." });
    }

    await logEvent(req.user, "price_record.deleted", {
      targetType: "PriceRecord",
      targetId: record._id,
    });

    res.status(200).json({ status: "ok", message: "Price record deleted." });
  } catch (err) {
    next(err);
  }
}

// POST /api/prices/import  (admin only, multipart/form-data with a "file" field)
async function importCsv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded. Send a CSV file as multipart/form-data field 'file'.",
      });
    }

    const csvText = req.file.buffer.toString("utf-8");
    const { validRows, errors } = parsePriceCsv(csvText);

    if (validRows.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid rows found in the CSV.",
        errors,
      });
    }

    const importBatch = `${req.file.originalname}-${new Date().toISOString()}`;
    const docs = validRows.map((row) => ({
      ...row,
      enteredBy: req.user._id,
      importBatch,
    }));

    const inserted = await PriceRecord.insertMany(docs, { ordered: false });

    await logEvent(req.user, "price_records.csv_imported", {
      targetType: "PriceRecord",
      metadata: { importBatch, insertedCount: inserted.length, rejectedCount: errors.length },
    });

    res.status(201).json({
      status: "ok",
      message: `Imported ${inserted.length} of ${validRows.length + errors.length} rows.`,
      insertedCount: inserted.length,
      rejectedCount: errors.length,
      errors,
      importBatch,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPrices, createPrice, updatePrice, deletePrice, importCsv };

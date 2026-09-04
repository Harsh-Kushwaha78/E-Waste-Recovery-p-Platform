// backend/src/utils/parsePriceCsv.js
//
// Pure function: given raw CSV text, returns { validRows, errors }.
// No database access here - fully unit-testable on its own, and it's
// where "do not fabricate real-world training data" (master prompt
// section 14) gets enforced structurally: every row must have real
// required fields or it's rejected with a specific reason, never
// silently defaulted.
//
// Expected CSV columns (header row required, order doesn't matter):
//   componentType, brand, model, capacity, condition, workingStatus,
//   price, currency, source, sourceUrl, observedDate, notes
//
// Required: componentType, price, source, observedDate
// Optional: everything else

const { parse } = require("csv-parse/sync");
const Component = require("../models/Component");

const VALID_CONDITIONS = ["excellent", "good", "fair", "poor", "unknown"];
const VALID_WORKING_STATUSES = [
  "VERIFIED_WORKING",
  "LIKELY_WORKING",
  "NOT_WORKING",
  "NOT_TESTED",
];

function parsePriceCsv(csvText) {
  const errors = [];
  const validRows = [];

  let records;
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    return {
      validRows: [],
      errors: [{ row: null, message: `Could not parse CSV: ${err.message}` }],
    };
  }

  if (records.length === 0) {
    return {
      validRows: [],
      errors: [{ row: null, message: "CSV has no data rows." }],
    };
  }

  records.forEach((raw, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header row
    const rowErrors = [];

    const componentType = (raw.componentType || "").trim();
    if (!componentType) {
      rowErrors.push("componentType is required");
    } else if (!Component.TYPES.includes(componentType)) {
      rowErrors.push(
        `componentType "${componentType}" is not valid (must be one of: ${Component.TYPES.join(", ")})`
      );
    }

    const priceRaw = (raw.price || "").trim();
    const price = Number(priceRaw);
    if (!priceRaw) {
      rowErrors.push("price is required");
    } else if (Number.isNaN(price) || price < 0) {
      rowErrors.push(`price "${priceRaw}" is not a valid non-negative number`);
    }

    const source = (raw.source || "").trim();
    if (!source) {
      rowErrors.push("source is required");
    }

    const observedDateRaw = (raw.observedDate || "").trim();
    const observedDate = observedDateRaw ? new Date(observedDateRaw) : null;
    if (!observedDateRaw) {
      rowErrors.push("observedDate is required");
    } else if (isNaN(observedDate?.getTime())) {
      rowErrors.push(`observedDate "${observedDateRaw}" is not a valid date`);
    }

    const condition = (raw.condition || "unknown").trim();
    if (condition && !VALID_CONDITIONS.includes(condition)) {
      rowErrors.push(
        `condition "${condition}" is not valid (must be one of: ${VALID_CONDITIONS.join(", ")})`
      );
    }

    const workingStatus = (raw.workingStatus || "NOT_TESTED").trim();
    if (workingStatus && !VALID_WORKING_STATUSES.includes(workingStatus)) {
      rowErrors.push(
        `workingStatus "${workingStatus}" is not valid (must be one of: ${VALID_WORKING_STATUSES.join(", ")})`
      );
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join("; ") });
      return;
    }

    validRows.push({
      componentType,
      brand: raw.brand || undefined,
      model: raw.model || undefined,
      capacity: raw.capacity || undefined,
      condition,
      workingStatus,
      price,
      currency: raw.currency || "INR",
      source,
      sourceUrl: raw.sourceUrl || undefined,
      observedDate,
      notes: raw.notes || undefined,
    });
  });

  return { validRows, errors };
}

module.exports = { parsePriceCsv };

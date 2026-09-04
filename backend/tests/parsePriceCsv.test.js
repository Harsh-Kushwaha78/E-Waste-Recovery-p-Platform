// backend/tests/parsePriceCsv.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { parsePriceCsv } = require("../src/utils/parsePriceCsv");

test("valid CSV parses all rows with no errors", () => {
  const csv = `componentType,brand,price,source,observedDate
ssd,Samsung,1900,OLX listing,2026-08-15
ram,Corsair,1200,Admin estimate,2026-08-10`;
  const { validRows, errors } = parsePriceCsv(csv);
  assert.equal(validRows.length, 2);
  assert.equal(errors.length, 0);
  assert.equal(validRows[0].componentType, "ssd");
  assert.equal(validRows[0].price, 1900);
});

test("invalid componentType is rejected with a specific reason", () => {
  const csv = `componentType,price,source,observedDate
not_a_real_type,1900,OLX,2026-08-15`;
  const { validRows, errors } = parsePriceCsv(csv);
  assert.equal(validRows.length, 0);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /componentType/);
});

test("non-numeric price is rejected", () => {
  const csv = `componentType,price,source,observedDate
ssd,not_a_number,OLX,2026-08-15`;
  const { errors } = parsePriceCsv(csv);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /price/);
});

test("missing source is rejected", () => {
  const csv = `componentType,price,source,observedDate
ssd,1900,,2026-08-15`;
  const { errors } = parsePriceCsv(csv);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /source/);
});

test("invalid date is rejected", () => {
  const csv = `componentType,price,source,observedDate
ssd,1900,OLX,not_a_date`;
  const { errors } = parsePriceCsv(csv);
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /observedDate/);
});

test("one bad row does not block other valid rows in the same file", () => {
  const csv = `componentType,price,source,observedDate
ssd,1900,OLX,2026-08-15
bad_type,1200,Admin,2026-08-10
ram,800,OLX,2026-08-01`;
  const { validRows, errors } = parsePriceCsv(csv);
  assert.equal(validRows.length, 2);
  assert.equal(errors.length, 1);
  assert.equal(errors[0].row, 3);
});

test("empty CSV produces a clear error, not a crash", () => {
  const { validRows, errors } = parsePriceCsv("componentType,price,source,observedDate\n");
  assert.equal(validRows.length, 0);
  assert.equal(errors.length, 1);
});

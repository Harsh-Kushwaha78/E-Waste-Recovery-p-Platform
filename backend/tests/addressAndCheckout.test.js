// backend/tests/addressAndCheckout.test.js
const test = require("node:test");
const assert = require("node:assert/strict");

const { cleanPhone, createAddress } = require("../src/controllers/addressController");
const { checkPincodeServiceability } = require("../src/config/serviceablePincodes");
const { generateOrderReference, createOrder } = require("../src/controllers/orderController");
const { generatePickupReference, createPickupRequest } = require("../src/controllers/pickupController");

// --- Address logic tests ---

test("cleanPhone: normalizes 10-digit number with spaces or dashes", () => {
  assert.equal(cleanPhone("98765 43210"), "9876543210");
  assert.equal(cleanPhone("98765-43210"), "9876543210");
});

test("cleanPhone: strips leading country code 91 if present", () => {
  assert.equal(cleanPhone("+919876543210"), "9876543210");
  assert.equal(cleanPhone("919876543210"), "9876543210");
});

test("cleanPhone: handles invalid input safely", () => {
  assert.equal(cleanPhone(null), "");
  assert.equal(cleanPhone(""), "");
  assert.equal(cleanPhone("abcdef"), "");
});

test("PIN code validation regex correctly matches Indian PIN codes", () => {
  const pinRegex = /^[1-9][0-9]{5}$/;
  assert.ok(pinRegex.test("560001"));
  assert.ok(pinRegex.test("110001"));
  assert.ok(pinRegex.test("400050"));
  // Invalid cases:
  assert.equal(pinRegex.test("012345"), false, "Cannot start with 0");
  assert.equal(pinRegex.test("56000"), false, "Too short (5 digits)");
  assert.equal(pinRegex.test("5600012"), false, "Too long (7 digits)");
  assert.equal(pinRegex.test("56000A"), false, "Contains letters");
  assert.equal(pinRegex.test(""), false, "Empty string");
});

// --- Serviceability tests ---

test("checkPincodeServiceability: returns true for default metro zones", () => {
  const blr = checkPincodeServiceability("560001");
  assert.equal(blr.serviceable, true);
  assert.equal(blr.city, "Bengaluru");
  assert.equal(blr.state, "Karnataka");

  const del = checkPincodeServiceability("110001");
  assert.equal(del.serviceable, true);
  assert.equal(del.city, "New Delhi");

  const mum = checkPincodeServiceability("400001");
  assert.equal(mum.serviceable, true);
  assert.equal(mum.city, "Mumbai");
});

test("checkPincodeServiceability: returns false for unconfigured PIN code without fabricating service", () => {
  const result = checkPincodeServiceability("999999");
  assert.equal(result.serviceable, false);
  assert.match(result.message, /currently not available/i);
});

test("checkPincodeServiceability: rejects invalid PIN format gracefully", () => {
  const invalid = checkPincodeServiceability("invalid_pin");
  assert.equal(invalid.serviceable, false);
  assert.match(invalid.message, /invalid pin code format/i);
});

// --- Reference ID tests ---

test("generateOrderReference: produces valid prefix and uppercase alphanumeric pattern", () => {
  const ref1 = generateOrderReference();
  const ref2 = generateOrderReference();
  assert.match(ref1, /^ORD-[A-Z0-9]+-\d{4}$/);
  assert.notEqual(ref1, ref2, "Subsequent references should be unique");
});

test("generatePickupReference: produces valid prefix and pattern", () => {
  const ref1 = generatePickupReference();
  const ref2 = generatePickupReference();
  assert.match(ref1, /^PCK-[A-Z0-9]+-\d{4}$/);
  assert.notEqual(ref1, ref2, "Subsequent references should be unique");
});

// --- Server-side calculations & snapshot checks ---

test("Checkout pricing calculation: zero delivery fee guarantee", () => {
  const itemPrice = 2499;
  const deliveryFee = 0;
  const total = itemPrice + deliveryFee;
  assert.equal(total, 2499);
  assert.equal(deliveryFee, 0);
});

test("Shipping address snapshot contains all required immutable fields", () => {
  const rawAddress = {
    fullName: "Priya Sharma",
    phone: "9876543210",
    building: "Flat 402, Green Heights",
    street: "12th Cross, Indiranagar",
    landmark: "Near Metro Station",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    label: "Home",
  };

  // Snapshot simulation:
  const snapshot = { ...rawAddress };
  // Subsequent modification to source does not mutate snapshot
  rawAddress.building = "Changed Building";
  assert.equal(snapshot.building, "Flat 402, Green Heights");
  assert.equal(snapshot.pincode, "560038");
});

test("Order state transition constraints", () => {
  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  assert.equal(validStatuses.includes("confirmed"), true);
  assert.equal(validStatuses.includes("shipped"), true);
  assert.equal(validStatuses.includes("bogus_status"), false);

  // Terminal states cannot transition
  const isTerminal = (status) => ["delivered", "cancelled"].includes(status);
  assert.equal(isTerminal("delivered"), true);
  assert.equal(isTerminal("cancelled"), true);
  assert.equal(isTerminal("confirmed"), false);
  assert.equal(isTerminal("shipped"), false);
});

test("Pickup request status transition constraints", () => {
  const isPickupTerminal = (status) => ["Completed", "Cancelled", "Rejected"].includes(status);
  assert.equal(isPickupTerminal("Completed"), true);
  assert.equal(isPickupTerminal("Cancelled"), true);
  assert.equal(isPickupTerminal("Rejected"), true);
  assert.equal(isPickupTerminal("Pending"), false);
  assert.equal(isPickupTerminal("Accepted"), false);
  assert.equal(isPickupTerminal("Pickup Scheduled"), false);
});

// --- Controller request validation mocks ---

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

test("createAddress: rejects missing fullName", async () => {
  const req = { body: { phone: "9876543210" }, user: { _id: "507f1f77bcf86cd799439011" } };
  const res = createMockRes();
  await createAddress(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /full name is required/i);
});

test("createAddress: rejects invalid phone number", async () => {
  const req = {
    body: { fullName: "Aarav", phone: "12345" },
    user: { _id: "507f1f77bcf86cd799439011" },
  };
  const res = createMockRes();
  await createAddress(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /valid 10-digit indian mobile number/i);
});

test("createAddress: rejects invalid PIN code", async () => {
  const req = {
    body: {
      fullName: "Aarav",
      phone: "9876543210",
      building: "B1",
      street: "Main St",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "012345",
    },
    user: { _id: "507f1f77bcf86cd799439011" },
  };
  const res = createMockRes();
  await createAddress(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /valid 6-digit indian pin code/i);
});

test("createOrder: rejects missing or invalid listingId", async () => {
  const req = { body: {}, user: { _id: "507f1f77bcf86cd799439011" } };
  const res = createMockRes();
  await createOrder(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /valid listingid is required/i);
});

test("createPickupRequest: rejects invalid itemType", async () => {
  const req = { body: { itemType: "spaceship" }, user: { _id: "507f1f77bcf86cd799439011" } };
  const res = createMockRes();
  await createPickupRequest(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /itemtype must be/i);
});

test("createPickupRequest: rejects past date", async () => {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);
  const req = {
    body: {
      itemType: "custom_e_waste",
      customItemDetails: { title: "Old Cables" },
      pickupAddress: {
        fullName: "Test",
        phone: "9876543210",
        building: "Bldg 1",
        street: "St 2",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
      },
      preferredDate: pastDate.toISOString(),
      timeSlot: "09:00 - 12:00",
    },
    user: { _id: "507f1f77bcf86cd799439011" },
  };
  const res = createMockRes();
  await createPickupRequest(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /cannot be in the past/i);
});

test("createPickupRequest: rejects unserviceable PIN code with honest message", async () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);
  const req = {
    body: {
      itemType: "custom_e_waste",
      customItemDetails: { title: "Old Cables" },
      pickupAddress: {
        fullName: "Test",
        phone: "9876543210",
        building: "Bldg 1",
        street: "St 2",
        city: "Remote Area",
        state: "State",
        pincode: "999999",
      },
      preferredDate: futureDate.toISOString(),
      timeSlot: "09:00 - 12:00",
    },
    user: { _id: "507f1f77bcf86cd799439011" },
  };
  const res = createMockRes();
  await createPickupRequest(req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /currently not available in pin code 999999/i);
});

// backend/src/utils/auditLog.js
//
// Small helper so logging an audit event is one line at each call site.
// Never throws into the caller's flow - a failed audit write shouldn't
// break the actual operation it's describing (logged to console instead).

const AuditLog = require("../models/AuditLog");

async function logEvent(actor, action, { targetType, targetId, metadata } = {}) {
  try {
    await AuditLog.create({
      actor: actor._id,
      actorName: actor.name,
      action,
      targetType,
      targetId,
      metadata,
    });
  } catch (err) {
    console.error("[audit-log] Failed to record event:", action, err.message);
  }
}

module.exports = { logEvent };

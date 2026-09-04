// backend/src/controllers/chatController.js

const mongoose = require("mongoose");
const Device = require("../models/Device");
const Component = require("../models/Component");
const Valuation = require("../models/Valuation");
const Message = require("../models/Message");
const { askChatbot, isConfigured, GenAiUnavailableError } = require("../services/genaiService");
const { buildChatSystemPrompt } = require("../utils/buildChatSystemPrompt");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/chat/devices/:deviceId
async function sendMessage(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ status: "error", message: "message is required." });
    }

    if (!isConfigured()) {
      return res.status(503).json({
        status: "error",
        message:
          "GenAI chatbot is not configured for this deployment. Set GENAI_API_KEY in backend/.env to enable it. The rest of the app works fully without it.",
      });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const components = await Component.find({ device: deviceId });
    const valuation = await Valuation.findOne({ device: deviceId }).sort({ createdAt: -1 });

    const systemPrompt = buildChatSystemPrompt({ device, components, valuation });

    const history = await Message.find({ device: deviceId, owner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    const orderedHistory = history.reverse();

    const conversationMessages = [
      ...orderedHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    let replyText;
    try {
      replyText = await askChatbot(systemPrompt, conversationMessages);
    } catch (err) {
      if (err instanceof GenAiUnavailableError) {
        return res.status(503).json({ status: "error", message: err.message });
      }
      return res.status(err.status || 500).json({
        status: "error",
        message: err.message,
        details: err.providerError,
      });
    }

    await Message.create({ device: deviceId, owner: req.user._id, role: "user", content: message });
    const assistantMessage = await Message.create({
      device: deviceId,
      owner: req.user._id,
      role: "assistant",
      content: replyText,
    });

    res.status(201).json({ status: "ok", message: assistantMessage });
  } catch (err) {
    next(err);
  }
}

// GET /api/chat/devices/:deviceId
async function getHistory(req, res, next) {
  try {
    const { deviceId } = req.params;
    if (!isValidId(deviceId)) {
      return res.status(400).json({ status: "error", message: "Invalid device id." });
    }

    const device = await Device.findOne({ _id: deviceId, owner: req.user._id });
    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not found." });
    }

    const messages = await Message.find({ device: deviceId, owner: req.user._id }).sort({
      createdAt: 1,
    });

    res.status(200).json({ status: "ok", count: messages.length, messages, configured: isConfigured() });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, getHistory };

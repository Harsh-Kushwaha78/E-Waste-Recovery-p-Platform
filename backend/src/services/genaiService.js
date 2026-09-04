// backend/src/services/genaiService.js
//
// Pluggable LLM integration. Default provider is the Anthropic API.
// Requires a real API key via GENAI_API_KEY in backend/.env - if not
// set, this is honestly reported as unavailable rather than faking a
// response.
//
// The chatbot must not invent current market prices - the system prompt
// built in chatController.js explicitly instructs the model to
// distinguish FACT / PREDICTION / ESTIMATE / UNKNOWN and to rely only on
// the structured app data it's given, never outside "knowledge" of
// prices.

const GENAI_API_KEY = process.env.GENAI_API_KEY;
const GENAI_MODEL = process.env.GENAI_MODEL || "claude-3-5-haiku-20241022";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

class GenAiUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "GenAiUnavailableError";
  }
}

function isConfigured() {
  return Boolean(GENAI_API_KEY);
}

async function askChatbot(systemPrompt, conversationMessages) {
  if (!isConfigured()) {
    throw new GenAiUnavailableError(
      "GenAI chatbot is not configured. Set GENAI_API_KEY in backend/.env to enable it."
    );
  }

  let response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": GENAI_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: GENAI_MODEL,
        max_tokens: 600,
        system: systemPrompt,
        messages: conversationMessages,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    throw new GenAiUnavailableError(`GenAI provider unreachable: ${err.message}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new GenAiUnavailableError("GenAI provider returned an unexpected response.");
  }

  if (!response.ok) {
    const err = new Error(data.error?.message || "GenAI provider returned an error.");
    err.status = response.status;
    err.providerError = data;
    throw err;
  }

  const textBlock = data.content?.find((c) => c.type === "text");
  if (!textBlock) {
    throw new Error("GenAI provider response contained no text.");
  }

  return textBlock.text;
}

module.exports = { askChatbot, isConfigured, GenAiUnavailableError };

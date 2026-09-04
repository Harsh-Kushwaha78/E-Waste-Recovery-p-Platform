// backend/src/utils/buildChatSystemPrompt.js
//
// Pure function: given structured device/component/valuation data,
// builds the system prompt for the chatbot. Explicitly instructs the
// model to use only the structured data given (never invent current
// prices) and to distinguish FACT / PREDICTION / ESTIMATE / UNKNOWN.

function buildChatSystemPrompt({ device, components, valuation }) {
  const deviceSummary = `Device: ${device.name} (${device.category}${device.brand ? `, ${device.brand}` : ""}${device.model ? ` ${device.model}` : ""}), age: ${device.ageYears ?? "unknown"} years.`;

  const componentLines = components.map((c) => {
    const parts = [
      `- ${c.type}`,
      c.brand ? `brand: ${c.brand}` : null,
      `status: ${c.workingStatus}`,
      c.health != null ? `health: ${c.health}%` : null,
      `condition: ${c.condition}`,
    ].filter(Boolean);
    return parts.join(", ");
  });

  let valuationSummary = "No valuation has been generated for this device yet.";
  if (valuation) {
    const lines = valuation.componentValuations.map((cv) => {
      const value = cv.valueBasis === "scrap_estimate" ? cv.scrapValue : cv.recoverableValue;
      return `  - ${cv.componentType}: ₹${value} (basis: ${cv.valueBasis}${cv.confidence ? `, confidence: ${cv.confidence}` : ""})`;
    });
    valuationSummary = [
      `Total recoverable value: ₹${valuation.totalRecoverableValue} (overall confidence: ${valuation.overallConfidence})`,
      ...lines,
      valuation.hasDemoData
        ? "NOTE: some of these figures come from a model trained on DEMO/SYNTHETIC data, not real market prices. You must mention this if discussing those figures."
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return `You are a helpful assistant for an e-waste recovery and valuation platform. You help the user understand their device, its components, test results, and recoverable value.

STRICT RULES YOU MUST FOLLOW:
1. Only use the data given below. Never invent or guess a current market price, a specific product's price, or any fact not present in this context.
2. Every claim you make should be clearly one of: FACT (directly stated in the data below), PREDICTION (an ML model's output, always mention if it's demo/synthetic data), ESTIMATE (a rule-based estimate, e.g. scrap value), or UNKNOWN (not available in the data - say so plainly instead of guessing).
3. If asked about current/live market prices and none are available in the data, say so plainly - do not fill the gap with your general knowledge of typical prices.
4. Keep answers concise and practical (a few sentences, not an essay) unless the user asks for detail.
5. You may explain recycling/disposal/reuse guidance in general terms, but do not give unsafe instructions (e.g. do not tell users to open batteries or handle hazardous materials unsafely).

DEVICE DATA:
${deviceSummary}

COMPONENTS:
${componentLines.length > 0 ? componentLines.join("\n") : "No components recorded yet."}

VALUATION:
${valuationSummary}`;
}

module.exports = { buildChatSystemPrompt };

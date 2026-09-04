// backend/src/utils/classifyForRecycling.js
//
// Rule-based classification (not AI/ML) mapping component types to a
// disposal category and general, SAFE guidance. Never gives unsafe
// instructions (e.g. never tells users to open/puncture/disassemble
// batteries or other hazardous components themselves).

const CLASSIFICATIONS = {
  battery: {
    category: "hazardous",
    hazardous: true,
    guidance: [
      "Do not puncture, crush, or open the battery yourself - this can be dangerous.",
      "Do not dispose of it in regular household trash.",
      "Take it to a certified e-waste or battery collection point.",
      "If swelling, leaking, or damaged, keep it away from heat and handle minimally until drop-off.",
    ],
  },
  motherboard: {
    category: "e_waste_recyclable",
    hazardous: false,
    guidance: [
      "Contains recoverable metals (copper, gold traces) - drop off at a certified e-waste recycler rather than regular trash.",
      "Do not attempt to burn or extract metals yourself.",
    ],
  },
  gpu: {
    category: "e_waste_recyclable",
    hazardous: false,
    guidance: [
      "Often has resale value even in poor condition - check the marketplace before recycling.",
      "If not reusable, recycle through a certified e-waste facility.",
    ],
  },
  ram: {
    category: "e_waste_recyclable",
    hazardous: false,
    guidance: ["Small and easily recyclable - drop off with other e-waste, don't put in general trash."],
  },
  ssd: {
    category: "e_waste_recyclable",
    hazardous: false,
    guidance: [
      "If it held sensitive data, consider secure data destruction before disposal or resale.",
      "Recycle through a certified e-waste facility if not reusable.",
    ],
  },
  hdd: {
    category: "e_waste_recyclable",
    hazardous: false,
    guidance: [
      "If it held sensitive data, consider secure data destruction (e.g. degaussing or physical destruction by a professional service) before disposal.",
      "Contains recoverable metals - recycle through e-waste channels, not general trash.",
    ],
  },
  display: {
    category: "e_waste_recyclable",
    hazardous: true,
    guidance: [
      "Older displays may contain small amounts of mercury or other regulated materials - do not break the screen.",
      "Take to a certified e-waste recycler.",
    ],
  },
  cooling_fan: { category: "e_waste_recyclable", hazardous: false, guidance: ["Recycle with general e-waste."] },
  wifi_card: { category: "e_waste_recyclable", hazardous: false, guidance: ["Recycle with general e-waste."] },
  charger: {
    category: "e_waste_recyclable",
    hazardous: false,
    guidance: ["Recycle with general e-waste - do not attempt to open or repair a damaged charger yourself."],
  },
  keyboard: { category: "general_recyclable", hazardous: false, guidance: ["Recycle with general e-waste."] },
  camera: { category: "general_recyclable", hazardous: false, guidance: ["Recycle with general e-waste."] },
  speaker: { category: "general_recyclable", hazardous: false, guidance: ["Recycle with general e-waste."] },
  other: {
    category: "general_recyclable",
    hazardous: false,
    guidance: ["Take to a certified e-waste recycler rather than general trash."],
  },
};

function classifyForRecycling(componentType) {
  return CLASSIFICATIONS[componentType] || CLASSIFICATIONS.other;
}

module.exports = { classifyForRecycling };

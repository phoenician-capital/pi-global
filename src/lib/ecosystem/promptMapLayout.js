/**
 * Spatial layout for the AI & calls constellation.
 * Positions are authored from dossier nodeIds — never invent products.
 */

/** @typedef {{ x: number, y: number, r: number }} Spot */

/** Fixed constellation anchors (world coords). */
export const promptMapWorld = { w: 1400, h: 920, cx: 700, cy: 460 };

/**
 * Product anchors — clustered by domain, sized later by call volume.
 * @type {Record<string, { x: number, y: number, ring: number }>}
 */
export const productAnchors = {
  // Screener — own box (left)
  screen: { x: 200, y: 360, ring: 0 },
  linker: { x: 120, y: 500, ring: 1 },
  // Research hub — center (incl. Earnings Tracker)
  "pi-net": { x: 560, y: 360, ring: 0 },
  "pi-py": { x: 700, y: 280, ring: 0 },
  "pi-fe": { x: 480, y: 440, ring: 1 },
  earnings: { x: 420, y: 240, ring: 0 },
  // Portfolio — right
  "pm-serve": { x: 980, y: 300, ring: 0 },
  "pm-fe": { x: 1120, y: 360, ring: 1 },
  ep: { x: 1040, y: 440, ring: 0 },
  // Investors — bottom
  "portal-api": { x: 700, y: 700, ring: 0 },
  "portal-web": { x: 560, y: 760, ring: 1 },
  "portal-mobile": { x: 840, y: 760, ring: 1 },
  // Side tools — Factsheet + Mail only
  factsheet: { x: 280, y: 820, ring: 1 },
  "mail-sender": { x: 400, y: 860, ring: 1 },
};

/**
 * Shared model-provider hubs (visual only — derived from model strings).
 * @type {Record<string, { x: number, y: number, label: string, match: RegExp }>}
 */
export const providerHubs = {
  claude: { x: 700, y: 380, label: "Claude", match: /claude|anthropic|sonnet|opus|haiku|fable|mythos/i },
  deepseek: { x: 820, y: 520, label: "DeepSeek", match: /deepseek/i },
  openai: { x: 580, y: 540, label: "OpenAI", match: /openai|gpt-|tts|\/v1\/audio/i },
  gemini: { x: 640, y: 280, label: "Gemini / Vertex", match: /gemini|vertex/i },
  other: { x: 780, y: 240, label: "Other models", match: /grok|perplexity|sonar|glm|zai|openrouter/i },
};

/**
 * @param {string} model
 * @returns {string[]}
 */
export function providersForModel(model) {
  /** @type {string[]} */
  const hits = [];
  for (const [id, hub] of Object.entries(providerHubs)) {
    if (hub.match.test(model)) hits.push(id);
  }
  return hits.length ? hits : [];
}

/**
 * Radius from call / model weight.
 * @param {{ callCount: number, modelCount: number, hasLlm: boolean }} p
 */
export function productRadius(p) {
  const base = p.hasLlm ? 28 : 16;
  return Math.min(52, base + Math.sqrt(p.callCount) * 3.2 + p.modelCount * 1.4);
}

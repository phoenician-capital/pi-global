import { businessFunctions } from "./domains.js";
import { nodeById } from "./nodes.js";

const world = { width: 1800, height: 1180 };

/**
 * Business-view layout: place each function's core nodes in a column constellation
 * so the view doesn't look identical to the architecture map.
 * @param {string} businessId
 * @returns {Map<string, { x: number, y: number }>}
 */
export function businessLayout(businessId) {
  const bf = businessFunctions.find((b) => b.id === businessId);
  /** @type {Map<string, { x: number, y: number }>} */
  const pos = new Map();
  if (!bf) return pos;

  const ids = bf.nodeIds.filter((id) => nodeById.has(id));
  const cx = world.width * 0.42;
  const cy = world.height * 0.48;
  const n = ids.length;
  if (n === 0) return pos;

  // Arc + slight vertical stack for readability
  ids.forEach((id, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = -Math.PI * 0.55 + t * Math.PI * 1.1;
    const radius = 220 + (i % 3) * 36;
    pos.set(id, {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.72,
    });
  });
  return pos;
}

/**
 * LOD band from map scale.
 * @param {number} scale
 * @returns {'far'|'mid'|'near'}
 */
export function lodBand(scale) {
  if (scale < 0.55) return "far";
  if (scale < 1.05) return "mid";
  return "near";
}

/**
 * Should this node render at current LOD?
 * @param {import('./types.js').EcoNode} n
 * @param {'far'|'mid'|'near'} band
 * @param {{ forceAll?: boolean, hideVendors?: boolean, hideInfra?: boolean }} opts
 */
export function nodeVisibleAtLod(n, band, opts = {}) {
  const { forceAll = false, hideVendors = false, hideInfra = false } = opts;
  if (forceAll) return true;
  if (hideVendors && n.domain === "vendor") return false;
  if (hideInfra && n.domain === "infra") return false;
  if (band === "far") {
    return (
      n.kind === "application" ||
      n.kind === "service" ||
      n.kind === "satellite" ||
      n.id === "pi-global"
    );
  }
  if (band === "mid") {
    return n.domain !== "vendor"; // apps + infra/DBs; vendors on near or when toggled
  }
  return true;
}

/** Core product node ids (DD / Risks / Screener / Portfolio) + supporting shell */
export const majorProductIds = [
  "pi-fe",
  "pi-net",
  "pi-py",
  "screen",
  "pm-serve",
  "pm-fe",
];

/** Side-project nodes — visible, but not the first story */
export const sideProductIds = [
  "earnings",
  "linker",
  "factsheet",
  "mail-sender",
  "portal-api",
  "portal-web",
  "portal-mobile",
];

export function majorProducts() {
  return majorProductIds.map((id) => nodeById.get(id)).filter(Boolean);
}

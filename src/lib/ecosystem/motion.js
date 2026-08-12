/**
 * Shared easing helpers for smooth camera / progressive reveals.
 */

/** @param {number} t 0..1 */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Animate numeric values with rAF.
 * @param {{ from: Record<string, number>, to: Record<string, number>, ms?: number, onframe: (vals: Record<string, number>) => void, ondone?: () => void }} opts
 */
export function animateValues(opts) {
  const { from, to, ms = 420, onframe, ondone } = opts;
  const reduced =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    onframe(to);
    ondone?.();
    return () => {};
  }

  const keys = Object.keys(to);
  const start = performance.now();
  let raf = 0;
  let cancelled = false;

  /** @param {number} now */
  function tick(now) {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / ms);
    const e = easeOutCubic(t);
    /** @type {Record<string, number>} */
    const vals = {};
    for (const k of keys) {
      const a = from[k] ?? 0;
      const b = to[k] ?? 0;
      vals[k] = a + (b - a) * e;
    }
    onframe(vals);
    if (t < 1) raf = requestAnimationFrame(tick);
    else ondone?.();
  }

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}

/**
 * BFS layers for progressive blast (excludes conceptual/fork).
 * @param {import('./types.js').EcoEdge[]} edges
 * @param {string} id
 * @param {'up'|'down'} dir
 * @param {number} [maxHops]
 */
export function blastLayers(edges, id, dir, maxHops = 8) {
  /** @type {{ nodeIds: string[], edgeIds: string[] }[]} */
  const layers = [];
  const seen = new Set([id]);
  /** @type {string[]} */
  let frontier = [id];

  for (let hop = 0; hop < maxHops && frontier.length; hop++) {
    /** @type {string[]} */
    const nextNodes = [];
    /** @type {string[]} */
    const nextEdges = [];
    for (const cur of frontier) {
      for (const e of edges) {
        if (e.type === "conceptual" || e.type === "fork") continue;
        let next = null;
        if (dir === "down" && e.source === cur) next = e.target;
        if (dir === "up" && e.target === cur) next = e.source;
        if (!next || seen.has(next)) continue;
        seen.add(next);
        nextNodes.push(next);
        nextEdges.push(e.id);
      }
    }
    if (!nextNodes.length) break;
    layers.push({ nodeIds: nextNodes, edgeIds: nextEdges });
    frontier = nextNodes;
  }
  return layers;
}

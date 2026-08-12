import { nodes, nodeById } from "./nodes.js";
import { edges, edgeById } from "./edges.js";
import { domains, businessFunctions, primaryBusinessIds } from "./domains.js";
import { journeys } from "./journeys.js";
import { searchIntelligence } from "./intelligence.js";
import { schedulers } from "./schedulers.js";
import { businessLayout, lodBand, majorProducts, nodeVisibleAtLod } from "./layout.js";

export {
  nodes,
  nodeById,
  edges,
  edgeById,
  domains,
  businessFunctions,
  primaryBusinessIds,
  journeys,
  schedulers,
};
export {
  callTaxonomy,
  dossierByNodeId,
  dossierFor,
  dossiers,
  intelligenceProjects,
  searchIntelligence,
} from "./intelligence.js";
export { guideFor, plainForKind, kindPlain, plainGuides } from "./plainGuide.js";
export { businessLayout, lodBand, majorProducts, nodeVisibleAtLod } from "./layout.js";
export { blastLayers, animateValues } from "./motion.js";

/** @typedef {'architecture'|'project'|'dependency'|'dataflow'|'infra'|'business'|'journey'|'impact'|'intelligence'|'prompts'} ViewId */

/** Full view catalog (palette / deep links). Main chrome only shows `primaryViews`. */
export const views = [
  { id: "architecture", name: "Map", hint: "See every product and how they connect", primary: true },
  { id: "intelligence", name: "Product guides", hint: "Plain English: what each product does", primary: true },
  { id: "prompts", name: "AI & calls", hint: "Every prompt job, model, and connection type", primary: true },
  { id: "journey", name: "Walkthroughs", hint: "Follow a real workflow step by step", primary: true },
  { id: "impact", name: "Impact", hint: "What breaks if this piece fails", primary: false },
  { id: "project", name: "Products only", hint: "Hide databases and vendors", primary: false },
  { id: "dependency", name: "Dependencies", hint: "What depends on what", primary: false },
  { id: "dataflow", name: "Data flow", hint: "Where information is stored and moved", primary: false },
  { id: "infra", name: "Infrastructure", hint: "Databases, files, hosts", primary: false },
  { id: "business", name: "By business", hint: "Group by business function", primary: false },
];

export const primaryViews = views.filter((v) => v.primary);

/** Core products newcomers should learn first (guides list order). */
export const coreGuideNodeIds = ["pi-fe", "pi-net", "pi-py", "screen", "pm-serve", "pm-fe"];

export const edgeTypeMeta = {
  http_api: { label: "HTTP API", color: "#2f6f8a" },
  iframe: { label: "iframe embed", color: "#8a6a2f" },
  embed_nav: { label: "Navigate / embed", color: "#6a5430" },
  webhook: { label: "Webhook", color: "#9a4d63" },
  callback: { label: "Callback", color: "#7a4d8a" },
  jwt_cookie: { label: "Auth / JWT", color: "#3d6b48" },
  s3_efs: { label: "Files / storage", color: "#4f6575" },
  database: { label: "Database", color: "#2f7a55" },
  realtime: { label: "Realtime", color: "#a06628" },
  vendor: { label: "Vendor", color: "#6a5640" },
  conceptual: { label: "Conceptual", color: "#6f685c" },
  fork: { label: "Fork", color: "#5a4a6b" },
  job: { label: "Job / schedule", color: "#3d6b8a" },
  proxy: { label: "Proxy", color: "#4a6578" },
};

/**
 * @param {ViewId} view
 * @param {{
 *   focusId?: string|null,
 *   journeyId?: string|null,
 *   businessId?: string|null,
 *   layerFilter?: string|null,
 *   includeNeighbors?: boolean,
 *   hideVendors?: boolean,
 * }} opts
 */
export function visibleSets(view, opts = {}) {
  const {
    focusId = null,
    journeyId = null,
    businessId = null,
    layerFilter = null,
    includeNeighbors = false,
    hideVendors = false,
  } = opts;
  /** @type {Set<string>} */
  let nodeIds = new Set(nodes.map((n) => n.id));
  /** @type {Set<string>} */
  let edgeIds = new Set(edges.map((e) => e.id));

  const projectKinds = new Set(["application", "service", "satellite"]);
  const infraKinds = new Set(["database", "infrastructure"]);
  const dataEdgeTypes = new Set(["database", "s3_efs", "callback", "job", "webhook", "realtime"]);

  if (view === "intelligence" || view === "prompts") {
    // map hidden — return empty for safety
    nodeIds = new Set();
    edgeIds = new Set();
  } else if (view === "project") {
    nodeIds = new Set(nodes.filter((n) => projectKinds.has(n.kind)).map((n) => n.id));
    edgeIds = new Set(
      edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => e.id),
    );
  } else if (view === "infra") {
    const keep = new Set(
      nodes.filter((n) => infraKinds.has(n.kind) || projectKinds.has(n.kind)).map((n) => n.id),
    );
    nodeIds = keep;
    edgeIds = new Set(
      edges
        .filter(
          (e) =>
            keep.has(e.source) &&
            keep.has(e.target) &&
            (dataEdgeTypes.has(e.type) || e.type === "http_api" || e.type === "s3_efs"),
        )
        .map((e) => e.id),
    );
  } else if (view === "dataflow") {
    edgeIds = new Set(edges.filter((e) => dataEdgeTypes.has(e.type)).map((e) => e.id));
    nodeIds = new Set();
    for (const e of edges) {
      if (edgeIds.has(e.id)) {
        nodeIds.add(e.source);
        nodeIds.add(e.target);
      }
    }
  } else if (view === "dependency") {
    edgeIds = new Set(
      edges.filter((e) => ["http_api", "vendor", "proxy", "job", "callback", "jwt_cookie"].includes(e.type)).map((e) => e.id),
    );
    nodeIds = new Set();
    for (const e of edges) {
      if (edgeIds.has(e.id)) {
        nodeIds.add(e.source);
        nodeIds.add(e.target);
      }
    }
  } else if (view === "business" && businessId) {
    const bf = businessFunctions.find((b) => b.id === businessId);
    nodeIds = new Set(bf?.nodeIds ?? []);
    if (includeNeighbors) {
      for (const e of edges) {
        if (nodeIds.has(e.source) || nodeIds.has(e.target)) {
          nodeIds.add(e.source);
          nodeIds.add(e.target);
        }
      }
    }
    edgeIds = new Set(
      edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => e.id),
    );
  } else if (view === "journey" && journeyId) {
    const j = journeys.find((x) => x.id === journeyId);
    nodeIds = new Set(j?.steps ?? []);
    edgeIds = new Set(j?.edgeIds ?? []);
  } else if (view === "impact") {
    if (!focusId) {
      nodeIds = new Set();
      edgeIds = new Set();
    } else {
      const down = blastRadius(focusId, "down");
      const up = blastRadius(focusId, "up");
      nodeIds = new Set([focusId, ...down.nodes, ...up.nodes]);
      edgeIds = new Set([...down.edges, ...up.edges]);
    }
  }

  // Keep AI model vendors even when "market vendors" are hidden — the map's AI story
  // (Claude / DeepSeek / Vertex / OpenAI) should stay readable without Show vendors.
  if (hideVendors && view !== "journey" && view !== "impact" && view !== "business") {
    const keepAiVendor = (id) => {
      const n = nodeById.get(id);
      if (!n || n.domain !== "vendor") return true;
      return n.tags?.includes("llm") || n.tags?.includes("rag");
    };
    nodeIds = new Set([...nodeIds].filter((id) => keepAiVendor(id)));
    edgeIds = new Set(
      edges.filter((e) => edgeIds.has(e.id) && nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => e.id),
    );
  }

  if (layerFilter) {
    nodeIds = new Set(
      [...nodeIds].filter((id) => {
        const n = nodeById.get(id);
        if (!n) return false;
        if (layerFilter === "frontend") return n.techLayer === "frontend" || n.techLayer === "client";
        if (layerFilter === "backend") return n.techLayer === "backend" || n.techLayer === "worker";
        if (layerFilter === "data") return n.techLayer === "data" || n.kind === "database" || n.kind === "infrastructure";
        if (layerFilter === "vendor") return n.techLayer === "vendor" || n.kind === "external";
        if (layerFilter === "api") return n.kind === "service" || (n.apis?.length ?? 0) > 0;
        return true;
      }),
    );
    edgeIds = new Set(
      edges.filter((e) => edgeIds.has(e.id) && nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => e.id),
    );
  }

  if (focusId && view !== "impact" && view !== "journey") {
    // dim handled in UI; keep all visible unless isolate
  }

  return { nodeIds, edgeIds };
}

/** @param {string} id @param {'up'|'down'|'both'} dir */
export function blastRadius(id, dir = "both") {
  /** @type {Set<string>} */
  const nodesOut = new Set();
  /** @type {Set<string>} */
  const edgesOut = new Set();
  /** @type {string[]} */
  const queue = [id];
  const seen = new Set([id]);

  while (queue.length) {
    const cur = queue.shift();
    for (const e of edges) {
      let next = null;
      if ((dir === "down" || dir === "both") && e.source === cur) next = e.target;
      if ((dir === "up" || dir === "both") && e.target === cur) next = e.source;
      if (!next || e.type === "conceptual" || e.type === "fork") continue;
      edgesOut.add(e.id);
      nodesOut.add(next);
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return { nodes: [...nodesOut], edges: [...edgesOut] };
}

/** Neighbors one hop */
export function neighbors(id) {
  const inbound = edges.filter((e) => e.target === id);
  const outbound = edges.filter((e) => e.source === id);
  return { inbound, outbound };
}

/** BFS shortest path (ignores conceptual/fork) */
export function shortestPath(from, to) {
  if (from === to) return { nodes: [from], edges: [] };
  /** @type {Map<string, { prev: string|null, edge: string|null }>} */
  const parent = new Map([[from, { prev: null, edge: null }]]);
  const q = [from];
  while (q.length) {
    const cur = q.shift();
    if (cur === to) break;
    for (const e of edges) {
      if (e.type === "conceptual" || e.type === "fork") continue;
      let next = null;
      if (e.source === cur) next = e.target;
      else if (e.bidirectional && e.target === cur) next = e.source;
      if (!next || parent.has(next)) continue;
      parent.set(next, { prev: cur, edge: e.id });
      q.push(next);
    }
  }
  if (!parent.has(to)) return null;
  /** @type {string[]} */
  const pathNodes = [];
  /** @type {string[]} */
  const pathEdges = [];
  let walk = to;
  while (walk) {
    pathNodes.unshift(walk);
    const p = parent.get(walk);
    if (p?.edge) pathEdges.unshift(p.edge);
    walk = p?.prev;
  }
  return { nodes: pathNodes, edges: pathEdges };
}

/**
 * Global search across nodes, edges, journeys, APIs, tags
 * @param {string} query
 */
export function searchAll(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  /** @type {{ kind: string, id: string, title: string, subtitle: string, score: number }[]} */
  const hits = [];

  for (const n of nodes) {
    const hay = [
      n.name,
      n.shortName,
      n.purpose,
      n.repo,
      n.runtime,
      ...(n.tags ?? []),
      ...(n.stack ?? []),
      ...(n.apis ?? []),
      ...(n.modules ?? []),
      ...(n.urls ?? []),
      n.domain,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (hay.includes(q)) {
      const score =
        n.shortName.toLowerCase() === q || n.id === q
          ? 100
          : n.name.toLowerCase().includes(q)
            ? 80
            : 50;
      hits.push({
        kind: "node",
        id: n.id,
        title: n.name,
        subtitle: `${n.shortName} · ${n.kind} · ${domains[n.domain]?.name ?? n.domain}`,
        score,
      });
    }
  }

  for (const e of edges) {
    const hay = [e.label, e.description, e.type, ...(e.endpoints ?? []), ...(e.evidence ?? []), ...(e.files ?? [])]
      .join(" ")
      .toLowerCase();
    if (hay.includes(q)) {
      const a = nodeById.get(e.source)?.shortName ?? e.source;
      const b = nodeById.get(e.target)?.shortName ?? e.target;
      hits.push({
        kind: "edge",
        id: e.id,
        title: `${a} → ${b}`,
        subtitle: `${e.label} · ${e.type} · ${e.confidence}`,
        score: 40,
      });
    }
    for (const ep of e.endpoints ?? []) {
      if (ep.toLowerCase().includes(q)) {
        hits.push({
          kind: "edge",
          id: e.id,
          title: ep,
          subtitle: `${nodeById.get(e.source)?.shortName ?? e.source} → ${nodeById.get(e.target)?.shortName ?? e.target}`,
          score: 70,
        });
      }
    }
  }

  for (const j of journeys) {
    const plain = (j.plainSteps ?? []).join(" ");
    if (`${j.name} ${j.description} ${j.business} ${plain}`.toLowerCase().includes(q)) {
      hits.push({
        kind: "journey",
        id: j.id,
        title: j.name,
        subtitle: j.description,
        score: 60,
      });
    }
  }

  for (const b of businessFunctions) {
    if (`${b.name} ${b.blurb} ${b.id}`.toLowerCase().includes(q)) {
      hits.push({
        kind: "business",
        id: b.id,
        title: b.name,
        subtitle: b.blurb,
        score: 55,
      });
    }
  }

  for (const s of schedulers) {
    if (`${s.name} ${s.purpose} ${s.cadence}`.toLowerCase().includes(q)) {
      hits.push({
        kind: "scheduler",
        id: s.ownerNodeId,
        title: s.name,
        subtitle: `${s.cadence} · ${s.purpose}`,
        score: 52,
      });
    }
  }

  for (const h of searchIntelligence(q)) {
    hits.push({
      kind: h.kind === "dossier" ? "node" : "intelligence",
      id: h.nodeId,
      title: h.title,
      subtitle: h.subtitle,
      score: h.score,
    });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 40);
}

export const searchSuggestions = [
  { label: "Generate a DD report", kind: "journey", id: "j-dd" },
  { label: "CapIQ Screen", kind: "node", id: "screen" },
  { label: "Investor Portal", kind: "node", id: "portal-api" },
  { label: "What uses Claude?", kind: "intelligence", id: "pi-py" },
  { label: "Auth islands (Portal vs PI)", kind: "node", id: "portal-api" },
  { label: "Strategy book → factsheet", kind: "journey", id: "j-strategy-book" },
];

export const meta = {
  account: "578736536410",
  region: "eu-north-1",
  org: "Phoenician Capital",
  title: "Phoenician Intelligence",
  subtitle: "Click a circle to learn what it does. Start with Diligence, Risks, Screener, or Portfolio.",
  confidenceNote:
    "Links shown here are confirmed in our documentation or source code. “Conceptual” twins and forks are labeled. We never invent connections.",
  nonLinks: [
    "Core products are Diligence, Risks, Screener, and Portfolio — Earnings and Cost are side projects",
    "Portfolio Manager gets Phoenician DD over HTTP to PI control — it does not mount PI EFS",
    "Earnings Tracker is not the portfolio earnings predictor",
    "Investor Portal login is not Phoenician Intelligence login",
    "Marketing factsheet site is not the live Portfolio API",
    "Four separate CapIQ tools: Screener, Linker, PI downloads, portfolio downloader",
    "Live e-sign is DocuSeal (DocuSign code exists but is not wired)",
    "Portal email is Resend (not Amazon SES)",
  ],
};

/** World bounds for SVG viewBox */
export const world = { width: 1800, height: 1180, pad: 40 };

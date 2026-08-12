import { nodes, nodeById } from "./nodes.js";
import { edges, edgeById } from "./edges.js";
import { domains, businessFunctions } from "./domains.js";
import { journeys } from "./journeys.js";

export { nodes, nodeById, edges, edgeById, domains, businessFunctions, journeys };

/** @typedef {'architecture'|'project'|'dependency'|'dataflow'|'infra'|'business'|'journey'|'impact'} ViewId */

export const views = [
  { id: "architecture", name: "Architecture", hint: "Full technical map" },
  { id: "project", name: "Projects", hint: "Applications & services only" },
  { id: "dependency", name: "Dependencies", hint: "Coupling & vendor chains" },
  { id: "dataflow", name: "Data flow", hint: "Storage & pipeline edges" },
  { id: "infra", name: "Infrastructure", hint: "DBs, S3, Redis, hosts" },
  { id: "business", name: "Business", hint: "Group by business function" },
  { id: "journey", name: "Request journey", hint: "Trace a workflow" },
  { id: "impact", name: "Impact analysis", hint: "Blast radius" },
];

export const edgeTypeMeta = {
  http_api: { label: "HTTP API", color: "#7eb8d4" },
  iframe: { label: "iframe embed", color: "#d4b87e" },
  embed_nav: { label: "Navigate / embed", color: "#c4a35a" },
  webhook: { label: "Webhook", color: "#d48fa3" },
  callback: { label: "Callback", color: "#c47eb8" },
  jwt_cookie: { label: "Auth / JWT", color: "#8fc496" },
  s3_efs: { label: "Object / FS", color: "#8aabb8" },
  database: { label: "Database", color: "#6ecf9a" },
  realtime: { label: "Realtime", color: "#e0a060" },
  vendor: { label: "Vendor", color: "#b8a08a" },
  conceptual: { label: "Conceptual", color: "#888899" },
  fork: { label: "Fork", color: "#9988aa" },
  job: { label: "Job / schedule", color: "#a0c4e0" },
  proxy: { label: "Proxy", color: "#90b0c8" },
};

/**
 * @param {ViewId} view
 * @param {{ focusId?: string|null, journeyId?: string|null, businessId?: string|null, layerFilter?: string|null }} opts
 */
export function visibleSets(view, opts = {}) {
  const { focusId = null, journeyId = null, businessId = null, layerFilter = null } = opts;
  /** @type {Set<string>} */
  let nodeIds = new Set(nodes.map((n) => n.id));
  /** @type {Set<string>} */
  let edgeIds = new Set(edges.map((e) => e.id));

  const projectKinds = new Set(["application", "service", "satellite"]);
  const infraKinds = new Set(["database", "infrastructure"]);
  const dataEdgeTypes = new Set(["database", "s3_efs", "callback", "job", "webhook", "realtime"]);

  if (view === "project") {
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
    // include neighbors one hop for context
    for (const e of edges) {
      if (nodeIds.has(e.source) || nodeIds.has(e.target)) {
        nodeIds.add(e.source);
        nodeIds.add(e.target);
        edgeIds.add(e.id);
      }
    }
    edgeIds = new Set(
      edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => e.id),
    );
  } else if (view === "journey" && journeyId) {
    const j = journeys.find((x) => x.id === journeyId);
    nodeIds = new Set(j?.steps ?? []);
    edgeIds = new Set(j?.edgeIds ?? []);
  } else if (view === "impact" && focusId) {
    const down = blastRadius(focusId, "down");
    const up = blastRadius(focusId, "up");
    nodeIds = new Set([focusId, ...down.nodes, ...up.nodes]);
    edgeIds = new Set([...down.edges, ...up.edges]);
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
    const hay = [e.label, e.description, e.type, ...(e.endpoints ?? []), ...(e.evidence ?? [])]
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
  }

  for (const j of journeys) {
    if (`${j.name} ${j.description} ${j.business}`.toLowerCase().includes(q)) {
      hits.push({
        kind: "journey",
        id: j.id,
        title: j.name,
        subtitle: j.description,
        score: 60,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 40);
}

export const meta = {
  account: "578736536410",
  region: "eu-north-1",
  title: "Phoenician Capital · Software Universe",
  subtitle: "Living map of every product, dependency, and data path — sourced from the .cursor knowledge base.",
  confidenceNote:
    "Edges marked confirmed are evidenced in .cursor KB / source. Conceptual twins and forks are labeled. No invented runtime links.",
  nonLinks: [
    "Earnings_tracker ≠ portfolio earnings_predictor",
    "Portal JWT ≠ PI JWT",
    "Factsheet-Automation ≠ live pm-serve",
    "Screen Express ≠ Linker ≠ PI CapIQ Playwright ≠ portfolio capiq-downloader",
    "DocuSign class present but not DI-wired (DocuSeal is live)",
    "Portal transactional email = Resend (not SES)",
  ],
};

/** World bounds for SVG viewBox */
export const world = { width: 1800, height: 1180, pad: 40 };

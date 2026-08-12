<script>
  import GalaxyMap from "./GalaxyMap.svelte";
  import DetailPanel from "./DetailPanel.svelte";
  import CommandPalette from "./CommandPalette.svelte";
  import {
    blastRadius,
    businessFunctions,
    domains,
    edges,
    edgeTypeMeta,
    journeys,
    meta,
    nodes,
    shortestPath,
    views,
    visibleSets,
  } from "$lib/ecosystem/index.js";

  /** @typedef {import('$lib/ecosystem/index.js').ViewId} ViewId */

  let view = $state(/** @type {ViewId} */ ("architecture"));
  let selectedId = $state(/** @type {string|null} */ (null));
  let selectedEdgeId = $state(/** @type {string|null} */ (null));
  let journeyId = $state(/** @type {string|null} */ (journeys[0]?.id ?? null));
  let businessId = $state(/** @type {string|null} */ (businessFunctions[0]?.id ?? null));
  let layerFilter = $state("");
  let isolate = $state(false);
  let paletteOpen = $state(false);
  let pathMode = $state(false);
  let pathFrom = $state(/** @type {string|null} */ (null));
  let toast = $state("");

  /** @type {Set<string>} */
  let highlightNodes = $state(new Set());
  /** @type {Set<string>} */
  let highlightEdges = $state(new Set());

  let mapRef = $state(/** @type {GalaxyMap|null} */ (null));

  const visibility = $derived(
    visibleSets(view, {
      focusId: selectedId,
      journeyId,
      businessId,
      layerFilter: layerFilter || null,
    }),
  );

  const visibleNodes = $derived(nodes.filter((n) => visibility.nodeIds.has(n.id)));
  const visibleEdges = $derived(edges.filter((e) => visibility.edgeIds.has(e.id)));

  const journeySteps = $derived(
    view === "journey" && journeyId
      ? (journeys.find((j) => j.id === journeyId)?.steps ?? [])
      : [],
  );

  const dimUnrelated = $derived(isolate || highlightNodes.size > 0);

  $effect(() => {
    /** @param {KeyboardEvent} ev */
    function onKey(ev) {
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        paletteOpen = !paletteOpen;
      }
      if (ev.key === "Escape") {
        if (paletteOpen) paletteOpen = false;
        else clearFocus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  $effect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      toast = "";
    }, 3200);
    return () => clearTimeout(t);
  });

  function clearFocus() {
    selectedId = null;
    selectedEdgeId = null;
    highlightNodes = new Set();
    highlightEdges = new Set();
    isolate = false;
    pathMode = false;
    pathFrom = null;
  }

  /** @param {string} id */
  function selectNode(id) {
    if (pathMode) {
      if (!pathFrom) {
        pathFrom = id;
        selectedId = id;
        toast = "Path mode: pick a destination node";
        return;
      }
      const path = shortestPath(pathFrom, id);
      pathMode = false;
      if (!path) {
        toast = "No path found (excluding conceptual/fork edges)";
        pathFrom = null;
        return;
      }
      highlightNodes = new Set(path.nodes);
      highlightEdges = new Set(path.edges);
      selectedId = id;
      selectedEdgeId = null;
      isolate = true;
      pathFrom = null;
      toast = `Path · ${path.nodes.length} nodes`;
      mapRef?.focusNode(id);
      return;
    }
    selectedId = id;
    selectedEdgeId = null;
    if (view === "impact") {
      applyBlast(id);
    } else {
      const { inbound, outbound } = {
        inbound: edges.filter((e) => e.target === id),
        outbound: edges.filter((e) => e.source === id),
      };
      highlightNodes = new Set([id, ...inbound.map((e) => e.source), ...outbound.map((e) => e.target)]);
      highlightEdges = new Set([...inbound, ...outbound].map((e) => e.id));
    }
    mapRef?.focusNode(id);
  }

  /** @param {string} id */
  function selectEdge(id) {
    selectedEdgeId = id;
    const e = edges.find((x) => x.id === id);
    if (e) {
      selectedId = null;
      highlightNodes = new Set([e.source, e.target]);
      highlightEdges = new Set([id]);
    }
  }

  /** @param {string} id */
  function showUpstream(id) {
    view = "architecture";
    const r = blastRadius(id, "up");
    highlightNodes = new Set([id, ...r.nodes]);
    highlightEdges = new Set(r.edges);
    isolate = true;
    selectedId = id;
    toast = `Upstream of ${id}`;
  }

  /** @param {string} id */
  function showDownstream(id) {
    view = "architecture";
    const r = blastRadius(id, "down");
    highlightNodes = new Set([id, ...r.nodes]);
    highlightEdges = new Set(r.edges);
    isolate = true;
    selectedId = id;
    toast = `Downstream of ${id}`;
  }

  /** @param {string} id */
  function applyBlast(id) {
    const down = blastRadius(id, "down");
    const up = blastRadius(id, "up");
    highlightNodes = new Set([id, ...down.nodes, ...up.nodes]);
    highlightEdges = new Set([...down.edges, ...up.edges]);
    isolate = true;
    toast = `Blast radius · ${highlightNodes.size - 1} related`;
  }

  /** @param {string} id */
  function onBlast(id) {
    view = "impact";
    selectedId = id;
    applyBlast(id);
  }

  function startPath() {
    pathMode = true;
    pathFrom = null;
    toast = "Path mode: pick start, then destination";
  }

  /** @param {{ kind: string, id: string }} hit */
  function onPick(hit) {
    paletteOpen = false;
    if (hit.kind === "node") {
      view = "architecture";
      selectNode(hit.id);
    } else if (hit.kind === "edge") {
      view = "architecture";
      selectEdge(hit.id);
    } else if (hit.kind === "journey") {
      view = "journey";
      journeyId = hit.id;
      const j = journeys.find((x) => x.id === hit.id);
      highlightNodes = new Set(j?.steps ?? []);
      highlightEdges = new Set(j?.edgeIds ?? []);
      isolate = true;
      selectedId = j?.steps?.[0] ?? null;
      toast = j?.name ?? "";
    }
  }

  $effect(() => {
    if (view === "journey" && journeyId) {
      const j = journeys.find((x) => x.id === journeyId);
      highlightNodes = new Set(j?.steps ?? []);
      highlightEdges = new Set(j?.edgeIds ?? []);
      isolate = true;
    }
  });
</script>

<div class="shell">
  <header class="top">
    <div class="brand">
      <p class="eyebrow">Phoenician Capital</p>
      <h1>{meta.title}</h1>
      <p class="lede">{meta.subtitle}</p>
    </div>
    <div class="top-actions">
      <button class="ghost" onclick={() => (paletteOpen = true)}>
        Search <kbd>⌘K</kbd>
      </button>
      <button class="ghost" onclick={() => { clearFocus(); mapRef?.resetView(); }}>Reset</button>
    </div>
  </header>

  <nav class="views" aria-label="Visualization modes">
    {#each views as v}
      <button
        class:active={view === v.id}
        onclick={() => {
          view = /** @type {ViewId} */ (v.id);
          if (v.id !== "impact" && v.id !== "journey") {
            isolate = false;
            highlightNodes = new Set();
            highlightEdges = new Set();
          }
        }}
        title={v.hint}
      >
        {v.name}
      </button>
    {/each}
  </nav>

  <div class="toolbar">
    <div class="filters">
      <label>
        Layer
        <select bind:value={layerFilter}>
          <option value="">All layers</option>
          <option value="frontend">Frontend / client</option>
          <option value="backend">Backend / workers</option>
          <option value="data">Databases / infra</option>
          <option value="vendor">External vendors</option>
          <option value="api">API services</option>
        </select>
      </label>

      {#if view === "journey"}
        <label>
          Journey
          <select bind:value={journeyId}>
            {#each journeys as j}
              <option value={j.id}>{j.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      {#if view === "business"}
        <label>
          Function
          <select bind:value={businessId}>
            {#each businessFunctions as b}
              <option value={b.id}>{b.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      <button class="chip" class:on={isolate} onclick={() => (isolate = !isolate)}>
        Focus mode
      </button>
      <button class="chip" class:on={pathMode} onclick={startPath}>Shortest path</button>
      {#if selectedId}
        <button class="chip" onclick={() => showUpstream(selectedId)}>Depends on</button>
        <button class="chip" onclick={() => showDownstream(selectedId)}>Depended by</button>
        <button class="chip" onclick={() => onBlast(selectedId)}>Blast radius</button>
      {/if}
    </div>

    <div class="stats">
      <span>{visibleNodes.length} nodes</span>
      <span>{visibleEdges.length} links</span>
      <span>AWS {meta.account}</span>
      <span>{meta.region}</span>
    </div>
  </div>

  <main class="stage">
    <GalaxyMap
      bind:this={mapRef}
      nodes={visibleNodes}
      edges={visibleEdges}
      {selectedId}
      {selectedEdgeId}
      {highlightNodes}
      {highlightEdges}
      {dimUnrelated}
      journeyStepIds={journeySteps}
      onselectnode={selectNode}
      onselectedge={selectEdge}
    />

    <DetailPanel
      nodeId={selectedId}
      edgeId={selectedEdgeId}
      onclose={clearFocus}
      onnavigate={selectNode}
      onedge={selectEdge}
      onupstream={showUpstream}
      ondownstream={showDownstream}
      onblast={onBlast}
    />

    <aside class="legend">
      <p class="legend-title">Domains</p>
      {#each Object.values(domains).filter((d) => !["vendor", "infra"].includes(d.id) || true) as d}
        <div class="legend-row">
          <i style:background={d.accent}></i>
          <span>{d.name}</span>
        </div>
      {/each}
      <p class="legend-title">Links</p>
      {#each Object.entries(edgeTypeMeta).slice(0, 8) as [k, v]}
        <div class="legend-row">
          <i class="line" style:background={v.color}></i>
          <span>{v.label}</span>
        </div>
      {/each}
      <p class="fine">{meta.confidenceNote}</p>
      <p class="legend-title">Non-links</p>
      <ul class="nonlinks">
        {#each meta.nonLinks.slice(0, 4) as nl}
          <li>{nl}</li>
        {/each}
      </ul>
    </aside>
  </main>

  {#if toast}
    <div class="toast" role="status">{toast}</div>
  {/if}

  <CommandPalette
    open={paletteOpen}
    onclose={() => (paletteOpen = false)}
    onpick={onPick}
  />
</div>

<style>
  .shell {
    height: 100vh;
    display: grid;
    grid-template-rows: auto auto auto 1fr;
    background: var(--ink);
  }

  .top {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 18px 22px 8px;
    align-items: end;
  }

  .eyebrow {
    margin: 0 0 4px;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold);
  }

  h1 {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 550;
    font-size: clamp(1.5rem, 2.6vw, 2.1rem);
    letter-spacing: -0.03em;
  }

  .lede {
    margin: 6px 0 0;
    max-width: 52rem;
    color: var(--fg-dim);
    font-size: 0.92rem;
  }

  .top-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid var(--panel-border);
    color: var(--fg-dim);
    background: rgba(255, 255, 255, 0.03);
    font-size: 0.82rem;
  }

  kbd {
    font-size: 10px;
    border: 1px solid rgba(196, 163, 90, 0.35);
    border-radius: 4px;
    padding: 1px 5px;
    color: var(--gold);
  }

  .views {
    display: flex;
    gap: 4px;
    padding: 0 18px;
    overflow-x: auto;
  }

  .views button {
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    color: var(--fg-mute);
    white-space: nowrap;
  }

  .views button.active {
    color: var(--ink);
    background: var(--gold-soft);
    font-weight: 600;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 18px 12px;
    flex-wrap: wrap;
    align-items: center;
    border-bottom: 1px solid var(--line);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-mute);
  }

  select {
    background: var(--ink-3);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 6px 8px;
    color: var(--fg);
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.8rem;
  }

  .chip {
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--line);
    font-size: 0.75rem;
    color: var(--fg-dim);
  }

  .chip.on {
    border-color: rgba(196, 163, 90, 0.5);
    color: var(--gold-soft);
    background: rgba(196, 163, 90, 0.12);
  }

  .stats {
    display: flex;
    gap: 12px;
    font-size: 0.72rem;
    color: var(--fg-mute);
    letter-spacing: 0.04em;
  }

  .stage {
    position: relative;
    min-height: 0;
  }

  .legend {
    position: absolute;
    left: 12px;
    top: 12px;
    width: 200px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(18, 24, 32, 0.78);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(10px);
    z-index: 3;
    max-height: calc(100% - 48px);
    overflow: auto;
  }

  .legend-title {
    margin: 10px 0 6px;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .legend-title:first-child {
    margin-top: 0;
  }

  .legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.72rem;
    color: var(--fg-dim);
    margin-bottom: 4px;
  }

  .legend-row i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-row i.line {
    height: 2px;
    border-radius: 2px;
  }

  .fine {
    margin: 12px 0 0;
    font-size: 0.68rem;
    line-height: 1.4;
    color: var(--fg-mute);
  }

  .nonlinks {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .nonlinks li {
    font-size: 0.65rem;
    color: var(--fg-mute);
    line-height: 1.35;
    margin-bottom: 4px;
    padding-left: 8px;
    border-left: 2px solid rgba(224, 122, 106, 0.45);
  }

  .toast {
    position: fixed;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(196, 163, 90, 0.18);
    border: 1px solid rgba(196, 163, 90, 0.4);
    color: var(--gold-soft);
    font-size: 0.82rem;
    z-index: 30;
    animation: fade-up 200ms ease;
  }

  @media (max-width: 900px) {
    .legend {
      display: none;
    }
    .lede {
      display: none;
    }
    h1 {
      font-size: 1.25rem;
    }
  }
</style>

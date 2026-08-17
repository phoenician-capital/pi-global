<script>
  import GalaxyMap from "./GalaxyMap.svelte";
  import DetailPanel from "./DetailPanel.svelte";
  import CommandPalette from "./CommandPalette.svelte";
  import FancySelect from "./FancySelect.svelte";
  import IntelligenceDesk from "./IntelligenceDesk.svelte";
  import PromptAtlas from "./PromptAtlas.svelte";
  import JourneyRail from "./JourneyRail.svelte";
  import PipelinesDesk from "./PipelinesDesk.svelte";
  import {
    blastLayers,
    blastRadius,
    businessFunctions,
    businessLayout,
    domains,
    edges,
    journeys,
    meta,
    nodeById,
    nodes,
    shortestPath,
    primaryViews,
    visibleSets,
  } from "$lib/ecosystem/index.js";

  const journeyOptions = $derived(
    journeys.map((j) => ({
      value: j.id,
      label: j.name,
      hint: j.description,
    })),
  );

  /** @typedef {import('$lib/ecosystem/index.js').ViewId} ViewId */

  /**
   * Pipelines surfaces exact AI-vendor usage and known security gaps — restricted to
   * these two people specifically, NOT to "anyone with DEVELOPER role" the way the
   * Architecture tab itself is gated one level up. pi-global has no identity of its
   * own; the parent PI app passes it via ?viewer= when embedding.
   */
  const PIPELINE_ALLOWED_VIEWERS = ["rr@phoeniciancapital.com", "jk@phoeniciancapital.com"];
  const currentViewer =
    typeof location !== "undefined"
      ? (new URLSearchParams(location.search).get("viewer") || "").trim().toLowerCase()
      : "";
  const canViewPipelines = PIPELINE_ALLOWED_VIEWERS.includes(currentViewer);

  const visiblePrimaryViews = primaryViews.filter((v) => v.id !== "pipeline" || canViewPipelines);

  let view = $state(/** @type {ViewId} */ ("intelligence"));
  let selectedId = $state(/** @type {string|null} */ (null));
  let selectedEdgeId = $state(/** @type {string|null} */ (null));
  let pipelineId = $state(/** @type {string|null} */ (null));
  let journeyId = $state(journeys[0]?.id ?? "");
  let businessId = $state(businessFunctions[0]?.id ?? "");
  let layerFilter = $state("");
  let isolate = $state(false);
  let paletteOpen = $state(false);
  let pathMode = $state(false);
  let pathFrom = $state(/** @type {string|null} */ (null));
  let toast = $state("");
  let hideVendors = $state(true);
  let includeNeighbors = $state(false);
  let journeyStep = $state(0);
  let journeyPlaying = $state(false);
  /** @type {string[]} */
  let pathHops = $state([]);
  let focusedDomain = $state(/** @type {string|null} */ (null));
  /** @type {ReturnType<typeof setTimeout>|null} */
  let blastTimer = null;

  /** @type {Set<string>} */
  let highlightNodes = $state(new Set());
  /** @type {Set<string>} */
  let highlightEdges = $state(new Set());
  /** @type {Set<string>} */
  let upstreamIds = $state(new Set());
  /** @type {Set<string>} */
  let downstreamIds = $state(new Set());

  let mapRef = $state(/** @type {GalaxyMap|null} */ (null));
  /** @type {ReturnType<typeof setInterval>|null} */
  let playTimer = null;
  let didInitialFit = $state(false);

  $effect(() => {
    if (didInitialFit || view !== "architecture" || !mapRef) return;
    didInitialFit = true;
    queueMicrotask(() => mapRef?.fitAll());
  });

  const softDim = $derived(view === "architecture" && !isolate && highlightNodes.size > 0);

  const visibility = $derived(
    visibleSets(view, {
      focusId: selectedId,
      journeyId,
      businessId,
      layerFilter: null,
      includeNeighbors: false,
      hideVendors: hideVendors && view === "architecture",
    }),
  );

  const visibleNodes = $derived(nodes.filter((n) => visibility.nodeIds.has(n.id)));
  const visibleEdges = $derived(edges.filter((e) => visibility.edgeIds.has(e.id)));

  const activeJourney = $derived(
    view === "journey" ? journeys.find((j) => j.id === journeyId) : null,
  );

  const journeySteps = $derived(activeJourney?.steps ?? []);

  const positionOverrides = $derived(
    view === "business" && businessId ? businessLayout(businessId) : null,
  );

  const dimUnrelated = $derived(
    isolate ||
      softDim ||
      (highlightNodes.size > 0 && view !== "architecture") ||
      view === "journey" ||
      view === "impact" ||
      !!focusedDomain,
  );

  const activeBusiness = $derived(businessFunctions.find((b) => b.id === businessId));

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
    }, 3400);
    return () => clearTimeout(t);
  });

  $effect(() => {
    if (view === "journey" && journeyId) {
      const j = journeys.find((x) => x.id === journeyId);
      highlightNodes = new Set(j?.steps ?? []);
      highlightEdges = new Set(j?.edgeIds ?? []);
      isolate = true;
      journeyStep = 0;
      stopPlay();
      if (j?.steps?.[0]) {
        selectedId = j.steps[0];
        queueMicrotask(() => mapRef?.fitSelection());
      }
    }
  });

  function stopPlay() {
    journeyPlaying = false;
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
  }

  function clearBlastTimer() {
    if (blastTimer) {
      clearTimeout(blastTimer);
      blastTimer = null;
    }
  }

  function clearFocus() {
    stopPlay();
    clearBlastTimer();
    selectedId = null;
    selectedEdgeId = null;
    highlightNodes = new Set();
    highlightEdges = new Set();
    upstreamIds = new Set();
    downstreamIds = new Set();
    isolate = false;
    pathMode = false;
    pathFrom = null;
    pathHops = [];
    focusedDomain = null;
  }

  /** @param {string} domainId */
  function onDomain(domainId) {
    if (focusedDomain === domainId) {
      focusedDomain = null;
      highlightNodes = new Set();
      isolate = false;
      toast = "Showing all families";
      return;
    }
    focusedDomain = domainId;
    const ids = nodes.filter((n) => n.domain === domainId).map((n) => n.id);
    highlightNodes = new Set(ids);
    highlightEdges = new Set(
      edges.filter((e) => ids.includes(e.source) && ids.includes(e.target)).map((e) => e.id),
    );
    isolate = true;
    toast = domains[domainId]?.name ?? domainId;
  }

  /** @param {string} id */
  function selectNode(id) {
    if (pathMode) {
      if (!pathFrom) {
        pathFrom = id;
        selectedId = id;
        toast = "Now pick the destination";
        return;
      }
      const path = shortestPath(pathFrom, id);
      pathMode = false;
      if (!path) {
        toast =
          "No confirmed path — systems may sit on separate auth islands (e.g. Portal ≠ PI)";
        pathFrom = null;
        pathHops = [];
        return;
      }
      highlightNodes = new Set(path.nodes);
      highlightEdges = new Set(path.edges);
      pathHops = path.nodes;
      selectedId = id;
      selectedEdgeId = null;
      isolate = true;
      pathFrom = null;
      toast = `Path · ${path.nodes.length} hops`;
      mapRef?.focusNode(id);
      return;
    }
    selectedId = id;
    selectedEdgeId = null;
    pathHops = [];
    if (view === "impact") {
      applyBlast(id);
    } else if (view === "journey") {
      const idx = journeySteps.indexOf(id);
      if (idx >= 0) journeyStep = idx;
      mapRef?.focusNode(id);
    } else {
      upstreamIds = new Set();
      downstreamIds = new Set();
      const inbound = edges.filter((e) => e.target === id);
      const outbound = edges.filter((e) => e.source === id);
      highlightNodes = new Set([id, ...inbound.map((e) => e.source), ...outbound.map((e) => e.target)]);
      highlightEdges = new Set([...inbound, ...outbound].map((e) => e.id));
      mapRef?.focusNode(id);
    }
  }

  /** @param {string} id */
  function selectEdge(id) {
    selectedEdgeId = id;
    const e = edges.find((x) => x.id === id);
    if (e) {
      selectedId = null;
      highlightNodes = new Set([e.source, e.target]);
      highlightEdges = new Set([id]);
      pathHops = [];
    }
  }

  /** @param {string} id */
  function showUpstream(id) {
    view = "architecture";
    hideVendors = false;
    const r = blastRadius(id, "up");
    highlightNodes = new Set([id, ...r.nodes]);
    highlightEdges = new Set(r.edges);
    upstreamIds = new Set(r.nodes);
    downstreamIds = new Set();
    isolate = true;
    selectedId = id;
    toast = `Depends on · ${r.nodes.length} upstream`;
    mapRef?.focusNode(id);
  }

  /** @param {string} id */
  function showDownstream(id) {
    view = "architecture";
    hideVendors = false;
    const r = blastRadius(id, "down");
    highlightNodes = new Set([id, ...r.nodes]);
    highlightEdges = new Set(r.edges);
    downstreamIds = new Set(r.nodes);
    upstreamIds = new Set();
    isolate = true;
    selectedId = id;
    toast = `Depended on by · ${r.nodes.length} downstream`;
    mapRef?.focusNode(id);
  }

  /** @param {string} id */
  function applyBlast(id) {
    clearBlastTimer();
    const downLayers = blastLayers(edges, id, "down");
    const upLayers = blastLayers(edges, id, "up");
    const downAll = blastRadius(id, "down");
    const upAll = blastRadius(id, "up");

    // Progressive reveal: epicenter → downstream hops → upstream
    highlightNodes = new Set([id]);
    highlightEdges = new Set();
    downstreamIds = new Set();
    upstreamIds = new Set();
    isolate = true;
    mapRef?.focusNode(id);
    toast = "Blast radius · expanding…";

    let hop = 0;
    const reduced =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    function finish() {
      highlightNodes = new Set([id, ...downAll.nodes, ...upAll.nodes]);
      highlightEdges = new Set([...downAll.edges, ...upAll.edges]);
      downstreamIds = new Set(downAll.nodes);
      upstreamIds = new Set(upAll.nodes);
      toast = `Blast radius · ${downAll.nodes.length} down · ${upAll.nodes.length} up`;
    }

    if (reduced || (!downLayers.length && !upLayers.length)) {
      finish();
      return;
    }

    function stepDown() {
      if (hop >= downLayers.length) {
        hop = 0;
        stepUp();
        return;
      }
      const layer = downLayers[hop];
      downstreamIds = new Set([...downstreamIds, ...layer.nodeIds]);
      highlightNodes = new Set([...highlightNodes, ...layer.nodeIds]);
      highlightEdges = new Set([...highlightEdges, ...layer.edgeIds]);
      hop += 1;
      blastTimer = setTimeout(stepDown, 280);
    }

    function stepUp() {
      if (hop >= upLayers.length) {
        finish();
        return;
      }
      const layer = upLayers[hop];
      upstreamIds = new Set([...upstreamIds, ...layer.nodeIds]);
      highlightNodes = new Set([...highlightNodes, ...layer.nodeIds]);
      highlightEdges = new Set([...highlightEdges, ...layer.edgeIds]);
      hop += 1;
      blastTimer = setTimeout(stepUp, 260);
    }

    blastTimer = setTimeout(stepDown, 200);
  }

  /** @param {string} id */
  function onBlast(id) {
    view = "impact";
    hideVendors = false;
    selectedId = id;
    applyBlast(id);
  }

  function startPath() {
    pathMode = true;
    pathFrom = null;
    pathHops = [];
    toast = "Path mode: click start, then destination";
  }

  /** @param {number} i */
  function onJourneyStep(i) {
    const j = activeJourney;
    if (!j) return;
    journeyStep = i;
    const id = j.steps[i];
    selectedId = id;
    // highlight path up to this step's edges
    const edgeSlice = j.edgeIds.slice(0, Math.min(i, j.edgeIds.length));
    highlightNodes = new Set(j.steps.slice(0, i + 1));
    highlightEdges = new Set(edgeSlice);
    mapRef?.focusNode(id);
  }

  function toggleJourneyPlay() {
    if (journeyPlaying) {
      stopPlay();
      return;
    }
    const j = activeJourney;
    if (!j?.steps.length) return;
    journeyPlaying = true;
    onJourneyStep(journeyStep);
    playTimer = setInterval(() => {
      const next = journeyStep + 1;
      if (next >= (activeJourney?.steps.length ?? 0)) {
        stopPlay();
        toast = "Journey complete";
        return;
      }
      onJourneyStep(next);
    }, 1400);
  }

  /** @param {{ kind: string, id: string }} hit */
  function onPick(hit) {
    paletteOpen = false;
    if (hit.kind === "intelligence") {
      view = "intelligence";
      selectedId = hit.id;
      selectedEdgeId = null;
      toast = "Inside this product";
      return;
    }
    if (hit.kind === "business") {
      view = "business";
      businessId = hit.id;
      clearFocus();
      toast = businessFunctions.find((b) => b.id === hit.id)?.name ?? "";
      return;
    }
    if (hit.kind === "scheduler") {
      view = "architecture";
      hideVendors = false;
      selectNode(hit.id);
      toast = "Scheduled job owner";
      return;
    }
    if (hit.kind === "node") {
      if (view === "intelligence") {
        selectedId = hit.id;
      } else {
        view = view === "impact" ? "impact" : "architecture";
        hideVendors = false;
        selectNode(hit.id);
      }
    } else if (hit.kind === "edge") {
      view = "architecture";
      hideVendors = false;
      selectEdge(hit.id);
    } else if (hit.kind === "journey") {
      view = "journey";
      journeyId = hit.id;
      toast = journeys.find((x) => x.id === hit.id)?.name ?? "";
    }
  }

  let deskInitialTab = $state(/** @type {'overview'|'calls'|'prompts'|'sections'|null} */ (null));

  /** @param {string} id @param {'overview'|'calls'|'prompts'|'sections'} [tab] */
  function openIntelligenceDesk(id, tab = "overview") {
    stopPlay();
    view = "intelligence";
    selectedId = id;
    selectedEdgeId = null;
    deskInitialTab = tab;
    toast = tab === "sections" ? "DD sections · per-section calls" : "Inside this product";
  }

  /** @param {string} id */
  function showOnMap(id) {
    view = "architecture";
    hideVendors = false;
    selectNode(id);
    toast = "Shown on map";
  }

  function switchView(/** @type {ViewId} */ id) {
    stopPlay();
    view = id === "pipeline" && !canViewPipelines ? "architecture" : id;
    if (id !== "impact" && id !== "journey") {
      if (id !== "architecture" || !isolate) {
        // keep selection, clear heavy highlights unless focusing
      }
      if (id === "architecture" || id === "project" || id === "dependency" || id === "dataflow" || id === "infra" || id === "business") {
        isolate = false;
        highlightNodes = new Set();
        highlightEdges = new Set();
        upstreamIds = new Set();
        downstreamIds = new Set();
        pathHops = [];
      }
    }
    if (id === "impact" && !selectedId) {
      toast = "Select a product to see blast radius";
    }
  }
</script>

<div class="shell" class:compact={view === "intelligence" || view === "prompts" || view === "pipeline"}>
  <header class="top">
    <div class="brand">
      <p class="eyebrow">Phoenician Capital · IT</p>
      <h1>{meta.title}</h1>
      {#if view === "intelligence"}
        <p class="lede">A plain-English guide to every tool we use — pick one on the left to see what it does.</p>
      {:else if view === "pipeline"}
        <p class="lede">How each product's workflow actually runs, stage by stage — and where it could be improved.</p>
      {:else if view !== "prompts"}
        <p class="lede">{meta.subtitle}</p>
      {/if}
    </div>
    <div class="top-actions">
      <button class="ghost" onclick={() => (paletteOpen = true)} title="Search products and links">
        Search <kbd>⌘K</kbd>
      </button>
    </div>
  </header>

  <nav class="views" aria-label="Main views">
    <div class="views-desktop">
      {#each visiblePrimaryViews as v}
        <button
          class:active={view === v.id}
          onclick={() => switchView(/** @type {ViewId} */ (v.id))}
          title={v.hint}
        >
          {v.name}
        </button>
      {/each}
    </div>
    <div class="views-mobile">
      <FancySelect
        label="View"
        bind:value={view}
        options={visiblePrimaryViews.map((v) => ({ value: v.id, label: v.name, hint: v.hint }))}
        onchange={(id) => switchView(/** @type {ViewId} */ (id))}
        wide
      />
    </div>
  </nav>

  {#if view === "journey"}
    <div class="toolbar slim">
      <FancySelect label="Walkthrough" bind:value={journeyId} options={journeyOptions} wide />
    </div>
  {:else if view === "architecture"}
    <div class="toolbar slim">
      <p class="hint-inline">Click any circle · drag to pan · scroll to zoom</p>
      <button
        type="button"
        class="text-toggle"
        class:on={!hideVendors}
        onclick={() => (hideVendors = !hideVendors)}
        title="Claude and DeepSeek stay visible. This adds CapIQ, Yahoo, email tools…"
      >
        {hideVendors ? "+ CapIQ, Yahoo & other vendors" : "Hide CapIQ / Yahoo vendors"}
      </button>
    </div>
  {/if}

  <main
    class="stage"
    class:desk={view === "intelligence" || view === "prompts" || view === "pipeline"}
    class:journey={view === "journey"}
  >
    {#if view === "intelligence"}
      <IntelligenceDesk
        selectedId={selectedId}
        onselect={(id) => {
          selectedId = id;
        }}
      />
    {:else if view === "pipeline"}
      <PipelinesDesk
        selectedId={pipelineId}
        onselect={(id) => {
          pipelineId = id;
        }}
      />
    {:else if view === "prompts"}
      <PromptAtlas
        selectedId={selectedId}
        onselect={(id) => {
          selectedId = id;
        }}
        onopendesk={openIntelligenceDesk}
        onshowmap={showOnMap}
      />
    {:else if view === "impact" && !selectedId}
      <div class="empty-state">
        <p class="empty-kicker">Impact</p>
        <h2>What would break?</h2>
        <p>Pick a product to see what depends on it.</p>
        <div class="empty-actions">
          <button type="button" onclick={() => selectNode("pi-net")}>PI control</button>
          <button type="button" onclick={() => selectNode("pm-serve")}>Portfolio API</button>
        </div>
      </div>
    {:else}
      {#if view === "journey"}
        <JourneyRail
          journey={activeJourney}
          activeStep={journeyStep}
          playing={journeyPlaying}
          onstep={onJourneyStep}
          onplay={toggleJourneyPlay}
        />
      {/if}

      <GalaxyMap
        bind:this={mapRef}
        nodes={visibleNodes}
        edges={visibleEdges}
        {selectedId}
        {selectedEdgeId}
        {highlightNodes}
        {highlightEdges}
        {dimUnrelated}
        {softDim}
        {focusedDomain}
        controlsOffset={view !== "journey" && (selectedId || selectedEdgeId) ? 380 : 0}
        journeyStepIds={journeySteps}
        journeyActiveStep={view === "journey" ? journeyStep : -1}
        {upstreamIds}
        {downstreamIds}
        {positionOverrides}
        animateFlow={view === "journey" || pathHops.length > 0 || view === "impact"}
        onselectnode={selectNode}
        onselectedge={selectEdge}
        ondomain={onDomain}
      />

      {#if view !== "journey"}
        <DetailPanel
          nodeId={selectedId}
          edgeId={selectedEdgeId}
          onclose={clearFocus}
          onnavigate={selectNode}
          onedge={selectEdge}
          onupstream={showUpstream}
          ondownstream={showDownstream}
          onblast={onBlast}
          onopendesk={openIntelligenceDesk}
          onjourney={(id) => {
            view = "journey";
            journeyId = id;
            toast = journeys.find((j) => j.id === id)?.name ?? "";
          }}
          onbusiness={(id) => {
            view = "business";
            businessId = id;
            clearFocus();
            toast = businessFunctions.find((b) => b.id === id)?.name ?? "";
          }}
        />
      {/if}

      {#if view === "architecture" && !selectedId && !selectedEdgeId}
        <div class="map-hint" aria-hidden="true">
          <strong>Start here</strong>
          <span>Click a circle — try Diligence, Screener, or Portfolio</span>
        </div>
      {:else if view === "journey" && journeyStep === 0 && !journeyPlaying}
        <div class="map-hint" aria-hidden="true">
          <strong>Follow the numbers</strong>
          <span>Or press Play — each step lights up on the map</span>
        </div>
      {/if}

      {#if view === "architecture" || view === "impact"}
        <aside class="legend">
          <p class="legend-title">Color key</p>
          {#each Object.values(domains).filter((d) => !["vendor", "infra"].includes(d.id)) as d}
            <div class="legend-row">
              <i style:background={d.color}></i>
              <span>{d.shortLabel ?? d.name}</span>
            </div>
          {/each}
          {#if view === "impact"}
            <div class="legend-row"><i style:background="#2f6f8a"></i><span>Needs this</span></div>
            <div class="legend-row"><i style:background="#9a4d63"></i><span>Breaks if this fails</span></div>
          {/if}
        </aside>
      {/if}
    {/if}
  </main>

  {#if toast}
    <div class="toast" role="status">{toast}</div>
  {/if}

  <CommandPalette open={paletteOpen} onclose={() => (paletteOpen = false)} onpick={onPick} />
</div>

<style>
  .shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--ink);
  }

  .top {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 18px 22px 8px;
    align-items: end;
  }

  .shell.compact .top {
    padding: 10px 18px 4px;
    align-items: center;
  }

  .shell.compact h1 {
    font-size: 1.35rem;
  }

  .shell.compact .views {
    padding: 0 14px 4px;
  }

  .shell.compact .stage.desk {
    margin-top: 4px;
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
    max-width: 54rem;
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
    background: rgba(255, 255, 255, 0.55);
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
    /* Must stay visible — overflow-x:auto clips the mobile View dropdown */
    overflow: visible;
  }

  .views-desktop {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .views-mobile {
    display: none;
    width: min(100%, 28rem);
  }

  .views-desktop button {
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.78rem;
    color: var(--fg-mute);
    white-space: nowrap;
    transition:
      background 160ms ease,
      color 160ms ease,
      box-shadow 160ms ease,
      transform 160ms ease;
  }

  .views-desktop button:hover:not(.active) {
    color: var(--fg-dim);
    background: rgba(28, 25, 20, 0.04);
  }

  .views-desktop button.active {
    color: #fffdf8;
    background: var(--gold);
    font-weight: 600;
    box-shadow: 0 6px 18px rgba(40, 32, 20, 0.16);
  }

  .guide {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    margin: 8px 18px 0;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid rgba(138, 106, 47, 0.28);
    background:
      radial-gradient(120% 100% at 0% 0%, rgba(138, 106, 47, 0.1), transparent 55%),
      rgba(255, 252, 247, 0.9);
    flex-wrap: wrap;
  }

  .guide-copy {
    display: grid;
    gap: 4px;
    max-width: 48rem;
  }

  .guide-copy strong {
    font-size: 0.82rem;
    color: var(--gold);
  }

  .guide-copy span {
    font-size: 0.8rem;
    color: var(--fg-dim);
    line-height: 1.4;
  }

  .guide-copy em {
    color: var(--fg);
    font-style: normal;
    font-weight: 500;
  }

  .guide-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .guide-actions button {
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid rgba(138, 106, 47, 0.35);
    background: rgba(138, 106, 47, 0.12);
    color: var(--gold);
    font-size: 0.78rem;
  }

  .guide-actions button.quiet {
    background: transparent;
    border-color: var(--line);
    color: var(--fg-mute);
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

  .toolbar.slim {
    padding: 6px 18px 10px;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .hint-inline {
    margin: 0;
    font-size: 0.78rem;
    color: var(--fg-mute);
  }

  .text-toggle {
    font-size: 0.78rem;
    color: var(--fg-mute);
    padding: 4px 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: rgba(60, 52, 40, 0.25);
  }

  .text-toggle:hover,
  .text-toggle.on {
    color: var(--gold);
    text-decoration-color: rgba(138, 106, 47, 0.45);
  }

  .map-hint {
    position: absolute;
    left: 50%;
    bottom: 28px;
    transform: translateX(-50%);
    z-index: 4;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 18px;
    border-radius: 999px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    box-shadow: var(--shadow);
    pointer-events: none;
    text-align: center;
    animation: fade-up 280ms ease;
  }

  .map-hint strong {
    font-size: 0.78rem;
    color: var(--gold);
  }

  .map-hint span {
    font-size: 0.82rem;
    color: var(--fg-dim);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .chip {
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(60, 52, 40, 0.16);
    background: #fff;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--fg-dim);
    box-shadow: 0 1px 2px rgba(40, 32, 20, 0.06);
  }

  .chip:hover {
    border-color: rgba(138, 106, 47, 0.4);
    color: var(--fg);
  }

  .chip.on {
    border-color: rgba(138, 106, 47, 0.55);
    color: var(--gold);
    background: rgba(138, 106, 47, 0.12);
  }

  .stats {
    display: flex;
    gap: 12px;
    font-size: 0.72rem;
    color: var(--fg-mute);
    letter-spacing: 0.04em;
  }

  .intel-hint {
    margin: 0;
    font-size: 0.8rem;
    color: var(--fg-mute);
    max-width: 52rem;
    line-height: 1.4;
  }

  .path-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-bottom: 1px solid var(--line);
    background: rgba(196, 163, 90, 0.06);
  }

  .path-label {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    margin-right: 4px;
  }

  .hop {
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid rgba(196, 163, 90, 0.35);
    color: var(--gold-soft);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .sep {
    color: var(--fg-mute);
    font-size: 0.8rem;
  }

  .clear-path {
    margin-left: auto;
    font-size: 0.72rem;
    color: var(--fg-mute);
  }

  .stage {
    position: relative;
    min-height: 0;
    flex: 1;
  }

  .stage.desk {
    padding: 0 16px 16px;
  }

  .empty-state {
    height: 100%;
    display: grid;
    place-content: center;
    gap: 10px;
    padding: 40px;
    text-align: center;
    animation: fade-up 320ms ease;
  }

  .empty-kicker {
    margin: 0;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .empty-state h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 550;
  }

  .empty-state p {
    margin: 0 auto;
    max-width: 32rem;
    color: var(--fg-dim);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .empty-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .empty-actions button {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(196, 163, 90, 0.4);
    background: rgba(196, 163, 90, 0.12);
    color: var(--gold-soft);
    font-size: 0.82rem;
  }

  .biz-card {
    position: absolute;
    left: 12px;
    top: 12px;
    width: 220px;
    z-index: 4;
    padding: 14px;
    border-radius: 12px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow);
  }

  .biz-card .kicker {
    margin: 0 0 4px;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .biz-card h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.05rem;
  }

  .biz-card p:last-child {
    margin: 6px 0 0;
    font-size: 0.78rem;
    color: var(--fg-mute);
    line-height: 1.4;
  }

  .legend {
    position: absolute;
    left: 12px;
    top: 12px;
    width: auto;
    max-width: 200px;
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow);
    z-index: 3;
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
    .legend,
    .biz-card {
      display: none;
    }
    .lede {
      display: none;
    }
    h1 {
      font-size: 1.25rem;
    }
    .top {
      padding: 12px 14px 4px;
      align-items: start;
    }
    .views {
      padding: 0 14px 8px;
    }
    .views-desktop {
      display: none;
    }
    .views-mobile {
      display: block;
      width: 100%;
      position: relative;
      z-index: 50;
    }

    .views-mobile :global(.fancy) {
      width: 100%;
    }

    .views-mobile :global(.trigger) {
      flex: 1;
      max-width: none;
    }
    .toolbar {
      padding: 0 14px 8px;
    }
    .guide {
      margin: 0 14px 8px;
      flex-direction: column;
      align-items: stretch;
    }
    .stats {
      display: none;
    }
  }
</style>

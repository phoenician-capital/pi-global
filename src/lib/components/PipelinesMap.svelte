<script>
  import GalaxyMap from "./GalaxyMap.svelte";
  import { pipelines } from "$lib/ecosystem/pipelines.js";

  /** @type {Record<string, string>} */
  const PROVIDER_COLORS = {
    claude: "#d97757",
    openai: "#0e8f70",
    gemini: "#3d72c9",
    deepseek: "#4d5fc9",
    perplexity: "#1f7a85",
    mixed: "#b8862e",
    none: "#7a8290",
  };
  /** @type {Record<string, string>} */
  const PROVIDER_LABELS = {
    claude: "Claude",
    openai: "OpenAI",
    gemini: "Gemini",
    deepseek: "DeepSeek",
    perplexity: "Perplexity",
    mixed: "Mixed",
    none: "Code — no AI",
  };
  /** @param {{ provider: string, model?: string }} [ai] */
  function badgeText(ai) {
    const provider = ai?.provider ?? "none";
    if (!ai?.model) return PROVIDER_LABELS[provider] ?? provider;
    const first = ai.model.split(/[,(·]/)[0].trim();
    return first.length > 26 ? (PROVIDER_LABELS[provider] ?? provider) : first;
  }

  /** Accent per pipeline — must match the `pipe-*` domain entries in domains.js exactly,
   * since GalaxyMap colors each hull from that registry, not from this component.
   * @type {Record<string, string>} */
  const ACCENTS = {
    dd: "#f0b429",
    dcf: "#ff9a52",
    screening: "#2dd4bf",
    portfolio: "#4fa8ff",
    ep: "#b18cff",
    earnings: "#ff6f91",
  };

  const ORDER = ["dd", "dcf", "screening", "portfolio", "ep", "earnings"];
  const orderedPipelines = ORDER.map((id) => pipelines.find((p) => p.id === id)).filter((p) => !!p);

  let activeFilters = $state(new Set(ORDER));

  /** @param {string} id */
  function toggleFilter(id) {
    const next = new Set(activeFilters);
    if (next.has(id)) {
      if (next.size === 1) return;
      next.delete(id);
    } else {
      next.add(id);
    }
    activeFilters = next;
  }
  function selectAll() {
    activeFilters = new Set(ORDER);
  }
  /** @param {string} id */
  function isolate(id) {
    activeFilters = new Set([id]);
  }

  /** @param {string} s @param {number} n */
  function truncate(s, n) {
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
  }

  // ── Layout: one hull cluster per pipeline, flow-packed onto the shared canvas ──
  const CLUSTER_GAP = 56;
  const WORLD_W = 1720;
  const NODE_DX = 168;
  const NODE_DY = 132;

  const clusters = orderedPipelines.map((p) => {
    const n = p.stages.length;
    const cols = Math.max(2, Math.ceil(Math.sqrt(n * 1.6)));
    const rows = Math.ceil(n / cols);
    return { pipeline: p, cols, rows, width: cols * NODE_DX, height: rows * NODE_DY };
  });

  const positioned = (() => {
    let cursorX = 50;
    let cursorY = 70;
    let rowH = 0;
    const out = [];
    for (const c of clusters) {
      if (cursorX + c.width > WORLD_W && cursorX > 50) {
        cursorX = 50;
        cursorY += rowH + CLUSTER_GAP;
        rowH = 0;
      }
      out.push({ ...c, originX: cursorX, originY: cursorY });
      cursorX += c.width + CLUSTER_GAP;
      rowH = Math.max(rowH, c.height);
    }
    return out;
  })();

  /** @type {import('$lib/ecosystem/types.js').EcoNode[]} */
  const allNodes = [];
  /** @type {import('$lib/ecosystem/types.js').EcoEdge[]} */
  const allEdges = [];
  for (const c of positioned) {
    const domain = /** @type {import('$lib/ecosystem/types.js').DomainId} */ (`pipe-${c.pipeline.id}`);
    c.pipeline.stages.forEach((s, i) => {
      const row = Math.floor(i / c.cols);
      const col = i % c.cols;
      const ltr = row % 2 === 0;
      const x = c.originX + (ltr ? col : c.cols - 1 - col) * NODE_DX + NODE_DX / 2;
      const y = c.originY + row * NODE_DY + NODE_DY / 2;
      allNodes.push({
        id: `${c.pipeline.id}-${i}`,
        name: s.name,
        shortName: truncate(s.name, 15),
        domain,
        kind: /** @type {import('$lib/ecosystem/types.js').NodeKind} */ ("application"),
        purpose: `AI: ${badgeText(s.ai)} — ${s.description}`,
        stack: [],
        techLayer: /** @type {import('$lib/ecosystem/types.js').TechLayer} */ ("worker"),
        business: [],
        tags: [],
        x,
        y,
        r: 22,
      });
    });
    for (let i = 0; i < c.pipeline.stages.length - 1; i++) {
      allEdges.push({
        id: `${c.pipeline.id}-e${i}`,
        source: `${c.pipeline.id}-${i}`,
        target: `${c.pipeline.id}-${i + 1}`,
        type: /** @type {import('$lib/ecosystem/types.js').EdgeType} */ ("job"),
        // Left blank — the target node's own label already shows the stage
        // name, so an edge label would just duplicate it right on top.
        label: "",
        description: c.pipeline.stages[i + 1].triggeredBy ?? "",
        confidence: /** @type {import('$lib/ecosystem/types.js').Confidence} */ ("confirmed"),
        evidence: [],
      });
    }
  }

  const visibleNodes = $derived(allNodes.filter((n) => activeFilters.has(n.domain.replace("pipe-", ""))));
  const visibleNodeIds = $derived(new Set(visibleNodes.map((n) => n.id)));
  const visibleEdges = $derived(allEdges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)));

  /** @type {GalaxyMap|null} */
  let mapRef = $state(null);
  let didInitialFit = false;

  $effect(() => {
    void activeFilters;
    if (!mapRef) return;
    queueMicrotask(() => mapRef?.fitAll());
    didInitialFit = true;
  });

  /** @type {string | null} */
  let selectedId = $state(null);

  /** @param {string} id */
  function onSelectNode(id) {
    selectedId = id;
  }

  const selectedParts = $derived.by(() => {
    if (!selectedId) return null;
    const cut = selectedId.lastIndexOf("-");
    return { pipelineId: selectedId.slice(0, cut), stageIdx: Number(selectedId.slice(cut + 1)) };
  });
  const selectedPipeline = $derived.by(() => {
    if (!selectedParts) return null;
    return pipelines.find((p) => p.id === selectedParts.pipelineId) ?? null;
  });
  const selectedStageIdx = $derived(selectedParts?.stageIdx ?? -1);
  const selectedStage = $derived.by(() => {
    if (!selectedPipeline || selectedStageIdx < 0) return null;
    return selectedPipeline.stages[selectedStageIdx] ?? null;
  });
  const selectedPv = $derived(selectedStage?.ai?.provider ?? "none");
</script>

<div class="pmap">
  <div class="toolbar">
    <div class="filters">
      <button type="button" class="chip all" class:active={activeFilters.size === ORDER.length} onclick={selectAll}>
        All
      </button>
      {#each orderedPipelines as p (p.id)}
        <button
          type="button"
          class="chip"
          class:active={activeFilters.has(p.id)}
          style:--c={ACCENTS[p.id]}
          onclick={() => toggleFilter(p.id)}
          ondblclick={() => isolate(p.id)}
          title="Click to toggle · double-click to isolate"
        >
          <span class="chip-dot"></span>{p.product}
        </button>
      {/each}
    </div>
  </div>

  <div class="canvas">
    <GalaxyMap
      bind:this={mapRef}
      nodes={visibleNodes}
      edges={visibleEdges}
      selectedId={selectedId}
      selectedEdgeId={null}
      highlightNodes={new Set()}
      highlightEdges={new Set()}
      dimUnrelated={false}
      journeyStepIds={[]}
      animateFlow={false}
      onselectnode={onSelectNode}
    />
  </div>

  {#if selectedStage && selectedPipeline}
    <button type="button" class="scrim" onclick={() => (selectedId = null)} aria-label="Close detail"></button>
    <div class="detail" style:--pv={PROVIDER_COLORS[selectedPv] ?? PROVIDER_COLORS.none}>
      <button type="button" class="close" onclick={() => (selectedId = null)} aria-label="Close detail">×</button>
      <p class="detail-eyebrow" style:color={ACCENTS[selectedPipeline.id]}>
        {selectedPipeline.product} · Stage {selectedStageIdx + 1} of {selectedPipeline.stages.length}
      </p>
      <div class="detail-top">
        <h3>{selectedStage.name}</h3>
        <span class="ai-badge">{selectedStage.ai?.model ?? PROVIDER_LABELS[selectedPv]}</span>
      </div>
      <p class="desc">{selectedStage.description}</p>
      {#if selectedStage.ai?.note}
        <p class="ai-note">{selectedStage.ai.note}</p>
      {/if}
      {#if selectedStage.triggeredBy}
        <p class="trigger"><span>Starts when</span> {selectedStage.triggeredBy}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .pmap {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    background: var(--panel);
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .toolbar {
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    flex-shrink: 0;
  }

  .filters {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .chip {
    --c: #8a6a2f;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--panel-border);
    background: var(--panel);
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 600;
    color: var(--fg-mute);
    opacity: 0.55;
    transition: opacity 0.15s ease, border-color 0.15s ease;
  }

  .chip.all {
    --c: var(--gold);
  }

  .chip:hover {
    opacity: 0.85;
  }

  .chip.active {
    opacity: 1;
    border-color: var(--c);
    color: var(--fg);
    background: color-mix(in srgb, var(--c) 10%, var(--panel));
  }

  .chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c);
    flex-shrink: 0;
  }

  .canvas {
    flex: 1;
    min-height: 0;
    position: relative;
  }

  /* ── Detail panel ─────────────────────────────────────────────────── */
  .scrim {
    position: absolute;
    inset: 0;
    background: transparent;
    z-index: 5;
    border: none;
    cursor: default;
  }

  .detail {
    --pv: #8a6bd6;
    position: absolute;
    right: 16px;
    top: 16px;
    bottom: 16px;
    width: min(360px, calc(100% - 32px));
    overflow-y: auto;
    padding: 18px 20px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv) 6%, #fffcf6);
    border: 1px solid color-mix(in srgb, var(--pv) 32%, var(--panel-border));
    box-shadow: 0 18px 40px rgba(40, 32, 20, 0.2);
    z-index: 6;
  }

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-mute);
    font-size: 17px;
    line-height: 1;
  }

  .close:hover {
    background: rgba(138, 106, 47, 0.1);
  }

  .detail-eyebrow {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 10px;
    padding-right: 24px;
  }

  .detail-top {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
  }

  .detail-top h3 {
    font-family: var(--font-ui);
    font-size: 17px;
    font-weight: 650;
    margin: 0;
    color: var(--fg);
  }

  .ai-badge {
    align-self: flex-start;
    padding: 3px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--pv) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--pv) 45%, transparent);
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 650;
    color: color-mix(in srgb, var(--pv) 78%, black);
  }

  .desc {
    margin: 0 0 10px;
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--fg-dim);
  }

  .ai-note {
    margin: 0 0 10px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--fg-mute);
    font-style: italic;
  }

  .trigger {
    margin: 0;
    font-size: 12px;
    color: var(--fg-mute);
  }

  .trigger span {
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--pv);
    margin-right: 6px;
  }

  @media (max-width: 760px) {
    .toolbar {
      padding: 10px 12px;
    }

    .detail {
      right: 8px;
      left: 8px;
      top: auto;
      bottom: 8px;
      width: auto;
      max-height: 65%;
    }
  }
</style>

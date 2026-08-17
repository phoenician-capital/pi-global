<script>
  import { pipelines } from "$lib/ecosystem/pipelines.js";

  /** Signature accent color per pipeline — one "line color" per lane, transit-map style.
   * @type {Record<string, string>} */
  const ACCENTS = {
    dd: "#c9971f",
    dcf: "#d97a2e",
    screening: "#1f9d90",
    portfolio: "#2f7fd6",
    ep: "#8a6bd6",
    earnings: "#d6497a",
  };

  /** @type {Record<string, string>} */
  const PROVIDER_COLORS = {
    claude: "#d97757",
    openai: "#12a37f",
    gemini: "#3d72c9",
    deepseek: "#4d5fc9",
    perplexity: "#1f7a85",
    mixed: "#b8862e",
    none: "#9aa1ab",
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

  const ORDER = ["dd", "dcf", "screening", "portfolio", "ep", "earnings"];
  const orderedPipelines = ORDER.map((id) => pipelines.find((p) => p.id === id)).filter((p) => !!p);

  let activeFilters = $state(new Set(ORDER));

  /** @type {{ pipelineId: string, stageIdx: number } | null} */
  let selected = $state(null);

  const LANE_H = 116;
  const NODE_R = 19;
  const DX = 132;
  const START_X = 208;
  const START_Y = 66;

  const layout = $derived(
    orderedPipelines.map((p, laneIdx) => {
      const y = START_Y + laneIdx * LANE_H;
      const nodes = p.stages.map((s, i) => ({ x: START_X + i * DX, y, stage: s, idx: i }));
      return { pipeline: p, y, nodes };
    }),
  );

  const maxStages = Math.max(...orderedPipelines.map((p) => p.stages.length));
  const contentWidth = START_X + maxStages * DX + 70;
  const contentHeight = START_Y + orderedPipelines.length * LANE_H + 30;

  let scale = $state(1);
  let tx = $state(0);
  let ty = $state(0);
  /** @type {SVGSVGElement|null} */
  let svgEl = $state(null);
  let dragging = $state(false);
  let dragStart = { x: 0, y: 0, tx: 0, ty: 0 };
  let didInitialFit = false;

  function fitAll() {
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pad = 30;
    const s = Math.min((rect.width - pad * 2) / contentWidth, (rect.height - pad * 2) / contentHeight, 1.5);
    scale = Math.max(s, 0.12);
    tx = (rect.width - contentWidth * scale) / 2;
    ty = pad;
  }

  $effect(() => {
    if (didInitialFit || !svgEl) return;
    didInitialFit = true;
    queueMicrotask(fitAll);
  });

  /** @param {WheelEvent} ev */
  function onWheel(ev) {
    ev.preventDefault();
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    const factor = ev.deltaY < 0 ? 1.14 : 1 / 1.14;
    const next = Math.min(3.5, Math.max(0.12, scale * factor));
    const wx = (mx - tx) / scale;
    const wy = (my - ty) / scale;
    tx = mx - wx * next;
    ty = my - wy * next;
    scale = next;
  }

  /** @param {PointerEvent} ev */
  function onPointerDown(ev) {
    dragging = true;
    dragStart = { x: ev.clientX, y: ev.clientY, tx, ty };
    svgEl?.setPointerCapture(ev.pointerId);
  }
  /** @param {PointerEvent} ev */
  function onPointerMove(ev) {
    if (!dragging) return;
    tx = dragStart.tx + (ev.clientX - dragStart.x);
    ty = dragStart.ty + (ev.clientY - dragStart.y);
  }
  function onPointerUp() {
    dragging = false;
  }

  /** @param {string} id */
  function toggleFilter(id) {
    const next = new Set(activeFilters);
    if (next.has(id)) {
      if (next.size === 1) return; // keep at least one lane visible
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

  /** @param {string} pipelineId @param {number} idx */
  function selectStage(pipelineId, idx) {
    selected = { pipelineId, stageIdx: idx };
  }

  const selectedPipeline = $derived(selected ? (pipelines.find((p) => p.id === selected?.pipelineId) ?? null) : null);
  const selectedStage = $derived.by(() => {
    if (!selected || !selectedPipeline) return null;
    return selectedPipeline.stages[selected.stageIdx] ?? null;
  });
  const selectedPv = $derived(selectedStage?.ai?.provider ?? "none");

  /** @param {string} s @param {number} n */
  function truncate(s, n) {
    return s.length > n ? `${s.slice(0, n - 1)}…` : s;
  }
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
    <button type="button" class="fit-btn" onclick={fitAll}>Fit to screen</button>
  </div>

  <div class="canvas">
    <svg
      bind:this={svgEl}
      class="map-svg"
      class:panning={dragging}
      onwheel={onWheel}
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
      role="img"
      aria-label="Pipeline map"
    >
      <defs>
        <pattern id="dotgrid" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.2" fill="#e4e1d8" />
        </pattern>
        {#each orderedPipelines as p (p.id)}
          <marker id={`arrow-${p.id}`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={ACCENTS[p.id]} />
          </marker>
        {/each}
      </defs>

      <rect x="0" y="0" width="100%" height="100%" fill="url(#dotgrid)" />

      <g transform={`translate(${tx},${ty}) scale(${scale})`}>
        {#each layout as lane (lane.pipeline.id)}
          {#if activeFilters.has(lane.pipeline.id)}
            <g class="lane">
              <text x="10" y={lane.y + 5} class="lane-label" fill={ACCENTS[lane.pipeline.id]}>
                {lane.pipeline.product}
              </text>

              {#each lane.nodes.slice(0, -1) as n, i (i)}
                <line
                  x1={n.x + NODE_R}
                  y1={n.y}
                  x2={lane.nodes[i + 1].x - NODE_R - 6}
                  y2={lane.nodes[i + 1].y}
                  stroke={ACCENTS[lane.pipeline.id]}
                  stroke-width="3"
                  marker-end={`url(#arrow-${lane.pipeline.id})`}
                />
              {/each}

              {#each lane.nodes as n (n.idx)}
                {@const pv = PROVIDER_COLORS[n.stage.ai?.provider ?? "none"] ?? PROVIDER_COLORS.none}
                {@const isSel = selected?.pipelineId === lane.pipeline.id && selected?.stageIdx === n.idx}
                <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                <g
                  class="node"
                  class:selected={isSel}
                  transform={`translate(${n.x},${n.y})`}
                  onclick={() => selectStage(lane.pipeline.id, n.idx)}
                  role="button"
                  tabindex="0"
                  onkeydown={(ev) => ev.key === "Enter" && selectStage(lane.pipeline.id, n.idx)}
                >
                  {#if isSel}
                    <circle r={NODE_R + 7} fill="none" stroke={ACCENTS[lane.pipeline.id]} stroke-width="2" opacity="0.5" />
                  {/if}
                  <circle r={NODE_R} fill="#fffcf6" stroke={ACCENTS[lane.pipeline.id]} stroke-width="3" />
                  <circle r="6.5" cx={NODE_R - 9} cy={-(NODE_R - 9)} fill={pv} stroke="#fffcf6" stroke-width="1.5" />
                  <text text-anchor="middle" dy="5" class="node-num" fill="#1c1914">{n.idx + 1}</text>
                  <text text-anchor="middle" y={NODE_R + 15} class="node-label" fill="#4a453c">
                    {truncate(n.stage.name, 15)}
                  </text>
                </g>
              {/each}
            </g>
          {/if}
        {/each}
      </g>
    </svg>

    <div class="legend">
      <span class="legend-title">AI</span>
      {#each Object.entries(PROVIDER_LABELS) as [key, label] (key)}
        <span class="legend-item">
          <span class="legend-dot" style:background={PROVIDER_COLORS[key]}></span>{label}
        </span>
      {/each}
    </div>

    <p class="hint">Drag to pan · scroll to zoom · click a stage to read it</p>
  </div>

  {#if selectedStage && selectedPipeline}
    <div class="detail" style:--pv={PROVIDER_COLORS[selectedPv] ?? PROVIDER_COLORS.none}>
      <button type="button" class="close" onclick={() => (selected = null)} aria-label="Close detail">×</button>
      <p class="detail-eyebrow" style:color={ACCENTS[selectedPipeline.id]}>
        {selectedPipeline.product} · Stage {(selected?.stageIdx ?? 0) + 1} of {selectedPipeline.stages.length}
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
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    background: var(--panel);
    overflow: hidden;
    box-shadow: var(--shadow);
    position: relative;
  }

  /* ── Toolbar ──────────────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    flex-wrap: wrap;
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

  .fit-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid var(--panel-border);
    background: var(--panel);
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 600;
    color: var(--fg-dim);
    white-space: nowrap;
  }

  .fit-btn:hover {
    background: rgba(138, 106, 47, 0.08);
  }

  /* ── Canvas ───────────────────────────────────────────────────────── */
  .canvas {
    position: relative;
    flex: 1;
    min-height: 0;
    background: #fbf9f4;
  }

  .map-svg {
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;
  }

  .map-svg.panning {
    cursor: grabbing;
  }

  .lane-label {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .node {
    cursor: pointer;
  }

  .node circle:first-of-type {
    transition: r 0.12s ease;
  }

  .node:hover circle:nth-of-type(2) {
    filter: brightness(1.08);
  }

  .node-num {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 13px;
    pointer-events: none;
  }

  .node-label {
    font-family: var(--font-ui);
    font-size: 9.5px;
    font-weight: 600;
    pointer-events: none;
  }

  .node.selected .node-label {
    font-weight: 800;
  }

  /* ── Legend ───────────────────────────────────────────────────────── */
  .legend {
    position: absolute;
    left: 12px;
    bottom: 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 12px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(255, 252, 246, 0.92);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(4px);
    max-width: calc(100% - 24px);
  }

  .legend-title {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-mute);
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-ui);
    font-size: 10.5px;
    color: var(--fg-dim);
    white-space: nowrap;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .hint {
    position: absolute;
    right: 12px;
    bottom: 12px;
    margin: 0;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255, 252, 246, 0.85);
    border: 1px solid var(--panel-border);
    font-family: var(--font-ui);
    font-size: 10.5px;
    color: var(--fg-mute);
    pointer-events: none;
  }

  /* ── Detail panel ─────────────────────────────────────────────────── */
  .detail {
    --pv: #8a6bd6;
    position: absolute;
    right: 16px;
    top: 66px;
    width: min(340px, calc(100% - 32px));
    max-height: calc(100% - 96px);
    overflow-y: auto;
    padding: 16px 18px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv) 6%, #fffcf6);
    border: 1px solid color-mix(in srgb, var(--pv) 32%, var(--panel-border));
    box-shadow: 0 18px 40px rgba(40, 32, 20, 0.16);
  }

  .close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--fg-mute);
    font-size: 16px;
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
    margin: 0 0 8px;
    padding-right: 20px;
  }

  .detail-top {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
  }

  .detail-top h3 {
    font-family: var(--font-ui);
    font-size: 16px;
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
    font-size: 10.5px;
    font-weight: 650;
    color: color-mix(in srgb, var(--pv) 78%, black);
  }

  .desc {
    margin: 0 0 8px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--fg-dim);
  }

  .ai-note {
    margin: 0 0 8px;
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--fg-mute);
    font-style: italic;
  }

  .trigger {
    margin: 0;
    font-size: 11.5px;
    color: var(--fg-mute);
  }

  .trigger span {
    text-transform: uppercase;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--pv);
    margin-right: 6px;
  }

  /* ── Mobile ───────────────────────────────────────────────────────── */
  @media (max-width: 760px) {
    .toolbar {
      padding: 10px 12px;
    }

    .filters {
      gap: 5px;
    }

    .chip {
      font-size: 11px;
      padding: 4px 9px;
    }

    .legend {
      left: 8px;
      bottom: 8px;
      gap: 6px 10px;
      padding: 6px 10px;
    }

    .legend-item {
      font-size: 9.5px;
    }

    .hint {
      display: none;
    }

    .detail {
      right: 8px;
      left: 8px;
      top: auto;
      bottom: 8px;
      width: auto;
      max-height: 55%;
    }
  }
</style>

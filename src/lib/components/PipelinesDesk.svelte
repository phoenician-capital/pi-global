<script>
  import GalaxyMap from "./GalaxyMap.svelte";
  import { pipelines, pipelineById } from "$lib/ecosystem/pipelines.js";

  /**
   * @type {{
   *   selectedId: string|null,
   *   onselect: (id: string) => void,
   * }}
   */
  let { selectedId = null, onselect } = $props();

  const activeId = $derived(selectedId && pipelineById(selectedId) ? selectedId : (pipelines[0]?.id ?? null));
  const active = $derived(activeId ? pipelineById(activeId) : null);

  const groups = $derived.by(() => {
    /** @type {Map<string, typeof pipelines>} */
    const map = new Map();
    for (const p of pipelines) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)?.push(p);
    }
    return [...map.entries()];
  });

  /** Signature accent color per pipeline (mirrors the `pipe-*` domains in ecosystem/domains.js).
   * @type {Record<string, string>} */
  const ACCENTS = {
    dd: "#c9971f",
    dcf: "#d97a2e",
    screening: "#1f9d90",
    portfolio: "#2f7fd6",
    ep: "#8a6bd6",
    earnings: "#d6497a",
  };
  const accent = $derived(ACCENTS[activeId ?? ""] ?? ACCENTS.dd);

  /** AI-provider badge styling: label, color, short glyph.
   * @type {Record<string, { label: string, color: string, glyph: string }>} */
  const PROVIDERS = {
    claude: { label: "Claude", color: "#d97757", glyph: "C" },
    openai: { label: "OpenAI", color: "#0e8f70", glyph: "O" },
    gemini: { label: "Gemini", color: "#3d72c9", glyph: "G" },
    deepseek: { label: "DeepSeek", color: "#4d5fc9", glyph: "D" },
    perplexity: { label: "Perplexity", color: "#1f7a85", glyph: "P" },
    ai: { label: "AI (unconfirmed model)", color: "#8a6bd6", glyph: "AI" },
    mixed: { label: "Mixed / multiple", color: "#b8862e", glyph: "×" },
    none: { label: "Code — no AI", color: "#6b7280", glyph: "</>" },
  };

  /** @param {string} provider */
  function providerMeta(provider) {
    return PROVIDERS[provider] ?? PROVIDERS.ai;
  }

  const ROW_SIZE = 4;
  const DX = 250;
  const DY = 185;

  /** Lay each pipeline's stages out as a serpentine node graph and hand it to GalaxyMap.
   * @type {{ nodes: import('$lib/ecosystem/types.js').EcoNode[], edges: import('$lib/ecosystem/types.js').EcoEdge[] }} */
  const graph = $derived.by(() => {
    if (!active) return { nodes: [], edges: [] };
    const domain = /** @type {import('$lib/ecosystem/types.js').DomainId} */ (`pipe-${active.id}`);
    const nodes = active.stages.map((s, i) => {
      const row = Math.floor(i / ROW_SIZE);
      const col = i % ROW_SIZE;
      const leftToRight = row % 2 === 0;
      const x = 170 + (leftToRight ? col : ROW_SIZE - 1 - col) * DX;
      const y = 150 + row * DY;
      return {
        id: `${active.id}-${i}`,
        name: s.name,
        shortName: s.name.length > 24 ? `${s.name.slice(0, 22)}…` : s.name,
        domain,
        kind: /** @type {import('$lib/ecosystem/types.js').NodeKind} */ ("application"),
        purpose: s.description,
        stack: [],
        techLayer: /** @type {import('$lib/ecosystem/types.js').TechLayer} */ ("worker"),
        business: [],
        tags: [],
        x,
        y,
        r: 30,
      };
    });
    const edges = active.stages.slice(0, -1).map((s, i) => ({
      id: `${active.id}-e${i}`,
      source: `${active.id}-${i}`,
      target: `${active.id}-${i + 1}`,
      type: /** @type {import('$lib/ecosystem/types.js').EdgeType} */ ("job"),
      label: active.stages[i + 1].name,
      description: active.stages[i + 1].triggeredBy ?? "",
      confidence: /** @type {import('$lib/ecosystem/types.js').Confidence} */ ("confirmed"),
      evidence: [],
    }));
    return { nodes, edges };
  });

  const allEdgeIds = $derived(new Set(graph.edges.map((e) => e.id)));

  let selectedStageIdx = $state(0);
  /** @type {GalaxyMap|null} */
  let mapRef = $state(null);

  const selectedNodeId = $derived(graph.nodes[selectedStageIdx]?.id ?? null);
  const selectedStage = $derived(active?.stages[selectedStageIdx] ?? null);
  const selectedPv = $derived(providerMeta(selectedStage?.ai?.provider ?? "ai"));

  $effect(() => {
    if (!active) return;
    void active.id; // reactive dependency — re-run when the selected pipeline changes
    selectedStageIdx = 0;
    queueMicrotask(() => mapRef?.fitAll());
  });

  /** @param {string} id */
  function selectNodeById(id) {
    const idx = graph.nodes.findIndex((n) => n.id === id);
    if (idx >= 0) selectedStageIdx = idx;
  }

  /** @param {string} id */
  function pick(id) {
    onselect(id);
  }
</script>

<div class="desk">
  <aside class="rail">
    <ul class="plist">
      {#each groups as [groupName, items] (groupName)}
        <li class="section-label">{groupName}</li>
        {#each items as p (p.id)}
          <li>
            <button
              type="button"
              class:active={activeId === p.id}
              style:--dot={ACCENTS[p.id] ?? ACCENTS.dd}
              onclick={() => pick(p.id)}
            >
              <span class="dot" aria-hidden="true"></span>
              <span class="row-text">
                <span class="name">{p.product}</span>
                <span class="one">{p.oneLiner}</span>
              </span>
            </button>
          </li>
        {/each}
      {/each}
    </ul>
  </aside>

  <section class="main" style:--accent={accent}>
    {#if active}
      <header class="main-head">
        <p class="eyebrow">{active.group}</p>
        <h2>{active.product}</h2>
        <p class="tagline">{active.oneLiner}</p>
      </header>

      <div class="map-area">
        <GalaxyMap
          bind:this={mapRef}
          nodes={graph.nodes}
          edges={graph.edges}
          selectedId={selectedNodeId}
          selectedEdgeId={null}
          highlightNodes={new Set()}
          highlightEdges={allEdgeIds}
          animateFlow={true}
          onselectnode={selectNodeById}
        />
        <p class="map-hint">Click a stage to read it · drag to pan · scroll to zoom</p>
      </div>

      {#if selectedStage}
        <div class="detail" style:--pv={selectedPv.color}>
          <div class="detail-top">
            <span class="detail-num">{selectedStageIdx + 1}</span>
            <h3>{selectedStage.name}</h3>
            <span class="ai-badge" title={selectedStage.ai?.note ?? selectedPv.label}>
              <span class="ai-glyph">{selectedPv.glyph}</span>
              {selectedStage.ai?.model ?? selectedPv.label}
            </span>
            <div class="detail-nav">
              <button
                type="button"
                disabled={selectedStageIdx === 0}
                onclick={() => (selectedStageIdx -= 1)}
                aria-label="Previous stage"
              >‹</button>
              <span class="detail-count">{selectedStageIdx + 1} / {active.stages.length}</span>
              <button
                type="button"
                disabled={selectedStageIdx === active.stages.length - 1}
                onclick={() => (selectedStageIdx += 1)}
                aria-label="Next stage"
              >›</button>
            </div>
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

      <div class="main-body">
        {#if active.enhancementIdeas?.length}
          <div class="enhance">
            <h3>What could be added or changed</h3>
            <ul>
              {#each active.enhancementIdeas as idea}
                <li>{idea}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if active.sourceNotes}
          <p class="source-notes">{active.sourceNotes}</p>
        {/if}
      </div>
    {:else}
      <div class="empty">Choose a pipeline on the left.</div>
    {/if}
  </section>
</div>

<style>
  .desk {
    display: grid;
    grid-template-columns: minmax(220px, 280px) 1fr;
    height: 100%;
    min-height: 0;
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    background: var(--panel);
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  /* ── Rail ─────────────────────────────────────────────────────────── */
  .rail {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    border-right: 1px solid var(--line);
    background: rgba(40, 32, 20, 0.04);
    padding: 8px;
  }

  .plist {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .section-label {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-mute);
    padding: 12px 10px 4px;
  }

  .plist button {
    width: 100%;
    text-align: left;
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 9px 10px;
    border-radius: 9px;
    background: transparent;
  }

  .plist button:hover {
    background: rgba(138, 106, 47, 0.08);
  }

  .plist button.active {
    background: rgba(138, 106, 47, 0.12);
    box-shadow: inset 2px 0 0 var(--dot);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot);
    margin-top: 5px;
    flex-shrink: 0;
  }

  .row-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .name {
    font-family: var(--font-ui);
    font-weight: 650;
    font-size: 13px;
    color: var(--fg);
  }

  .one {
    font-size: 11px;
    line-height: 1.4;
    color: var(--fg-mute);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Main ─────────────────────────────────────────────────────────── */
  .main {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
  }

  .main-head {
    padding: 20px 26px 14px;
    border-bottom: 1px solid var(--line);
    background: var(--panel);
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .eyebrow {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 6px;
  }

  .main-head h2 {
    font-family: var(--font-display);
    font-size: 24px;
    margin: 0 0 6px;
    color: var(--fg);
  }

  .tagline {
    margin: 0;
    color: var(--fg-dim);
    font-size: 13.5px;
    line-height: 1.5;
    max-width: 72ch;
  }

  /* ── Map ──────────────────────────────────────────────────────────── */
  .map-area {
    position: relative;
    flex: 0 0 auto;
    height: 46vh;
    min-height: 360px;
    max-height: 520px;
    border-bottom: 1px solid var(--line);
  }

  .map-hint {
    position: absolute;
    left: 14px;
    bottom: 10px;
    margin: 0;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255, 252, 247, 0.85);
    border: 1px solid var(--panel-border);
    font-family: var(--font-ui);
    font-size: 10.5px;
    color: var(--fg-mute);
    pointer-events: none;
  }

  /* ── Detail panel for the selected stage ─────────────────────────── */
  .detail {
    --pv: #8a6bd6;
    margin: 18px 26px 0;
    padding: 16px 20px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv) 6%, var(--panel));
    border: 1px solid color-mix(in srgb, var(--pv) 30%, var(--panel-border));
  }

  .detail-top {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }

  .detail-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--pv);
    color: #fffcf7;
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 12px;
    flex-shrink: 0;
  }

  .detail-top h3 {
    font-family: var(--font-ui);
    font-size: 15.5px;
    font-weight: 650;
    margin: 0;
    color: var(--fg);
    flex: 1;
    min-width: 160px;
  }

  .ai-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px 3px 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--pv) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--pv) 45%, transparent);
    font-family: var(--font-ui);
    font-size: 10.5px;
    font-weight: 650;
    color: color-mix(in srgb, var(--pv) 75%, black);
    white-space: nowrap;
  }

  .ai-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--pv);
    color: #fffcf7;
    font-size: 9px;
    font-weight: 800;
  }

  .detail-nav {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .detail-nav button {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    color: var(--fg-dim);
    font-size: 13px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .detail-nav button:not(:disabled):hover {
    background: rgba(138, 106, 47, 0.1);
  }

  .detail-nav button:disabled {
    opacity: 0.35;
  }

  .detail-count {
    font-family: var(--font-ui);
    font-size: 10.5px;
    color: var(--fg-mute);
    min-width: 40px;
    text-align: center;
  }

  .desc {
    margin: 0 0 6px;
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--fg-dim);
    max-width: 76ch;
  }

  .ai-note {
    margin: 0 0 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--fg-mute);
    font-style: italic;
    max-width: 76ch;
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

  /* ── Body: enhancement ideas + source notes ──────────────────────── */
  .main-body {
    padding: 20px 26px 34px;
  }

  .enhance {
    padding: 18px 20px;
    border-radius: 12px;
    background: rgba(138, 106, 47, 0.06);
    border: 1px solid rgba(138, 106, 47, 0.18);
  }

  .enhance h3 {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin: 0 0 10px;
    color: var(--gold-soft);
  }

  .enhance ul {
    margin: 0;
    padding: 0 0 0 18px;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .enhance li {
    font-size: 13px;
    line-height: 1.55;
    color: var(--fg-dim);
  }

  .source-notes {
    margin: 18px 2px 0;
    font-size: 11.5px;
    line-height: 1.6;
    color: var(--fg-mute);
    max-width: 80ch;
  }

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--fg-mute);
    font-size: 14px;
  }
</style>

<script>
  import { pipelines } from "$lib/ecosystem/pipelines.js";

  /** Signature accent color per pipeline — one "line color" per lane.
   * @type {Record<string, string>} */
  const ACCENTS = {
    dd: "#b8860f",
    dcf: "#c2650f",
    screening: "#0e8577",
    portfolio: "#1f66b8",
    ep: "#6d4fc4",
    earnings: "#c22f66",
  };

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

  /** Short badge text shown directly on every card — the specific model if we have
   * one, else the provider name. Kept short since it has to fit on a card.
   * @param {{ provider: string, model?: string }} [ai] */
  function badgeText(ai) {
    const provider = ai?.provider ?? "none";
    if (!ai?.model) return PROVIDER_LABELS[provider] ?? provider;
    const first = ai.model.split(/[,(·]/)[0].trim();
    return first.length > 22 ? (PROVIDER_LABELS[provider] ?? provider) : first;
  }

  const ORDER = ["dd", "dcf", "screening", "portfolio", "ep", "earnings"];
  const orderedPipelines = ORDER.map((id) => pipelines.find((p) => p.id === id)).filter((p) => !!p);

  let activeFilters = $state(new Set(ORDER));

  /** @type {{ pipelineId: string, stageIdx: number } | null} */
  let selected = $state(null);

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
    selected = selected?.pipelineId === pipelineId && selected?.stageIdx === idx ? null : { pipelineId, stageIdx: idx };
  }

  const selectedPipeline = $derived(selected ? (pipelines.find((p) => p.id === selected?.pipelineId) ?? null) : null);
  const selectedStage = $derived.by(() => {
    if (!selected || !selectedPipeline) return null;
    return selectedPipeline.stages[selected.stageIdx] ?? null;
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
    <p class="toolbar-hint">Scroll a row sideways for the rest of that pipeline · click a stage for details</p>
  </div>

  <div class="lanes">
    {#each orderedPipelines as p (p.id)}
      {#if activeFilters.has(p.id)}
        <section class="lane" style:--accent={ACCENTS[p.id]}>
          <div class="lane-head">
            <span class="lane-bar"></span>
            <div class="lane-head-text">
              <h3>{p.product}</h3>
              <p>{p.oneLiner}</p>
            </div>
          </div>
          <div class="track">
            {#each p.stages as s, i (s.name)}
              {@const pv = PROVIDER_COLORS[s.ai?.provider ?? "none"] ?? PROVIDER_COLORS.none}
              {@const isSel = selected?.pipelineId === p.id && selected?.stageIdx === i}
              <button
                type="button"
                class="card"
                class:selected={isSel}
                onclick={() => selectStage(p.id, i)}
              >
                <span class="card-num">{i + 1}</span>
                <span class="card-name">{s.name}</span>
                <span class="card-ai" style:--pv={pv}>{badgeText(s.ai)}</span>
              </button>
              {#if i < p.stages.length - 1}
                <span class="arrow" aria-hidden="true">→</span>
              {/if}
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>

  {#if selectedStage && selectedPipeline}
    <button type="button" class="scrim" onclick={() => (selected = null)} aria-label="Close detail"></button>
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

  /* ── Toolbar ──────────────────────────────────────────────────────── */
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

  .toolbar-hint {
    margin: 8px 0 0;
    font-family: var(--font-ui);
    font-size: 11px;
    color: var(--fg-mute);
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

  /* ── Lanes ────────────────────────────────────────────────────────── */
  .lanes {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 6px 0 16px;
  }

  .lane {
    --accent: #8a6a2f;
    padding: 14px 16px 6px;
    border-bottom: 1px solid var(--line);
  }

  .lane:last-child {
    border-bottom: none;
  }

  .lane-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }

  .lane-bar {
    width: 5px;
    align-self: stretch;
    min-height: 34px;
    border-radius: 3px;
    background: var(--accent);
    flex-shrink: 0;
  }

  .lane-head-text h3 {
    font-family: var(--font-ui);
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 2px;
    color: var(--accent);
  }

  .lane-head-text p {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: var(--fg-mute);
    max-width: 68ch;
  }

  .track {
    display: flex;
    align-items: stretch;
    gap: 4px;
    overflow-x: auto;
    padding: 4px 4px 12px;
    scrollbar-width: thin;
  }

  .card {
    flex-shrink: 0;
    width: 152px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 11px;
    border-radius: 10px;
    border: 1.5px solid color-mix(in srgb, var(--accent) 35%, var(--panel-border));
    background: color-mix(in srgb, var(--accent) 5%, var(--panel));
    text-align: left;
    transition: transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease;
  }

  .card:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--accent) 50%, transparent);
  }

  .card.selected {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, var(--panel));
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
  }

  .card-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent);
    color: #fffcf6;
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 10.5px;
    flex-shrink: 0;
  }

  .card-name {
    font-family: var(--font-ui);
    font-size: 12.5px;
    font-weight: 650;
    line-height: 1.35;
    color: var(--fg);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.7em;
  }

  .card-ai {
    --pv: #7a8290;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--pv) 18%, transparent);
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    color: color-mix(in srgb, var(--pv) 75%, black);
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-ai::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--pv);
    flex-shrink: 0;
  }

  .arrow {
    flex-shrink: 0;
    align-self: center;
    color: var(--accent);
    opacity: 0.5;
    font-size: 15px;
    font-weight: 700;
  }

  /* ── Detail panel ─────────────────────────────────────────────────── */
  .scrim {
    position: absolute;
    inset: 0;
    background: rgba(20, 16, 8, 0.08);
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

  /* ── Mobile ───────────────────────────────────────────────────────── */
  @media (max-width: 760px) {
    .toolbar {
      padding: 10px 12px;
    }

    .toolbar-hint {
      display: none;
    }

    .lane {
      padding: 12px 12px 4px;
    }

    .lane-head-text h3 {
      font-size: 14px;
    }

    .lane-head-text p {
      font-size: 11px;
    }

    .card {
      width: 132px;
    }

    .scrim {
      display: block;
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

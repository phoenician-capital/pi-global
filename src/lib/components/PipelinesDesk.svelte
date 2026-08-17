<script>
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

  /** Signature accent color per pipeline — its "circuit color" throughout the view.
   * @type {Record<string, { c: string, glow: string }>} */
  const ACCENTS = {
    dd: { c: "#f0b429", glow: "rgba(240, 180, 41, 0.5)" },
    dcf: { c: "#ff9a52", glow: "rgba(255, 154, 82, 0.5)" },
    screening: { c: "#2dd4bf", glow: "rgba(45, 212, 191, 0.5)" },
    portfolio: { c: "#4fa8ff", glow: "rgba(79, 168, 255, 0.5)" },
    ep: { c: "#b18cff", glow: "rgba(177, 140, 255, 0.5)" },
    earnings: { c: "#ff6f91", glow: "rgba(255, 111, 145, 0.5)" },
  };
  const accent = $derived(ACCENTS[activeId ?? ""] ?? ACCENTS.dd);

  /** AI-provider badge styling: label, color, short glyph.
   * @type {Record<string, { label: string, color: string, glyph: string }>} */
  const PROVIDERS = {
    claude: { label: "Claude", color: "#d97757", glyph: "C" },
    openai: { label: "OpenAI", color: "#12a37f", glyph: "O" },
    gemini: { label: "Gemini", color: "#4285f4", glyph: "G" },
    deepseek: { label: "DeepSeek", color: "#4d6bfe", glyph: "D" },
    perplexity: { label: "Perplexity", color: "#20808d", glyph: "P" },
    mixed: { label: "Mixed / multiple", color: "#c9a227", glyph: "×" },
    none: { label: "Code — no AI", color: "#5b6472", glyph: "</>" },
  };
  const FALLBACK_PROVIDER = { label: "AI", color: "#9a8cff", glyph: "AI" };

  /** @param {string} provider */
  function providerMeta(provider) {
    return PROVIDERS[provider] ?? FALLBACK_PROVIDER;
  }

  /** @param {string} id */
  function pick(id) {
    onselect(id);
  }
</script>

<div class="desk" style:--accent={accent.c} style:--accent-glow={accent.glow}>
  <aside class="rail">
    <ul class="plist">
      {#each groups as [groupName, items] (groupName)}
        <li class="section-label">{groupName}</li>
        {#each items as p (p.id)}
          {@const pa = ACCENTS[p.id] ?? ACCENTS.dd}
          <li>
            <button
              type="button"
              class:active={activeId === p.id}
              style:--dot={pa.c}
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

  <section class="main">
    {#if active}
      {#key active.id}
        <div class="glow-a" aria-hidden="true"></div>
        <div class="glow-b" aria-hidden="true"></div>

        <header class="main-head">
          <p class="eyebrow">{active.group}</p>
          <h2>{active.product}</h2>
          <p class="tagline">{active.oneLiner}</p>
        </header>

        <div class="main-body">
          <ol class="stage-list">
            {#each active.stages as s, i (s.name)}
              {@const pv = providerMeta(s.ai?.provider ?? "ai")}
              <li class="stage" style:animation-delay="{i * 70}ms">
                <div class="node-col">
                  <span class="node" style:--pv={pv.color}>
                    <span class="node-num">{i + 1}</span>
                    <span class="node-ring"></span>
                  </span>
                  {#if i < active.stages.length - 1}
                    <span class="wire">
                      <span class="spark s1"></span>
                      <span class="spark s2"></span>
                      <span class="spark s3"></span>
                    </span>
                  {/if}
                </div>
                <div class="stage-card">
                  <div class="stage-top">
                    <h3>{s.name}</h3>
                    <span class="ai-badge" style:--pv={pv.color} title={s.ai?.note ?? pv.label}>
                      <span class="ai-glyph">{pv.glyph}</span>
                      {s.ai?.model ?? pv.label}
                    </span>
                  </div>
                  <p class="desc">{s.description}</p>
                  {#if s.ai?.note}
                    <p class="ai-note">{s.ai.note}</p>
                  {/if}
                  {#if s.triggeredBy}
                    <p class="trigger"><span>Starts when</span> {s.triggeredBy}</p>
                  {/if}
                </div>
              </li>
            {/each}
          </ol>

          {#if active.enhancementIdeas?.length}
            <div class="enhance">
              <h3><span class="spark-ico" aria-hidden="true"></span>What could be added or changed</h3>
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
      {/key}
    {:else}
      <div class="empty">Choose a pipeline on the left.</div>
    {/if}
  </section>
</div>

<style>
  .desk {
    --accent: #f0b429;
    --accent-glow: rgba(240, 180, 41, 0.5);
    display: grid;
    grid-template-columns: minmax(230px, 300px) 1fr;
    height: 100%;
    min-height: 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    background: #0a0d14;
  }

  /* ── Rail ─────────────────────────────────────────────────────────── */
  .rail {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    background: #0c1019;
    padding: 10px;
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
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    padding: 14px 10px 5px;
  }

  .plist button {
    width: 100%;
    text-align: left;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 10px;
    border-radius: 10px;
    background: transparent;
    transition: background 0.15s ease;
  }

  .plist button:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .plist button.active {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    box-shadow: inset 2px 0 0 var(--dot);
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--dot);
    box-shadow: 0 0 10px var(--dot);
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
    color: rgba(255, 255, 255, 0.92);
  }

  .one {
    font-size: 11px;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.45);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Main ─────────────────────────────────────────────────────────── */
  .main {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background:
      radial-gradient(ellipse 900px 500px at 15% -10%, rgba(255, 255, 255, 0.05), transparent 60%),
      #0a0d14;
  }

  .glow-a,
  .glow-b {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    opacity: 0.35;
    z-index: 0;
    animation: drift 14s ease-in-out infinite alternate;
  }
  .glow-a {
    width: 420px;
    height: 420px;
    top: -120px;
    right: -100px;
    background: var(--accent-glow);
  }
  .glow-b {
    width: 320px;
    height: 320px;
    bottom: 10%;
    left: -80px;
    background: var(--accent-glow);
    animation-delay: -6s;
  }

  @keyframes drift {
    from {
      transform: translate(0, 0) scale(1);
    }
    to {
      transform: translate(30px, -20px) scale(1.08);
    }
  }

  .main-head {
    position: relative;
    z-index: 1;
    padding: 26px 32px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(6px);
  }

  .eyebrow {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    text-shadow: 0 0 12px var(--accent-glow);
    margin: 0 0 8px;
  }

  .main-head h2 {
    font-family: var(--font-display);
    font-size: 28px;
    margin: 0 0 8px;
    color: #fdfbf7;
  }

  .tagline {
    margin: 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    line-height: 1.55;
    max-width: 70ch;
  }

  .main-body {
    position: relative;
    z-index: 1;
    padding: 30px 32px 40px;
  }

  /* ── Stage timeline ───────────────────────────────────────────────── */
  .stage-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .stage {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 16px;
    animation: rise-in 480ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes rise-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .node-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .node {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #1b2130, #0c0f16);
    border: 1.5px solid var(--pv);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 14px 1px color-mix(in srgb, var(--pv) 55%, transparent);
  }

  .node-num {
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 12px;
    color: #fdfbf7;
  }

  .node-ring {
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, var(--pv) 60%, transparent);
    animation: pulse-ring 2.6s ease-out infinite;
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.85);
      opacity: 0.7;
    }
    75% {
      transform: scale(1.5);
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  .wire {
    position: relative;
    width: 2px;
    flex: 1;
    min-height: 46px;
    margin: 2px 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04));
  }

  .spark {
    position: absolute;
    left: 50%;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px 2px var(--accent-glow);
    transform: translateX(-50%);
    animation: flow-down 2.4s linear infinite;
    opacity: 0;
  }
  .spark.s1 {
    animation-delay: 0s;
  }
  .spark.s2 {
    animation-delay: 0.8s;
  }
  .spark.s3 {
    animation-delay: 1.6s;
  }

  @keyframes flow-down {
    0% {
      top: -4%;
      opacity: 0;
    }
    12% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spark,
    .node-ring,
    .glow-a,
    .glow-b,
    .stage {
      animation: none !important;
    }
  }

  .stage-card {
    padding-bottom: 30px;
    min-width: 0;
  }

  .stage-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  .stage-card h3 {
    font-family: var(--font-ui);
    font-size: 15.5px;
    font-weight: 650;
    margin: 0;
    color: #fdfbf7;
  }

  .ai-badge {
    --pv: #9a8cff;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px 3px 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--pv) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--pv) 45%, transparent);
    font-family: var(--font-ui);
    font-size: 10.5px;
    font-weight: 650;
    color: color-mix(in srgb, var(--pv) 88%, white);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ai-glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--pv);
    color: #0a0d14;
    font-size: 9px;
    font-weight: 800;
  }

  .desc {
    margin: 0 0 6px;
    font-size: 13.5px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.68);
    max-width: 76ch;
  }

  .ai-note {
    margin: 0 0 6px;
    font-size: 12px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
    max-width: 76ch;
  }

  .trigger {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  .trigger span {
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--accent);
    margin-right: 6px;
  }

  /* ── Enhancement ideas ────────────────────────────────────────────── */
  .enhance {
    margin-top: 6px;
    padding: 20px 22px;
    border-radius: 14px;
    background: linear-gradient(150deg, color-mix(in srgb, var(--accent) 10%, transparent), rgba(255, 255, 255, 0.02));
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    box-shadow: 0 0 30px -10px var(--accent-glow);
  }

  .enhance h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin: 0 0 12px;
    color: var(--accent);
  }

  .spark-ico {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 10px 2px var(--accent-glow);
    animation: pulse-ring 2.2s ease-out infinite;
  }

  .enhance ul {
    margin: 0;
    padding: 0 0 0 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .enhance li {
    font-size: 13px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.72);
  }

  .source-notes {
    margin: 22px 2px 0;
    font-size: 11.5px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.3);
    max-width: 80ch;
  }

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
  }

  /* ── Mobile ───────────────────────────────────────────────────────── */
  @media (max-width: 760px) {
    .desk {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
      border-radius: 10px;
    }

    .rail {
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
      max-height: 96px;
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px;
      -webkit-overflow-scrolling: touch;
    }

    .plist {
      flex-direction: row;
      gap: 6px;
    }

    .section-label {
      display: none;
    }

    .plist button {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      width: 150px;
      flex-shrink: 0;
    }

    .plist button.active {
      box-shadow: inset 0 -2px 0 var(--dot);
    }

    .one {
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }

    .glow-a,
    .glow-b {
      width: 220px;
      height: 220px;
      filter: blur(60px);
    }

    .main-head {
      padding: 18px 16px 14px;
    }

    .main-head h2 {
      font-size: 21px;
    }

    .tagline {
      font-size: 13px;
    }

    .main-body {
      padding: 20px 16px 30px;
    }

    .stage {
      grid-template-columns: 32px 1fr;
      gap: 10px;
    }

    .node {
      width: 28px;
      height: 28px;
    }

    .node-num {
      font-size: 11px;
    }

    .stage-top {
      gap: 8px;
    }

    .stage-card h3 {
      font-size: 14.5px;
    }

    .desc {
      font-size: 13px;
    }

    .enhance {
      padding: 16px;
    }
  }

  @media (max-width: 420px) {
    .plist button {
      width: 130px;
    }

    .main-head h2 {
      font-size: 19px;
    }

    .ai-badge {
      font-size: 10px;
    }
  }
</style>

<script>
  import DossierView from "./DossierView.svelte";
  import DdSectionsPanel from "./DdSectionsPanel.svelte";
  import {
    dossierFor,
    intelligenceProjects,
    searchIntelligence,
  } from "$lib/ecosystem/intelligence.js";
  import { guideFor, aiBadge, plainForKind } from "$lib/ecosystem/plainGuide.js";
  import { coreGuideNodeIds, domains, nodeById } from "$lib/ecosystem/index.js";

  /**
   * @type {{
   *   selectedId: string|null,
   *   initialTab?: 'overview'|'calls'|'prompts'|'sections'|null,
   *   onselect: (id: string) => void,
   *   onshowmap?: (id: string) => void,
   *   onatlas?: (id: string) => void,
   * }}
   */
  let { selectedId = null, initialTab = null, onselect, onshowmap, onatlas } = $props();

  let deskTab = $state(/** @type {'overview'|'calls'|'prompts'|'sections'} */ ("overview"));
  let q = $state("");
  let llmOnly = $state(false);
  let appliedInitial = $state(/** @type {string|null} */ (null));

  const projects = $derived(
    intelligenceProjects().map((p) => {
      const g = guideFor(p.nodeId);
      const d = dossierFor(p.nodeId);
      return {
        ...p,
        title: g?.title ?? p.project,
        oneLiner: g?.oneLiner ?? p.summary,
        domain: nodeById.get(p.nodeId)?.domain,
        kindSkew: d?.kindSkew ?? [],
      };
    }),
  );

  const filtered = $derived(
    projects.filter((p) => {
      if (llmOnly && !p.hasLlm) return false;
      if (!q.trim()) return true;
      const hay = `${p.title} ${p.oneLiner} ${p.project} ${p.summary}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    }),
  );

  const coreSet = new Set(coreGuideNodeIds);
  const coreFiltered = $derived(filtered.filter((p) => coreSet.has(p.nodeId)));
  const moreFiltered = $derived(filtered.filter((p) => !coreSet.has(p.nodeId)));
  const showSections = $derived(!q.trim() && !llmOnly);

  const activeId = $derived(selectedId && dossierFor(selectedId) ? selectedId : filtered[0]?.nodeId ?? null);
  const dossier = $derived(activeId ? dossierFor(activeId) : null);
  const guide = $derived(activeId ? guideFor(activeId) : null);
  const activeNode = $derived(activeId ? nodeById.get(activeId) : null);
  const intelHits = $derived(q.trim().length >= 2 ? searchIntelligence(q).slice(0, 6) : []);
  const isDdEngine = $derived(activeId === "pi-py");

  const previewCalls = $derived((dossier?.calls ?? []).slice(0, 8));
  const previewModels = $derived((dossier?.prompting.models ?? []).slice(0, 6));
  const previewFrags = $derived((dossier?.prompting.fragments ?? []).slice(0, 4));

  /** @param {string} id @param {'overview'|'calls'|'prompts'|'sections'} [tab] */
  function pick(id, tab = "overview") {
    onselect(id);
    if (tab === "sections" && id !== "pi-py") deskTab = "overview";
    else deskTab = tab;
  }

  $effect(() => {
    if (deskTab === "sections" && activeId !== "pi-py") deskTab = "overview";
  });

  $effect(() => {
    if (!initialTab || initialTab === appliedInitial) return;
    if (initialTab === "sections" && selectedId !== "pi-py") return;
    deskTab = initialTab;
    appliedInitial = initialTab;
  });
</script>

{#snippet productRow(p)}
  {@const badge = aiBadge(p.hasLlm)}
  <li>
    <button
      type="button"
      class:active={activeId === p.nodeId}
      onclick={() => pick(p.nodeId, "overview")}
    >
      <span class="row-top">
        <span class="name">{p.title}</span>
        <span class="badge" class:llm={badge.tone === "llm"}>{p.hasLlm ? "AI" : "—"}</span>
      </span>
      <span class="one">{p.oneLiner}</span>
      <span class="meta">
        <em>{p.callCount} calls</em>
        {#if p.hasLlm}
          <i>{p.modelCount} models</i>
        {/if}
      </span>
    </button>
  </li>
{/snippet}

<div class="desk">
  <aside class="rail">
    <div class="rail-tools">
      <input type="search" placeholder="Search products, models, calls…" bind:value={q} />
      <label class="toggle" title="Only products that call an AI model">
        <input type="checkbox" bind:checked={llmOnly} />
        AI only
      </label>
    </div>

    {#if intelHits.length}
      <div class="hits">
        {#each intelHits as h}
          <button
            type="button"
            class="hit"
            onclick={() =>
              pick(
                h.nodeId,
                h.kind === "prompt" || h.kind === "model" || h.kind === "prompt-service"
                  ? "prompts"
                  : h.kind === "call"
                    ? "calls"
                    : "overview",
              )}
          >
            <span class="hit-kind">{h.kind === "call" ? "Call" : h.kind === "model" ? "Model" : h.kind === "prompt" ? "Rule" : "Product"}</span>
            <strong>{h.title}</strong>
          </button>
        {/each}
      </div>
    {/if}

    <ul class="plist">
      {#if showSections && coreFiltered.length}
        <li class="section-label">Core</li>
        {#each coreFiltered as p}
          {@render productRow(p)}
        {/each}
        {#if moreFiltered.length}
          <li class="section-label">More</li>
        {/if}
        {#each moreFiltered as p}
          {@render productRow(p)}
        {/each}
      {:else}
        {#each filtered as p}
          {@render productRow(p)}
        {/each}
      {/if}
    </ul>
  </aside>

  <section class="main">
    {#if dossier && guide}
      <header class="main-head">
        <div class="title-block">
          <p class="eyebrow">
            {domains[activeNode?.domain ?? ""]?.shortLabel ?? "Product"}
            · {dossier.calls.length} connections
            {#if dossier.prompting.hasLlm}
              · {dossier.prompting.models?.length ?? 0} model roles
            {:else}
              · no AI
            {/if}
          </p>
          <div class="title-row">
            <h2>{guide.title}</h2>
            <p class="tagline">{guide.oneLiner}</p>
          </div>
        </div>
        <div class="head-actions">
          <div class="tabs" role="tablist">
            <button type="button" class:on={deskTab === "overview"} onclick={() => (deskTab = "overview")}>
              Overview
            </button>
            {#if isDdEngine}
              <button type="button" class:on={deskTab === "sections"} onclick={() => (deskTab = "sections")}>
                DD sections
              </button>
            {/if}
            <button type="button" class:on={deskTab === "calls"} onclick={() => (deskTab = "calls")}>
              Talks to
            </button>
            <button type="button" class:on={deskTab === "prompts"} onclick={() => (deskTab = "prompts")}>
              AI
            </button>
          </div>
          <div class="head-links">
            {#if onshowmap && activeId}
              <button type="button" class="text-cta" onclick={() => onshowmap(activeId)}>Map</button>
            {/if}
            {#if onatlas && activeId}
              <button type="button" class="text-cta" onclick={() => onatlas(activeId)}>AI atlas</button>
            {/if}
          </div>
        </div>
      </header>

      <div class="main-body">
        {#if deskTab === "sections" && isDdEngine}
          <DdSectionsPanel />
        {:else if deskTab === "overview"}
          <div class="overview">
            <div class="fact-strip">
              <div>
                <h3>Does</h3>
                <p>{guide.doesThis}</p>
              </div>
              {#if guide.doesNot}
                <div class="warn">
                  <h3>Don’t confuse</h3>
                  <p>{guide.doesNot}</p>
                </div>
              {/if}
              <div>
                <h3>Who</h3>
                <p>{guide.whoFor}</p>
              </div>
              <div class:ai={dossier.prompting.hasLlm}>
                <h3>AI</h3>
                <p>{guide.aiStory}</p>
              </div>
            </div>

            {#if dossier.kindSkew?.length}
              <div class="band">
                <div class="band-head">
                  <h3>Activity mix</h3>
                  <button type="button" class="text-cta" onclick={() => (deskTab = "calls")}>All connections →</button>
                </div>
                <div class="skew">
                  {#each dossier.kindSkew as k}
                    {@const plain = plainForKind(k.kind)}
                    <button
                      type="button"
                      class="skew-chip"
                      style:--accent={plain.color}
                      title={plain.plain}
                      onclick={() => (deskTab = "calls")}
                    >
                      <strong>{plain.label}</strong>
                      {#if k.count !== undefined}<em>{k.count}</em>{/if}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}

            {#if isDdEngine}
              <div class="band dd-cta">
                <div class="band-head">
                  <h3>DD sections · per-section calls</h3>
                  <button type="button" class="text-cta" onclick={() => (deskTab = "sections")}>
                    Open full section map →
                  </button>
                </div>
                <p class="dd-hint">
                  Production order §2→3→4→5→6→7→8→9→10→12→1→11 — templates, models, RAG/web/CapIQ calls for each section, plus CJA / UE-DCF / RFW / ACS / H2H / Risk.
                </p>
              </div>
            {/if}

            <div class="split-panels">
              <div class="panel">
                <div class="band-head">
                  <h3>Talks to (top)</h3>
                  <button type="button" class="text-cta" onclick={() => (deskTab = "calls")}>
                    {dossier.calls.length} total →
                  </button>
                </div>
                <div class="mini-table">
                  <table>
                    <thead>
                      <tr><th>Activity</th><th>Why</th><th>To</th></tr>
                    </thead>
                    <tbody>
                      {#each previewCalls as c}
                        {@const plain = plainForKind(c.kind)}
                        <tr>
                          <td><span class="kind" style:--accent={plain.color}>{plain.label}</span></td>
                          <td>{c.purpose}</td>
                          <td class="mono">{c.callee}</td>
                        </tr>
                      {:else}
                        <tr><td colspan="3" class="empty-cell">No connections listed.</td></tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="panel">
                <div class="band-head">
                  <h3>{dossier.prompting.hasLlm ? "Models & rules" : "AI"}</h3>
                  <button type="button" class="text-cta" onclick={() => (deskTab = "prompts")}>
                    Full AI →
                  </button>
                </div>
                {#if dossier.prompting.hasLlm}
                  <p class="ai-sum">{dossier.prompting.summary}</p>
                  {#if previewModels.length}
                    <div class="mini-table">
                      <table>
                        <thead>
                          <tr><th>Job</th><th>Model</th></tr>
                        </thead>
                        <tbody>
                          {#each previewModels as m}
                            <tr>
                              <td>{m.role}</td>
                              <td class="mono gold">{m.model}</td>
                            </tr>
                          {/each}
                        </tbody>
                      </table>
                    </div>
                  {/if}
                  {#if previewFrags.length}
                    <ul class="frags">
                      {#each previewFrags as f}
                        <li>{f.instruction}</li>
                      {/each}
                    </ul>
                  {/if}
                {:else}
                  <p class="ai-sum">{dossier.prompting.summary}</p>
                  <p class="hint">This product still has connections — open Talks to for the full table.</p>
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <DossierView
            {dossier}
            pane={deskTab === "calls" ? "calls" : "prompts"}
            hideHero
            compact
          />
        {/if}
      </div>
    {:else if dossier}
      <div class="main-body">
        <DossierView {dossier} pane="both" compact />
      </div>
    {:else}
      <div class="empty">Choose a product on the left.</div>
    {/if}
  </section>
</div>

<style>
  .desk {
    display: grid;
    grid-template-columns: minmax(200px, 240px) 1fr;
    height: 100%;
    min-height: 0;
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    background: var(--panel);
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .rail {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-right: 1px solid var(--line);
    background: rgba(40, 32, 20, 0.04);
  }

  .rail-tools {
    padding: 10px 10px 8px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
    border-bottom: 1px solid var(--line);
  }

  .rail-tools input {
    width: 100%;
    padding: 7px 9px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: #fff;
    color: var(--fg);
    font-size: 0.78rem;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.7rem;
    color: var(--fg-mute);
    white-space: nowrap;
  }

  .hits {
    padding: 6px 8px;
    max-height: 120px;
    overflow: auto;
    border-bottom: 1px solid var(--line);
    display: grid;
    gap: 3px;
  }

  .hit {
    display: flex;
    gap: 8px;
    align-items: baseline;
    width: 100%;
    text-align: left;
    padding: 5px 7px;
    border-radius: 6px;
    background: rgba(196, 163, 90, 0.06);
    border: 1px solid rgba(196, 163, 90, 0.18);
  }

  .hit-kind {
    flex-shrink: 0;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .hit strong {
    font-size: 0.72rem;
    font-weight: 550;
    color: var(--fg);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .plist {
    list-style: none;
    margin: 0;
    padding: 4px;
    overflow: auto;
    min-height: 0;
    flex: 1;
  }

  .section-label {
    margin: 8px 6px 3px;
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 600;
  }

  .plist button {
    width: 100%;
    text-align: left;
    padding: 7px 8px;
    border-radius: 8px;
    display: grid;
    gap: 2px;
    margin-bottom: 2px;
    border: 1px solid transparent;
  }

  .plist button:hover {
    background: rgba(28, 25, 20, 0.04);
  }

  .plist button.active {
    background: rgba(196, 163, 90, 0.14);
    border-color: rgba(196, 163, 90, 0.35);
  }

  .row-top {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    align-items: center;
  }

  .name {
    font-weight: 600;
    color: var(--fg);
    font-size: 0.8rem;
    line-height: 1.2;
  }

  .badge {
    flex-shrink: 0;
    font-size: 0.6rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 2px 5px;
    border-radius: 999px;
    border: 1px solid var(--line);
    color: var(--fg-mute);
  }

  .badge.llm {
    color: var(--gold-soft);
    border-color: rgba(196, 163, 90, 0.4);
    background: rgba(196, 163, 90, 0.1);
  }

  .one {
    font-size: 0.68rem;
    color: var(--fg-mute);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    display: flex;
    gap: 8px;
    font-size: 0.64rem;
  }

  .meta em {
    font-style: normal;
    color: var(--cyan);
  }

  .meta i {
    font-style: normal;
    color: var(--gold-soft);
  }

  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .main-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid var(--line);
    flex-wrap: wrap;
    background: rgba(40, 32, 20, 0.035);
  }

  .eyebrow {
    margin: 0 0 2px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 10px 14px;
  }

  .main-head h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 550;
    letter-spacing: -0.02em;
  }

  .tagline {
    margin: 0;
    font-size: 0.78rem;
    color: var(--fg-mute);
    max-width: 36rem;
    line-height: 1.35;
  }

  .head-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .head-links {
    display: flex;
    gap: 10px;
  }

  .text-cta {
    font-size: 0.72rem;
    color: var(--cyan);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: rgba(47, 111, 138, 0.35);
  }

  .tabs {
    display: flex;
    gap: 3px;
  }

  .tabs button {
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid var(--line);
    color: var(--fg-mute);
    font-size: 0.72rem;
  }

  .tabs button.on {
    background: rgba(196, 163, 90, 0.16);
    border-color: rgba(196, 163, 90, 0.4);
    color: var(--gold-soft);
    font-weight: 560;
  }

  .main-body {
    padding: 12px 14px 16px;
    overflow: auto;
    min-height: 0;
    flex: 1;
  }

  .empty {
    padding: 32px;
    color: var(--fg-mute);
    font-size: 0.85rem;
  }

  .overview {
    display: grid;
    gap: 12px;
  }

  .dd-cta {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgba(47, 111, 138, 0.28);
    background: rgba(47, 111, 138, 0.06);
  }

  .dd-hint {
    margin: 0;
    font-size: 0.74rem;
    color: var(--fg-dim);
    line-height: 1.35;
  }

  .fact-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .fact-strip > div {
    padding: 9px 10px;
    border-radius: 8px;
    background: rgba(28, 25, 20, 0.03);
    border: 1px solid var(--line);
    min-height: 0;
  }

  .fact-strip h3 {
    margin: 0 0 4px;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-mute);
    font-weight: 600;
  }

  .fact-strip p {
    margin: 0;
    font-size: 0.76rem;
    color: var(--fg);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .fact-strip .warn {
    border-color: rgba(224, 122, 106, 0.35);
    background: rgba(224, 122, 106, 0.07);
  }

  .fact-strip .ai {
    border-color: rgba(196, 163, 90, 0.35);
    background: rgba(196, 163, 90, 0.07);
  }

  .band-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
  }

  .band-head h3,
  .panel h3 {
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-mute);
    font-weight: 600;
  }

  .skew {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .skew-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: 0.7rem;
  }

  .skew-chip strong {
    font-weight: 550;
    color: var(--fg);
  }

  .skew-chip em {
    font-style: normal;
    color: var(--gold);
    font-variant-numeric: tabular-nums;
  }

  .split-panels {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 10px;
    min-height: 0;
  }

  .panel {
    min-width: 0;
    padding: 8px 10px 10px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: rgba(28, 25, 20, 0.02);
  }

  .ai-sum {
    margin: 0 0 8px;
    font-size: 0.74rem;
    color: var(--fg-dim);
    line-height: 1.35;
  }

  .hint {
    margin: 0;
    font-size: 0.72rem;
    color: var(--fg-mute);
  }

  .mini-table {
    overflow: auto;
    max-height: 220px;
    border-radius: 6px;
    border: 1px solid var(--line);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.7rem;
  }

  th,
  td {
    padding: 5px 7px;
    text-align: left;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }

  th {
    position: sticky;
    top: 0;
    background: rgba(255, 252, 247, 0.96);
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-mute);
    z-index: 1;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.66rem;
    word-break: break-word;
  }

  .gold {
    color: var(--gold-soft);
  }

  .kind {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: 0.64rem;
    font-weight: 550;
    white-space: nowrap;
  }

  .empty-cell {
    color: var(--fg-mute);
  }

  .frags {
    margin: 8px 0 0;
    padding-left: 14px;
    font-size: 0.7rem;
    color: var(--fg-dim);
    line-height: 1.35;
  }

  .frags li {
    margin-bottom: 4px;
  }

  @media (max-width: 1100px) {
    .fact-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .split-panels {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .desk {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .rail {
      max-height: 30vh;
      border-right: none;
      border-bottom: 1px solid var(--line);
    }

    .fact-strip {
      grid-template-columns: 1fr;
    }

    .fact-strip p {
      -webkit-line-clamp: 3;
    }
  }
</style>

<script>
  import {
    dossierFor,
    intelligenceProjects,
  } from "$lib/ecosystem/intelligence.js";
  import { guideFor, plainForKind } from "$lib/ecosystem/plainGuide.js";
  import { domains, nodeById } from "$lib/ecosystem/index.js";

  /**
   * @type {{
   *   selectedId: string|null,
   *   onselect: (id: string) => void,
   *   onopendesk?: (id: string) => void,
   *   onshowmap?: (id: string) => void,
   * }}
   */
  let { selectedId = null, onselect, onopendesk, onshowmap } = $props();

  /** @type {'products'|'kinds'|'rules'} */
  let mode = $state("products");
  let kindFilter = $state("");

  const projects = $derived(
    intelligenceProjects().map((p) => {
      const d = dossierFor(p.nodeId);
      const g = guideFor(p.nodeId);
      return {
        ...p,
        title: g?.title ?? p.project,
        oneLiner: g?.oneLiner ?? p.summary,
        dossier: d,
        domain: nodeById.get(p.nodeId)?.domain,
      };
    }),
  );

  const aiProjects = $derived(projects.filter((p) => p.hasLlm));
  const noAiProjects = $derived(projects.filter((p) => !p.hasLlm));

  const activeId = $derived(
    selectedId && dossierFor(selectedId) ? selectedId : aiProjects[0]?.nodeId ?? null,
  );
  const active = $derived(projects.find((p) => p.nodeId === activeId) ?? null);
  const dossier = $derived(active?.dossier ?? null);
  const guide = $derived(activeId ? guideFor(activeId) : null);

  /** Estate-wide call-kind rollup */
  const kindRollup = $derived.by(() => {
    /** @type {Map<string, { kind: string, count: number, products: Set<string> }>} */
    const map = new Map();
    for (const p of projects) {
      const d = p.dossier;
      if (!d) continue;
      for (const c of d.calls) {
        const base = c.kind.split(":")[0];
        const row = map.get(base) ?? { kind: base, count: 0, products: new Set() };
        row.count += 1;
        row.products.add(p.nodeId);
        map.set(base, row);
      }
    }
    return [...map.values()]
      .map((r) => ({
        kind: r.kind,
        count: r.count,
        productCount: r.products.size,
        ...plainForKind(r.kind),
      }))
      .sort((a, b) => b.count - a.count);
  });

  /** All model roles across AI products */
  const allModels = $derived.by(() => {
    /** @type {{ nodeId: string, title: string, role: string, model: string, env?: string }[]} */
    const rows = [];
    for (const p of aiProjects) {
      for (const m of p.dossier?.prompting.models ?? []) {
        rows.push({
          nodeId: p.nodeId,
          title: p.title,
          role: m.role,
          model: m.model,
          env: m.env,
        });
      }
    }
    return rows;
  });

  /** All writing-rule fragments */
  const allFragments = $derived.by(() => {
    /** @type {{ nodeId: string, title: string, location: string, instruction: string }[]} */
    const rows = [];
    for (const p of aiProjects) {
      for (const f of p.dossier?.prompting.fragments ?? []) {
        rows.push({
          nodeId: p.nodeId,
          title: p.title,
          location: f.location,
          instruction: f.instruction,
        });
      }
    }
    return rows;
  });

  const filteredModels = $derived(
    kindFilter
      ? allModels.filter((m) => m.nodeId === kindFilter)
      : allModels,
  );

  const filteredFragments = $derived(
    kindFilter
      ? allFragments.filter((f) => f.nodeId === kindFilter)
      : allFragments,
  );

  /** @param {string} id */
  function pick(id) {
    onselect(id);
    mode = "products";
  }
</script>

<div class="atlas">
  <header class="hero">
    <div>
      <p class="kicker">AI &amp; calls</p>
      <h2>Every prompt job, model, and connection type</h2>
      <p class="lede">
        Cross-project map from the knowledge base. Tap a product for its models and writing rules;
        use <strong>Call types</strong> to see what kind of work each connection is.
      </p>
    </div>
    <div class="stats">
      <div><strong>{aiProjects.length}</strong><span>products use AI</span></div>
      <div><strong>{allModels.length}</strong><span>model roles</span></div>
      <div><strong>{allFragments.length}</strong><span>key writing rules</span></div>
      <div><strong>{kindRollup.length}</strong><span>call types</span></div>
    </div>
  </header>

  <div class="modes" role="tablist">
    <button type="button" class:on={mode === "products"} onclick={() => (mode = "products")}>
      By product
    </button>
    <button type="button" class:on={mode === "kinds"} onclick={() => (mode = "kinds")}>
      Call types
    </button>
    <button type="button" class:on={mode === "rules"} onclick={() => (mode = "rules")}>
      Models &amp; rules
    </button>
  </div>

  {#if mode === "kinds"}
    <section class="kinds-panel">
      <p class="hint">
        Shared taxonomy — the same labels appear in each product’s <em>Talks to</em> table.
      </p>
      <div class="kind-grid">
        {#each kindRollup as k}
          <article class="kind-card" style:--accent={k.color}>
            <h3>{k.label}</h3>
            <p>{k.plain}</p>
            <footer>
              <span>{k.count} connections</span>
              <span>{k.productCount} products</span>
              <code>{k.kind}</code>
            </footer>
          </article>
        {/each}
      </div>
    </section>
  {:else if mode === "rules"}
    <section class="rules-panel">
      <div class="filter-row">
        <label>
          Filter by product
          <select bind:value={kindFilter}>
            <option value="">All AI products</option>
            {#each aiProjects as p}
              <option value={p.nodeId}>{p.title}</option>
            {/each}
          </select>
        </label>
      </div>

      <h3>Models by job</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Job</th>
              <th>Model</th>
              <th>Config</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredModels as m}
              <tr>
                <td>
                  <button type="button" class="linkish" onclick={() => pick(m.nodeId)}>{m.title}</button>
                </td>
                <td>{m.role}</td>
                <td class="mono gold">{m.model}</td>
                <td class="mute mono">{m.env ?? "—"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <h3>Key writing rules</h3>
      <div class="frag-grid">
        {#each filteredFragments as f}
          <article>
            <button type="button" class="linkish" onclick={() => pick(f.nodeId)}>{f.title}</button>
            <p>{f.instruction}</p>
            <code>{f.location}</code>
          </article>
        {:else}
          <p class="empty">No fragment rows for this filter — open the product guide for the full corpus path.</p>
        {/each}
      </div>
    </section>
  {:else}
    <div class="split">
      <aside class="rail">
        <p class="rail-label">Uses AI</p>
        <ul>
          {#each aiProjects as p}
            <li>
              <button type="button" class:active={activeId === p.nodeId} onclick={() => pick(p.nodeId)}>
                <span class="name">{p.title}</span>
                <span class="meta">
                  {p.modelCount} models · {p.callCount} calls
                  {#if p.fragmentCount}
                    · {p.fragmentCount} rules
                  {/if}
                </span>
              </button>
            </li>
          {/each}
        </ul>
        <p class="rail-label muted">No AI (still has calls)</p>
        <ul class="no-ai">
          {#each noAiProjects as p}
            <li>
              <button type="button" class:active={activeId === p.nodeId} onclick={() => pick(p.nodeId)}>
                <span class="name">{p.title}</span>
                <span class="meta">{p.callCount} connections</span>
              </button>
            </li>
          {/each}
        </ul>
      </aside>

      <section class="main">
        {#if dossier && guide && active}
          <header class="main-head">
            <div>
              <p class="eyebrow">
                {domains[active.domain ?? ""]?.shortLabel ?? "Product"} · prompts &amp; calls
              </p>
              <h3>{guide.title}</h3>
              <p>{guide.aiStory}</p>
            </div>
            <div class="actions">
              {#if onopendesk}
                <button type="button" class="cta" onclick={() => onopendesk(active.nodeId)}>
                  Full guide →
                </button>
              {/if}
              {#if onshowmap}
                <button type="button" class="cta ghost" onclick={() => onshowmap(active.nodeId)}>
                  Show on map
                </button>
              {/if}
            </div>
          </header>

          <p class="summary">{dossier.prompting.summary}</p>

          {#if dossier.prompting.corpus}
            <p class="corpus"><span>Prompt files</span> {dossier.prompting.corpus}</p>
          {/if}

          {#if dossier.kindSkew?.length}
            <h4>Activity mix</h4>
            <div class="skew">
              {#each dossier.kindSkew as k}
                {@const plain = plainForKind(k.kind)}
                <div class="skew-chip" style:--accent={plain.color} title={plain.plain}>
                  <strong>{plain.label}</strong>
                  {#if k.count !== undefined}<em>{k.count}</em>{/if}
                  <span>{k.role}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if dossier.prompting.models?.length}
            <h4>Models by job</h4>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>Job</th><th>Model</th><th>Config</th></tr>
                </thead>
                <tbody>
                  {#each dossier.prompting.models as m}
                    <tr>
                      <td>{m.role}</td>
                      <td class="mono gold">{m.model}</td>
                      <td class="mute mono">{m.env ?? "—"}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else if !dossier.prompting.hasLlm}
            <p class="empty">No AI models — connections are fetches, storage, auth, or media only.</p>
          {/if}

          {#if dossier.prompting.pipeline?.length}
            <h4>How the work flows</h4>
            <ol class="pipe">
              {#each dossier.prompting.pipeline as step}<li>{step}</li>{/each}
            </ol>
          {/if}

          {#if dossier.prompting.fragments?.length}
            <h4>Key writing rules</h4>
            <div class="frag-grid">
              {#each dossier.prompting.fragments as f}
                <article>
                  <p>{f.instruction}</p>
                  <code>{f.location}</code>
                </article>
              {/each}
            </div>
          {/if}

          {#if dossier.prompting.services?.length}
            <h4>AI helper jobs</h4>
            <ul class="svc">
              {#each dossier.prompting.services as s}
                <li><strong>{s.name}</strong> — {s.job}</li>
              {/each}
            </ul>
          {/if}

          <h4>Connections ({dossier.calls.length})</h4>
          <div class="table-wrap short">
            <table>
              <thead>
                <tr><th>Activity</th><th>Why</th><th>Talks to</th></tr>
              </thead>
              <tbody>
                {#each dossier.calls as c}
                  {@const plain = plainForKind(c.kind)}
                  <tr>
                    <td><span class="kind" style:--accent={plain.color}>{plain.label}</span></td>
                    <td>{c.purpose}</td>
                    <td class="mono">{c.callee}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="empty">Pick a product on the left.</p>
        {/if}
      </section>
    </div>
  {/if}
</div>

<style>
  .atlas {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    background: var(--panel);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .hero {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    padding: 12px 16px 10px;
    border-bottom: 1px solid var(--line);
  }

  .kicker {
    margin: 0 0 2px;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .hero h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 550;
  }

  .lede {
    margin: 4px 0 0;
    max-width: 56ch;
    font-size: 0.76rem;
    color: var(--fg-mute);
    line-height: 1.35;
  }

  .stats {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .stats div {
    display: grid;
    gap: 2px;
    min-width: 72px;
  }

  .stats strong {
    font-size: 1.25rem;
    color: var(--fg);
    font-variant-numeric: tabular-nums;
  }

  .stats span {
    font-size: 0.68rem;
    color: var(--fg-mute);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .modes {
    display: flex;
    gap: 6px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--line);
  }

  .modes button {
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 0.8rem;
    border: 1px solid transparent;
    color: var(--fg-mute);
  }

  .modes button.on {
    background: rgba(196, 163, 90, 0.16);
    border-color: rgba(196, 163, 90, 0.4);
    color: var(--fg);
    font-weight: 560;
  }

  .split {
    display: grid;
    grid-template-columns: minmax(220px, 280px) 1fr;
    min-height: 0;
    flex: 1;
  }

  .rail {
    border-right: 1px solid var(--line);
    overflow: auto;
    padding: 10px 8px;
    background: rgba(40, 32, 20, 0.04);
  }

  .rail-label {
    margin: 8px 8px 6px;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 600;
  }

  .rail-label.muted {
    margin-top: 16px;
    color: var(--fg-mute);
  }

  .rail ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rail button {
    width: 100%;
    text-align: left;
    padding: 9px 10px;
    border-radius: 10px;
    display: grid;
    gap: 2px;
    margin-bottom: 3px;
    border: 1px solid transparent;
  }

  .rail button:hover {
    background: rgba(28, 25, 20, 0.05);
  }

  .rail button.active {
    background: rgba(196, 163, 90, 0.14);
    border-color: rgba(196, 163, 90, 0.35);
  }

  .rail .name {
    font-weight: 600;
    font-size: 0.86rem;
  }

  .rail .meta {
    font-size: 0.7rem;
    color: var(--fg-mute);
  }

  .no-ai .name {
    font-weight: 500;
  }

  .main {
    overflow: auto;
    padding: 16px 18px 24px;
    min-height: 0;
  }

  .main-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .eyebrow {
    margin: 0 0 4px;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .main-head h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 550;
  }

  .main-head p {
    margin: 6px 0 0;
    font-size: 0.84rem;
    color: var(--fg-mute);
    max-width: 60ch;
    line-height: 1.4;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .cta {
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(196, 163, 90, 0.18);
    border: 1px solid rgba(196, 163, 90, 0.4);
    font-size: 0.8rem;
    font-weight: 550;
  }

  .cta.ghost {
    background: transparent;
    border-color: var(--line);
    color: var(--fg-mute);
  }

  .summary {
    margin: 0 0 12px;
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .corpus {
    margin: 0 0 14px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(28, 25, 20, 0.04);
    font-size: 0.76rem;
    line-height: 1.4;
    word-break: break-word;
  }

  .corpus span {
    display: block;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 4px;
  }

  h4 {
    margin: 18px 0 8px;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-mute);
  }

  .skew {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .skew-chip {
    display: grid;
    gap: 2px;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    max-width: 220px;
  }

  .skew-chip strong {
    font-size: 0.76rem;
  }

  .skew-chip em {
    font-style: normal;
    font-size: 0.72rem;
    color: var(--gold);
  }

  .skew-chip span {
    font-size: 0.7rem;
    color: var(--fg-mute);
    line-height: 1.3;
  }

  .table-wrap {
    overflow: auto;
    border: 1px solid var(--line);
    border-radius: 10px;
  }

  .table-wrap.short {
    max-height: 280px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
  }

  th,
  td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }

  th {
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-mute);
    background: rgba(28, 25, 20, 0.03);
  }

  .mono {
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.74rem;
    word-break: break-word;
  }

  .gold {
    color: var(--gold-soft);
  }

  .mute {
    color: var(--fg-mute);
  }

  .kind {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    font-size: 0.7rem;
    font-weight: 550;
  }

  .pipe {
    margin: 0;
    padding-left: 18px;
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--fg-dim);
  }

  .frag-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 8px;
  }

  .frag-grid article {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: rgba(28, 25, 20, 0.03);
  }

  .frag-grid p {
    margin: 6px 0;
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .frag-grid code {
    font-size: 0.68rem;
    color: var(--fg-mute);
    word-break: break-all;
  }

  .svc {
    margin: 0;
    padding-left: 18px;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .linkish {
    background: none;
    border: none;
    padding: 0;
    color: var(--gold-soft);
    text-decoration: underline;
    text-underline-offset: 2px;
    font: inherit;
    cursor: pointer;
  }

  .empty {
    color: var(--fg-mute);
    font-size: 0.85rem;
  }

  .kinds-panel,
  .rules-panel {
    overflow: auto;
    padding: 14px 18px 24px;
    flex: 1;
    min-height: 0;
  }

  .hint {
    margin: 0 0 12px;
    font-size: 0.8rem;
    color: var(--fg-mute);
  }

  .kind-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
  }

  .kind-card {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--line));
    background: color-mix(in srgb, var(--accent) 8%, var(--panel));
  }

  .kind-card h3 {
    margin: 0 0 6px;
    font-size: 0.92rem;
  }

  .kind-card p {
    margin: 0;
    font-size: 0.78rem;
    color: var(--fg-mute);
    line-height: 1.4;
  }

  .kind-card footer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
    font-size: 0.7rem;
    color: var(--fg-dim);
  }

  .kind-card code {
    margin-left: auto;
    opacity: 0.7;
  }

  .filter-row {
    margin-bottom: 12px;
  }

  .filter-row label {
    display: grid;
    gap: 4px;
    font-size: 0.72rem;
    color: var(--fg-mute);
    max-width: 280px;
  }

  .filter-row select {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: var(--panel);
    color: var(--fg);
  }

  .rules-panel h3 {
    margin: 16px 0 8px;
    font-size: 0.95rem;
  }

  @media (max-width: 900px) {
    .split {
      grid-template-columns: 1fr;
    }

    .rail {
      max-height: 220px;
      border-right: none;
      border-bottom: 1px solid var(--line);
    }
  }
</style>

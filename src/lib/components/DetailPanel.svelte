<script>
  import DossierView from "./DossierView.svelte";
  import {
    businessFunctions,
    domains,
    edgeById,
    edgeTypeMeta,
    journeys,
    neighbors,
    nodeById,
    schedulers,
  } from "$lib/ecosystem/index.js";
  import { dossierFor } from "$lib/ecosystem/intelligence.js";
  import { guideFor } from "$lib/ecosystem/plainGuide.js";

  /**
   * @type {{
   *   nodeId: string|null,
   *   edgeId: string|null,
   *   onclose: () => void,
   *   onnavigate: (id: string) => void,
   *   onedge: (id: string) => void,
   *   onupstream: (id: string) => void,
   *   ondownstream: (id: string) => void,
   *   onblast: (id: string) => void,
   *   onopendesk?: (id: string) => void,
   *   onjourney?: (id: string) => void,
   *   onbusiness?: (id: string) => void,
   * }}
   */
  let {
    nodeId = null,
    edgeId = null,
    onclose,
    onnavigate,
    onedge,
    onupstream,
    ondownstream,
    onblast,
    onopendesk,
    onjourney,
    onbusiness,
  } = $props();

  const node = $derived(nodeId ? nodeById.get(nodeId) ?? null : null);
  const edge = $derived(edgeId ? edgeById.get(edgeId) ?? null : null);
  const neigh = $derived(node ? neighbors(node.id) : { inbound: [], outbound: [] });
  const dossier = $derived(node ? dossierFor(node.id) : null);
  const relatedJourneys = $derived(
    node ? journeys.filter((j) => j.steps.includes(node.id)).slice(0, 4) : [],
  );
  const relatedJobs = $derived(
    node ? schedulers.filter((s) => s.ownerNodeId === node.id) : [],
  );
  const relatedBusiness = $derived(
    node
      ? businessFunctions.filter((b) => node.business?.includes(b.id) || b.nodeIds.includes(node.id))
      : [],
  );

  /** @type {'overview'|'calls'|'prompts'} */
  let tab = $state("overview");

  $effect(() => {
    // reset tab when selection changes
    nodeId;
    edgeId;
    tab = "overview";
  });
</script>

<aside class="panel" class:open={!!(node || edge)} class:wide={!!dossier && tab !== "overview"}>
  <header class="head">
    <button class="icon" onclick={onclose} aria-label="Close panel">✕</button>
    {#if node}
      {@const g = guideFor(node.id)}
      <p class="eyebrow">{domains[node.domain]?.shortLabel ?? domains[node.domain]?.name ?? node.domain}</p>
      <h2>{g?.title ?? node.name}</h2>
      <p class="short">{g?.oneLiner ?? node.purpose}</p>
      {#if dossier}
        <div class="tabs" role="tablist">
          <button type="button" class:on={tab === "overview"} onclick={() => (tab = "overview")}>Simple</button>
          <button type="button" class:on={tab === "calls"} onclick={() => (tab = "calls")}>
            Talks to
          </button>
          <button type="button" class:on={tab === "prompts"} onclick={() => (tab = "prompts")}>AI</button>
        </div>
      {/if}
    {:else if edge}
      <p class="eyebrow">Connection</p>
      <h2>
        {nodeById.get(edge.source)?.shortName ?? edge.source}
        <span class="arrow">→</span>
        {nodeById.get(edge.target)?.shortName ?? edge.target}
      </h2>
      <p class="short">{edge.label}</p>
    {/if}
  </header>

  <div class="body">
    {#if node && dossier && tab === "calls"}
      <DossierView {dossier} pane="calls" compact />
    {:else if node && dossier && tab === "prompts"}
      <DossierView {dossier} pane="prompts" compact />
    {:else if node}
      {@const g = guideFor(node.id)}
      <section>
        <h3>In plain English</h3>
        <p>{g?.doesThis ?? node.purpose}</p>
        {#if g?.doesNot}
          <p class="teaser-warn"><strong>Don’t confuse:</strong> {g.doesNot}</p>
        {:else if node.why}
          <p class="why"><strong>Why it exists.</strong> {node.why}</p>
        {/if}
      </section>

      {#if g?.aiStory}
        <section>
          <h3>AI</h3>
          <p>{g.aiStory}</p>
        </section>
      {/if}

      <section class="actions">
        {#if dossier && onopendesk}
          <button onclick={() => onopendesk(node.id)}>Open full guide</button>
        {/if}
        {#if node.id === "pi-py" && onopendesk}
          <button onclick={() => onopendesk(node.id, "sections")}>DD sections (per-section calls)</button>
        {/if}
        <button onclick={() => onblast(node.id)}>What breaks if this fails?</button>
      </section>

      {#if relatedJourneys.length}
        <section>
          <h3>Related walkthroughs</h3>
          <ul class="rels">
            {#each relatedJourneys as j}
              <li>
                {#if onjourney}
                  <button class="linkish" onclick={() => onjourney(j.id)}>{j.name}</button>
                {:else}
                  <span class="linkish">{j.name}</span>
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <details class="tech">
        <summary>Technical details</summary>
        {#if node.stack?.length}
          <div class="chips">
            {#each node.stack as s}
              <span>{s}</span>
            {/each}
          </div>
        {/if}
        <ul>
          {#if node.repo}<li><span>Repo</span> {node.repo}</li>{/if}
          {#if node.runtime}<li><span>Runtime</span> {node.runtime}</li>{/if}
          {#each node.urls ?? [] as u}
            <li><span>URL</span> <a href={u} target="_blank" rel="noreferrer">{u}</a></li>
          {/each}
          {#if node.name !== (g?.title ?? node.name)}
            <li><span>System name</span> {node.name}</li>
          {/if}
        </ul>
        {#if relatedJobs.length}
          <p class="tech-jobs">Scheduled jobs: {relatedJobs.map((j) => j.name).join(", ")}</p>
        {/if}
      </details>
    {:else if edge}
      <section>
        <h3>Why this link exists</h3>
        <p>{edge.description}</p>
      </section>
      <section>
        <h3>About this link</h3>
        <ul>
          <li><span>Kind</span> {edgeTypeMeta[edge.type]?.label ?? edge.type}</li>
          <li><span>How sure</span> {edge.confidence}</li>
        </ul>
      </section>
      {#if edge.endpoints?.length}
        <section>
          <h3>Endpoints</h3>
          <ul class="mono">
            {#each edge.endpoints as ep}<li>{ep}</li>{/each}
          </ul>
        </section>
      {/if}
      {#if edge.files?.length}
        <section>
          <h3>Source files</h3>
          <ul class="mono">
            {#each edge.files as f}<li>{f}</li>{/each}
          </ul>
        </section>
      {/if}
      <section>
        <h3>Evidence</h3>
        <ul class="mono">
          {#each edge.evidence as ev}<li>.cursor/{ev}</li>{/each}
        </ul>
      </section>
      <section class="actions">
        <button onclick={() => onnavigate(edge.source)}>Open source</button>
        <button onclick={() => onnavigate(edge.target)}>Open target</button>
      </section>
    {/if}
  </div>
</aside>

<style>
  .panel {
    position: absolute;
    top: 12px;
    right: 12px;
    bottom: 12px;
    width: min(380px, calc(100vw - 24px));
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    display: flex;
    flex-direction: column;
    transform: translateX(110%);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 320ms cubic-bezier(0.22, 0.9, 0.2, 1),
      opacity 220ms ease,
      width 260ms cubic-bezier(0.22, 0.9, 0.2, 1);
    z-index: 5;
  }

  .panel.wide {
    width: min(720px, calc(100vw - 24px));
  }

  .panel.open {
    transform: none;
    opacity: 1;
    pointer-events: auto;
    animation: fade-up 320ms ease;
  }

  .head {
    padding: 18px 18px 12px;
    border-bottom: 1px solid var(--line);
    position: relative;
  }

  .icon {
    position: absolute;
    right: 12px;
    top: 12px;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: var(--fg-dim);
    background: rgba(255, 255, 255, 0.04);
  }

  .eyebrow {
    margin: 0 0 6px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  h2 {
    margin: 0 36px 4px 0;
    font-family: var(--font-display);
    font-weight: 550;
    font-size: 1.35rem;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .arrow {
    color: var(--gold-soft);
    margin: 0 0.2em;
  }

  .short {
    margin: 0;
    color: var(--fg-dim);
    font-size: 0.85rem;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 12px;
  }

  .tabs button {
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid var(--line);
    color: var(--fg-dim);
    font-size: 0.72rem;
  }

  .tabs button.on {
    background: rgba(196, 163, 90, 0.15);
    border-color: rgba(196, 163, 90, 0.4);
    color: var(--gold-soft);
  }

  .body {
    padding: 8px 18px 20px;
    overflow: auto;
    min-height: 0;
  }

  section {
    margin-top: 16px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg-mute);
    font-weight: 500;
  }

  p {
    margin: 0;
    color: var(--fg-dim);
    font-size: 0.92rem;
  }

  .why {
    margin-top: 8px;
    color: var(--fg);
  }

  .tip-line {
    margin: 4px 0 12px;
    font-size: 0.8rem;
    color: var(--fg-mute);
  }

  .inline-link {
    color: var(--gold);
    text-decoration: underline;
    text-underline-offset: 2px;
    font-size: inherit;
  }

  .tech {
    margin-top: 8px;
    border-top: 1px solid var(--line);
    padding-top: 10px;
  }

  .tech summary {
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--fg-mute);
    margin-bottom: 8px;
  }

  .tech .chips {
    margin-bottom: 8px;
  }

  .tech-jobs {
    margin-top: 8px;
    font-size: 0.78rem;
    color: var(--fg-mute);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  ul li {
    display: flex;
    gap: 10px;
    padding: 5px 0;
    font-size: 0.86rem;
    color: var(--fg-dim);
    border-bottom: 1px solid var(--line);
  }

  ul li span {
    flex: 0 0 72px;
    color: var(--fg-mute);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  ul.mono li,
  .mono {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 0.78rem;
  }

  a {
    color: var(--cyan);
    text-decoration: none;
    word-break: break-all;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chips span {
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--line);
    font-size: 0.75rem;
    color: var(--fg-dim);
  }

  .chips.gold span {
    border-color: rgba(196, 163, 90, 0.35);
    color: var(--gold-soft);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .actions button,
  .teaser-actions button {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(196, 163, 90, 0.12);
    border: 1px solid rgba(196, 163, 90, 0.35);
    color: var(--gold-soft);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .actions button:hover {
    background: rgba(138, 106, 47, 0.16);
  }

  .intel-teaser p {
    margin-bottom: 8px;
  }

  .teaser-warn {
    font-size: 0.82rem !important;
    color: var(--rose) !important;
    line-height: 1.35;
  }

  .desk-link {
    margin-top: 14px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(196, 163, 90, 0.35);
    background: rgba(196, 163, 90, 0.1);
    color: var(--gold-soft);
    font-size: 0.82rem;
    font-weight: 500;
  }

  .rels li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .linkish {
    color: var(--fg);
    font-weight: 500;
    text-align: left;
  }

  .edge-chip {
    font-size: 0.7rem;
    color: var(--cyan);
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(126, 184, 212, 0.1);
  }

  .empty {
    font-size: 0.85rem;
    color: var(--fg-mute);
  }

  .chip-btn {
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--line);
    font-size: 0.75rem;
    color: var(--fg-dim);
  }

  .chip-btn:hover {
    border-color: rgba(196, 163, 90, 0.45);
    color: var(--gold-soft);
  }

  .jobs {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .jobs li {
    display: grid !important;
    gap: 2px;
    padding: 8px 0 !important;
  }

  .jobs strong {
    color: var(--fg);
    font-size: 0.86rem;
  }

  .jobs span {
    flex: none !important;
    color: var(--cyan);
    font-size: 0.72rem !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
  }

  .jobs em {
    font-style: normal;
    color: var(--fg-mute);
    font-size: 0.78rem;
  }

  @media (max-width: 900px) {
    .panel {
      top: auto;
      bottom: 12px;
      right: 12px;
      left: 12px;
      width: auto;
      max-height: min(58vh, 520px);
      border-radius: 16px;
      transform: translateY(120%);
    }
    .panel.wide {
      width: auto;
    }
    .panel.open {
      transform: translateY(0);
    }
  }
</style>

<script>
  import {
    domains,
    edgeById,
    edgeTypeMeta,
    neighbors,
    nodeById,
  } from "$lib/ecosystem/index.js";

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
  } = $props();

  const node = $derived(nodeId ? nodeById.get(nodeId) ?? null : null);
  const edge = $derived(edgeId ? edgeById.get(edgeId) ?? null : null);
  const neigh = $derived(node ? neighbors(node.id) : { inbound: [], outbound: [] });
</script>

<aside class="panel" class:open={!!(node || edge)}>
  <header class="head">
    <button class="icon" onclick={onclose} aria-label="Close panel">✕</button>
    {#if node}
      <p class="eyebrow">{domains[node.domain]?.name ?? node.domain}</p>
      <h2>{node.name}</h2>
      <p class="short">{node.shortName} · {node.kind} · {node.techLayer}</p>
    {:else if edge}
      <p class="eyebrow">Relationship · {edge.confidence}</p>
      <h2>
        {nodeById.get(edge.source)?.shortName ?? edge.source}
        <span class="arrow">→</span>
        {nodeById.get(edge.target)?.shortName ?? edge.target}
      </h2>
      <p class="short">{edgeTypeMeta[edge.type]?.label ?? edge.type} · {edge.label}</p>
    {/if}
  </header>

  <div class="body">
    {#if node}
      <section>
        <h3>Purpose</h3>
        <p>{node.purpose}</p>
        {#if node.why}
          <p class="why"><strong>Why it exists.</strong> {node.why}</p>
        {/if}
      </section>

      <section class="actions">
        <button onclick={() => onupstream(node.id)}>Upstream</button>
        <button onclick={() => ondownstream(node.id)}>Downstream</button>
        <button onclick={() => onblast(node.id)}>Blast radius</button>
      </section>

      {#if node.stack?.length}
        <section>
          <h3>Stack</h3>
          <div class="chips">
            {#each node.stack as s}
              <span>{s}</span>
            {/each}
          </div>
        </section>
      {/if}

      {#if node.runtime || node.repo || node.urls?.length}
        <section>
          <h3>Location</h3>
          <ul>
            {#if node.repo}<li><span>Repo</span> {node.repo}</li>{/if}
            {#if node.runtime}<li><span>Runtime</span> {node.runtime}</li>{/if}
            {#each node.urls ?? [] as u}
              <li><span>URL</span> <a href={u} target="_blank" rel="noreferrer">{u}</a></li>
            {/each}
            {#if node.kb}<li><span>KB</span> .cursor/{node.kb}</li>{/if}
          </ul>
        </section>
      {/if}

      {#if node.apis?.length}
        <section>
          <h3>APIs / entry</h3>
          <ul class="mono">
            {#each node.apis as a}<li>{a}</li>{/each}
          </ul>
        </section>
      {/if}

      {#if node.modules?.length}
        <section>
          <h3>Modules</h3>
          <div class="chips">
            {#each node.modules as m}<span>{m}</span>{/each}
          </div>
        </section>
      {/if}

      {#if node.callKinds?.length}
        <section>
          <h3>Call kinds</h3>
          <div class="chips gold">
            {#each node.callKinds as c}<span>{c}</span>{/each}
          </div>
        </section>
      {/if}

      {#if node.business?.length}
        <section>
          <h3>Business functions</h3>
          <div class="chips">
            {#each node.business as b}<span>{b}</span>{/each}
          </div>
        </section>
      {/if}

      <section>
        <h3>Inbound ({neigh.inbound.length})</h3>
        {#if !neigh.inbound.length}
          <p class="empty">No inbound edges in model.</p>
        {:else}
          <ul class="rels">
            {#each neigh.inbound as e}
              <li>
                <button class="linkish" onclick={() => onnavigate(e.source)}>
                  {nodeById.get(e.source)?.shortName ?? e.source}
                </button>
                <button class="edge-chip" onclick={() => onedge(e.id)}>{e.label}</button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>

      <section>
        <h3>Outbound ({neigh.outbound.length})</h3>
        {#if !neigh.outbound.length}
          <p class="empty">No outbound edges in model.</p>
        {:else}
          <ul class="rels">
            {#each neigh.outbound as e}
              <li>
                <button class="linkish" onclick={() => onnavigate(e.target)}>
                  {nodeById.get(e.target)?.shortName ?? e.target}
                </button>
                <button class="edge-chip" onclick={() => onedge(e.id)}>{e.label}</button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    {:else if edge}
      <section>
        <h3>Why this link exists</h3>
        <p>{edge.description}</p>
      </section>
      <section>
        <h3>Metadata</h3>
        <ul>
          <li><span>Type</span> {edgeTypeMeta[edge.type]?.label ?? edge.type}</li>
          <li><span>Confidence</span> {edge.confidence}</li>
          {#if edge.callKind}<li><span>Call kind</span> {edge.callKind}</li>{/if}
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
    transition: transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms ease;
    z-index: 5;
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

  .actions button {
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(196, 163, 90, 0.12);
    border: 1px solid rgba(196, 163, 90, 0.35);
    color: var(--gold-soft);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .actions button:hover {
    background: rgba(196, 163, 90, 0.22);
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
</style>

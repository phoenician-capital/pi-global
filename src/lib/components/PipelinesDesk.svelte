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
            <button type="button" class:active={activeId === p.id} onclick={() => pick(p.id)}>
              <span class="name">{p.product}</span>
              <span class="one">{p.oneLiner}</span>
            </button>
          </li>
        {/each}
      {/each}
    </ul>
  </aside>

  <section class="main">
    {#if active}
      <header class="main-head">
        <p class="eyebrow">{active.group}</p>
        <h2>{active.product}</h2>
        <p class="tagline">{active.oneLiner}</p>
      </header>

      <div class="main-body">
        <ol class="stage-list">
          {#each active.stages as s, i (s.name)}
            <li class="stage">
              <span class="stage-num">{i + 1}</span>
              <div class="stage-body">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                {#if s.triggeredBy}
                  <p class="trigger"><strong>Starts when:</strong> {s.triggeredBy}</p>
                {/if}
              </div>
            </li>
          {/each}
        </ol>

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
    flex-direction: column;
    gap: 3px;
    padding: 9px 10px;
    border-radius: 9px;
    background: transparent;
  }

  .plist button:hover {
    background: rgba(138, 106, 47, 0.08);
  }

  .plist button.active {
    background: var(--gold);
    color: #fffcf7;
  }

  .plist button.active .one {
    color: rgba(255, 252, 247, 0.85);
  }

  .name {
    font-family: var(--font-ui);
    font-weight: 650;
    font-size: 13px;
    color: inherit;
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

  .main {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow-y: auto;
  }

  .main-head {
    padding: 22px 28px 16px;
    border-bottom: 1px solid var(--line);
    background: var(--panel);
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .eyebrow {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    margin: 0 0 6px;
  }

  .main-head h2 {
    font-family: var(--font-display);
    font-size: 26px;
    margin: 0 0 6px;
    color: var(--fg);
  }

  .tagline {
    margin: 0;
    color: var(--fg-dim);
    font-size: 14px;
    line-height: 1.5;
    max-width: 68ch;
  }

  .main-body {
    padding: 22px 28px 36px;
  }

  .stage-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .stage {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 14px;
    position: relative;
    padding-bottom: 22px;
  }

  .stage:not(:last-child)::before {
    content: "";
    position: absolute;
    left: 15px;
    top: 30px;
    bottom: 0;
    width: 2px;
    background: var(--line);
  }

  .stage-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--gold);
    color: #fffcf7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-ui);
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
  }

  .stage-body h3 {
    font-family: var(--font-ui);
    font-size: 15px;
    margin: 3px 0 6px;
    color: var(--fg);
  }

  .stage-body p {
    margin: 0 0 6px;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--fg-dim);
    max-width: 74ch;
  }

  .trigger {
    font-size: 12.5px !important;
    color: var(--fg-mute) !important;
  }

  .trigger strong {
    color: var(--fg-mute);
    font-weight: 650;
  }

  .enhance {
    margin-top: 12px;
    padding: 18px 20px;
    border-radius: 12px;
    background: rgba(138, 106, 47, 0.07);
    border: 1px solid rgba(138, 106, 47, 0.2);
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

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--fg-mute);
    font-size: 14px;
  }
</style>

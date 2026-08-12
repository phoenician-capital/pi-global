<script>
  import { searchAll, searchSuggestions } from "$lib/ecosystem/index.js";

  /**
   * @type {{
   *   open: boolean,
   *   onclose: () => void,
   *   onpick: (hit: { kind: string, id: string }) => void,
   * }}
   */
  let { open = false, onclose, onpick } = $props();

  let q = $state("");
  let active = $state(0);
  const hits = $derived(searchAll(q));

  $effect(() => {
    if (open) {
      q = "";
      active = 0;
      queueMicrotask(() => document.getElementById("cmd-input")?.focus());
    }
  });

  $effect(() => {
    q;
    active = 0;
  });

  /** @param {KeyboardEvent} ev */
  function onKey(ev) {
    const listLen = q.trim() ? hits.length : searchSuggestions.length;
    if (ev.key === "Escape") {
      ev.preventDefault();
      onclose();
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      active = Math.min(listLen - 1, active + 1);
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      active = Math.max(0, active - 1);
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (q.trim() && hits[active]) onpick(hits[active]);
      else if (!q.trim() && searchSuggestions[active]) {
        const s = searchSuggestions[active];
        onpick({ kind: s.kind, id: s.id });
      }
    }
  }

  const kindLabel = {
    node: "Product",
    edge: "Link",
    journey: "Journey",
    business: "Business",
    scheduler: "Schedule",
    intelligence: "AI / calls",
  };
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={onclose} onkeydown={onKey}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="palette"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={onKey}
    >
      <div class="search-row">
        <span class="kbd-hint">⌘K</span>
        <input
          id="cmd-input"
          bind:value={q}
          placeholder="Search products, journeys, AI models, schedules, APIs…"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <ul>
        {#if q.trim()}
          {#each hits as hit, i}
            <li>
              <button
                class:active={i === active}
                onclick={() => onpick(hit)}
                onmouseenter={() => (active = i)}
              >
                <span class="kind">{kindLabel[hit.kind] ?? hit.kind}</span>
                <span class="title">{hit.title}</span>
                <span class="sub">{hit.subtitle}</span>
              </button>
            </li>
          {:else}
            <li class="empty">No matches — try “DD report”, “CapIQ”, or “Resend”</li>
          {/each}
        {:else}
          <li class="hint">Suggested starting points</li>
          {#each searchSuggestions as s, i}
            <li>
              <button
                class:active={i === active}
                onclick={() => onpick({ kind: s.kind, id: s.id })}
                onmouseenter={() => (active = i)}
              >
                <span class="kind">{kindLabel[s.kind] ?? s.kind}</span>
                <span class="title">{s.label}</span>
                <span class="sub">Jump into the universe</span>
              </button>
            </li>
          {/each}
        {/if}
      </ul>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(40, 32, 20, 0.28);
    backdrop-filter: blur(8px);
    z-index: 40;
    display: grid;
    align-content: start;
    justify-items: center;
    padding: 12vh 16px 16px;
  }

  .palette {
    width: min(640px, 100%);
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
    animation: fade-up 180ms ease;
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--line);
  }

  .kbd-hint {
    font-size: 10px;
    color: var(--gold);
    border: 1px solid rgba(196, 163, 90, 0.35);
    border-radius: 4px;
    padding: 2px 6px;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--fg);
    font-size: 1rem;
    outline: none;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 8px;
    max-height: 360px;
    overflow: auto;
  }

  .hint,
  .empty {
    padding: 10px 12px;
    font-size: 0.78rem;
    color: var(--fg-mute);
  }

  button {
    width: 100%;
    display: grid;
    grid-template-columns: 88px 1fr;
    grid-template-rows: auto auto;
    gap: 2px 10px;
    text-align: left;
    padding: 10px 12px;
    border-radius: 10px;
  }

  button:hover,
  button.active {
    background: rgba(196, 163, 90, 0.1);
  }

  .kind {
    grid-row: 1 / span 2;
    align-self: center;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .title {
    font-size: 0.9rem;
    color: var(--fg);
    font-weight: 500;
  }

  .sub {
    font-size: 0.75rem;
    color: var(--fg-mute);
    grid-column: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

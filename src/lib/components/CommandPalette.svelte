<script>
  import { searchAll } from "$lib/ecosystem/index.js";

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

  /** @param {KeyboardEvent} ev */
  function onKey(ev) {
    if (ev.key === "Escape") {
      ev.preventDefault();
      onclose();
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      active = Math.min(hits.length - 1, active + 1);
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      active = Math.max(0, active - 1);
    } else if (ev.key === "Enter" && hits[active]) {
      ev.preventDefault();
      onpick(hits[active]);
    }
  }
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
          placeholder="Search projects, APIs, databases, journeys, vendors…"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <ul>
        {#each hits as hit, i}
          <li>
            <button
              class:active={i === active}
              onclick={() => onpick(hit)}
              onmouseenter={() => (active = i)}
            >
              <span class="kind">{hit.kind}</span>
              <span class="title">{hit.title}</span>
              <span class="sub">{hit.subtitle}</span>
            </button>
          </li>
        {:else}
          <li class="empty">{q ? "No matches" : "Type to search the universe"}</li>
        {/each}
      </ul>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(8, 10, 14, 0.72);
    backdrop-filter: blur(8px);
    z-index: 40;
    display: grid;
    align-content: start;
    justify-items: center;
    padding: 12vh 16px 16px;
  }

  .palette {
    width: min(640px, 100%);
    background: var(--ink-2);
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
    font-size: 11px;
    color: var(--gold);
    border: 1px solid rgba(196, 163, 90, 0.35);
    border-radius: 6px;
    padding: 2px 6px;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1rem;
    color: var(--fg);
  }

  ul {
    margin: 0;
    padding: 8px;
    list-style: none;
    max-height: 420px;
    overflow: auto;
  }

  button {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border-radius: 10px;
    display: grid;
    gap: 2px;
  }

  button.active,
  button:hover {
    background: rgba(196, 163, 90, 0.12);
  }

  .kind {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .title {
    font-weight: 500;
  }

  .sub {
    font-size: 0.8rem;
    color: var(--fg-mute);
  }

  .empty {
    padding: 24px;
    text-align: center;
    color: var(--fg-mute);
    font-size: 0.9rem;
  }
</style>

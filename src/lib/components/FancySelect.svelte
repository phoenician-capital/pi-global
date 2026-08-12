<script>
  /**
   * @typedef {{ value: string, label: string, hint?: string }} SelectOption
   *
   * @type {{
   *   label: string,
   *   value: string,
   *   options: SelectOption[],
   *   wide?: boolean,
   *   onchange?: (value: string) => void,
   * }}
   */
  let {
    label,
    value = $bindable(""),
    options = [],
    wide = false,
    onchange,
  } = $props();

  let open = $state(false);
  let rootEl = $state(/** @type {HTMLDivElement|null} */ (null));
  let triggerEl = $state(/** @type {HTMLButtonElement|null} */ (null));
  let menuEl = $state(/** @type {HTMLUListElement|null} */ (null));

  /** @type {{ top: string, bottom: string, left: number, width: number, maxHeight: number, openUp: boolean }} */
  let menuBox = $state({
    top: "0px",
    bottom: "auto",
    left: 0,
    width: 260,
    maxHeight: 320,
    openUp: false,
  });

  const selected = $derived(options.find((o) => o.value === value) ?? options[0]);

  function placeMenu() {
    if (!triggerEl) return;
    const r = triggerEl.getBoundingClientRect();
    const gap = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(wide ? 420 : 320, Math.max(r.width, 220), vw - 16);
    const spaceBelow = vh - r.bottom - gap - 12;
    const spaceAbove = r.top - gap - 12;
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(420, openUp ? spaceAbove : spaceBelow));
    let left = r.left;
    if (wide) left = Math.max(8, r.right - width);
    left = Math.min(left, vw - width - 8);
    left = Math.max(8, left);
    menuBox = openUp
      ? {
          top: "auto",
          bottom: `${vh - r.top + gap}px`,
          left,
          width,
          maxHeight,
          openUp: true,
        }
      : {
          top: `${r.bottom + gap}px`,
          bottom: "auto",
          left,
          width,
          maxHeight,
          openUp: false,
        };
  }

  $effect(() => {
    if (!open) return;
    placeMenu();
    // next frame after menu mounts — refine with real height if needed
    requestAnimationFrame(placeMenu);

    /** @param {PointerEvent} ev */
    function onDoc(ev) {
      const t = /** @type {Node} */ (ev.target);
      if (rootEl?.contains(t) || menuEl?.contains(t)) return;
      open = false;
    }
    /** @param {KeyboardEvent} ev */
    function onKey(ev) {
      if (ev.key === "Escape") open = false;
    }
    function onReposition() {
      placeMenu();
    }

    document.addEventListener("pointerdown", onDoc, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("pointerdown", onDoc, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  });

  /** @param {string} next */
  function pick(next) {
    value = next;
    open = false;
    onchange?.(next);
  }

  /** Keep wheel/touch scroll inside the menu (don’t zoom the map). */
  /** @param {WheelEvent} ev */
  function onMenuWheel(ev) {
    ev.stopPropagation();
  }
</script>

<div class="fancy" class:wide class:open bind:this={rootEl}>
  <span class="field-label">{label}</span>
  <button
    type="button"
    class="trigger"
    bind:this={triggerEl}
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={() => {
      open = !open;
      if (!open) return;
      queueMicrotask(placeMenu);
    }}
  >
    <span class="trigger-text">
      <span class="value">{selected?.label ?? "Select…"}</span>
    </span>
    <span class="chev" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </button>
</div>

{#if open}
  <!-- Fixed portal — never clipped by nav overflow -->
  <ul
    class="menu"
    class:up={menuBox.openUp}
    role="listbox"
    aria-label={label}
    bind:this={menuEl}
    style:top={menuBox.top}
    style:bottom={menuBox.bottom}
    style:left={`${menuBox.left}px`}
    style:width={`${menuBox.width}px`}
    style:max-height={`${menuBox.maxHeight}px`}
    onwheel={onMenuWheel}
  >
    {#each options as opt}
      {@const active = opt.value === value}
      <li role="option" aria-selected={active}>
        <button type="button" class="item" class:active onclick={() => pick(opt.value)}>
          <span class="check" aria-hidden="true">
            {#if active}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7.2L5.4 10.1L11.5 3.8"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            {/if}
          </span>
          <span class="item-copy">
            <span class="item-label">{opt.label}</span>
            {#if opt.hint}
              <span class="item-hint">{opt.hint}</span>
            {/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .fancy {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    z-index: 20;
    max-width: 100%;
  }

  .fancy.open {
    z-index: 40;
  }

  .field-label {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fg-mute);
    font-weight: 500;
    flex-shrink: 0;
  }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 168px;
    max-width: min(280px, calc(100vw - 96px));
    padding: 8px 12px 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(60, 52, 40, 0.18);
    background: #fff;
    box-shadow: 0 1px 2px rgba(40, 32, 20, 0.06);
    color: var(--fg);
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease,
      background 160ms ease;
  }

  .wide .trigger {
    min-width: 220px;
    max-width: min(420px, calc(100vw - 48px));
  }

  .trigger:hover {
    border-color: rgba(138, 106, 47, 0.45);
    box-shadow: 0 4px 16px rgba(40, 32, 20, 0.1);
  }

  .fancy.open .trigger {
    border-color: rgba(138, 106, 47, 0.55);
    box-shadow: 0 6px 20px rgba(40, 32, 20, 0.12);
  }

  .trigger-text {
    display: grid;
    text-align: left;
    min-width: 0;
    flex: 1;
  }

  .value {
    font-size: 0.82rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chev {
    display: grid;
    place-items: center;
    color: var(--gold-soft);
    transition: transform 180ms ease;
    flex-shrink: 0;
  }

  .fancy.open .chev {
    transform: rotate(180deg);
  }

  .menu {
    position: fixed;
    z-index: 10050;
    margin: 0;
    padding: 6px;
    list-style: none;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    border-radius: 14px;
    border: 1px solid var(--panel-border);
    background: #fffdf8;
    box-shadow: 0 18px 48px rgba(40, 32, 20, 0.22);
    animation: menu-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
    transform-origin: top left;
  }

  .menu.up {
    transform-origin: bottom left;
  }

  @keyframes menu-in {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .item {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 11px;
    text-align: left;
    color: var(--fg);
    transition: background 120ms ease;
  }

  .item:hover {
    background: rgba(212, 184, 126, 0.12);
  }

  .item.active {
    background: linear-gradient(
      90deg,
      rgba(196, 163, 90, 0.22),
      rgba(196, 163, 90, 0.08)
    );
  }

  .check {
    width: 16px;
    height: 16px;
    margin-top: 1px;
    flex-shrink: 0;
    color: var(--gold);
    display: grid;
    place-items: center;
  }

  .item-copy {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .item-label {
    font-size: 0.86rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .item.active .item-label {
    color: var(--gold-soft);
  }

  .item-hint {
    font-size: 0.72rem;
    color: var(--fg-mute);
    line-height: 1.35;
  }
</style>

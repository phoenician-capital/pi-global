<script>
  import { domains, edgeTypeMeta, nodeById, world } from "$lib/ecosystem/index.js";

  /**
   * @typedef {import('$lib/ecosystem/types.js').EcoNode} EcoNode
   * @typedef {import('$lib/ecosystem/types.js').EcoEdge} EcoEdge
   */

  /**
   * @type {{
   *   nodes: EcoNode[],
   *   edges: EcoEdge[],
   *   selectedId: string|null,
   *   selectedEdgeId: string|null,
   *   highlightNodes: Set<string>,
   *   highlightEdges: Set<string>,
   *   dimUnrelated: boolean,
   *   journeyStepIds: string[],
   * }}
   */
  let {
    nodes,
    edges,
    selectedId = null,
    selectedEdgeId = null,
    highlightNodes = new Set(),
    highlightEdges = new Set(),
    dimUnrelated = false,
    journeyStepIds = [],
    onselectnode,
    onselectedge,
  } = $props();

  let svgEl = $state(/** @type {SVGSVGElement|null} */ (null));
  let scale = $state(0.72);
  let tx = $state(40);
  let ty = $state(20);
  let panning = $state(false);
  let panStart = $state({ x: 0, y: 0, tx: 0, ty: 0 });

  const hasHighlight = $derived(highlightNodes.size > 0 || highlightEdges.size > 0 || !!selectedId);

  /** @param {EcoNode} n */
  function nodeOpacity(n) {
    if (!dimUnrelated && !hasHighlight) return 1;
    if (selectedId === n.id) return 1;
    if (highlightNodes.has(n.id)) return 1;
    if (dimUnrelated || hasHighlight) return 0.18;
    return 1;
  }

  /** @param {EcoEdge} e */
  function edgeOpacity(e) {
    if (selectedEdgeId === e.id) return 1;
    if (highlightEdges.has(e.id)) return 0.95;
    if (selectedId && (e.source === selectedId || e.target === selectedId)) return 0.85;
    if (dimUnrelated || hasHighlight) return 0.08;
    return 0.45;
  }

  /** @param {EcoEdge} e */
  function edgePath(e) {
    const a = nodeById.get(e.source);
    const b = nodeById.get(e.target);
    if (!a || !b) return "";
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const mx = (a.x + b.x) / 2 + dy * 0.08;
    const my = (a.y + b.y) / 2 - dx * 0.08;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  }

  /** @param {WheelEvent} ev */
  function onWheel(ev) {
    ev.preventDefault();
    const factor = ev.deltaY > 0 ? 0.92 : 1.08;
    const next = Math.min(2.2, Math.max(0.35, scale * factor));
    scale = next;
  }

  /** @param {PointerEvent} ev */
  function onPointerDown(ev) {
    if (ev.button !== 0) return;
    if (/** @type {Element} */ (ev.target).closest(".node-hit, .edge-hit")) return;
    panning = true;
    panStart = { x: ev.clientX, y: ev.clientY, tx, ty };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  }

  /** @param {PointerEvent} ev */
  function onPointerMove(ev) {
    if (!panning) return;
    tx = panStart.tx + (ev.clientX - panStart.x);
    ty = panStart.ty + (ev.clientY - panStart.y);
  }

  function onPointerUp() {
    panning = false;
  }

  export function resetView() {
    scale = 0.72;
    tx = 40;
    ty = 20;
  }

  export function focusNode(id) {
    const n = nodeById.get(id);
    if (!n || !svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    scale = 1.05;
    tx = rect.width / 2 - n.x * scale;
    ty = rect.height / 2 - n.y * scale;
  }

  const domainHulls = $derived.by(() => {
    /** @type {Record<string, {minX:number,minY:number,maxX:number,maxY:number}>} */
    const hull = {};
    for (const n of nodes) {
      if (n.domain === "vendor" || n.domain === "infra") continue;
      const r = n.r ?? 20;
      const h = hull[n.domain] ?? { minX: n.x, minY: n.y, maxX: n.x, maxY: n.y };
      h.minX = Math.min(h.minX, n.x - r);
      h.minY = Math.min(h.minY, n.y - r);
      h.maxX = Math.max(h.maxX, n.x + r);
      h.maxY = Math.max(h.maxY, n.y + r);
      hull[n.domain] = h;
    }
    return Object.entries(hull).map(([id, b]) => ({
      id,
      ...b,
      pad: 48,
      meta: domains[id],
    }));
  });
</script>

<div class="map-wrap">
  <svg
    bind:this={svgEl}
    class="galaxy"
    viewBox={`0 0 ${world.width} ${world.height}`}
    role="img"
    aria-label="Software ecosystem map"
    onwheel={onWheel}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  >
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c4a35a" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#c4a35a" stop-opacity="0" />
      </radialGradient>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="rgba(239,236,228,0.45)" />
      </marker>
      <filter id="soft">
        <feGaussianBlur stdDeviation="1.2" />
      </filter>
    </defs>

    <g transform={`translate(${tx},${ty}) scale(${scale})`}>
      <!-- atmosphere -->
      <circle cx="900" cy="560" r="520" fill="url(#glow)" opacity="0.55" />

      {#each domainHulls as h}
        <rect
          class="hull"
          x={h.minX - h.pad}
          y={h.minY - h.pad}
          width={h.maxX - h.minX + h.pad * 2}
          height={h.maxY - h.minY + h.pad * 2}
          rx="36"
          fill={h.meta?.color ?? "#333"}
          fill-opacity="0.14"
          stroke={h.meta?.accent ?? "#666"}
          stroke-opacity="0.28"
        />
        <text
          class="hull-label"
          x={h.minX - h.pad + 18}
          y={h.minY - h.pad + 28}
          fill={h.meta?.accent ?? "#aaa"}
        >
          {h.meta?.name ?? h.id}
        </text>
      {/each}

      {#each edges as e (e.id)}
        {@const meta = edgeTypeMeta[e.type] ?? { color: "#888" }}
        {@const active = selectedEdgeId === e.id || highlightEdges.has(e.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <path
          class="edge-hit"
          d={edgePath(e)}
          fill="none"
          stroke="transparent"
          stroke-width="14"
          role="button"
          tabindex="0"
          aria-label={`Link ${e.label}`}
          onclick={() => onselectedge?.(e.id)}
          onkeydown={(ev) => ev.key === "Enter" && onselectedge?.(e.id)}
        />
        <path
          class="edge"
          class:dashed={e.type === "conceptual" || e.type === "fork" || e.confidence === "inferred"}
          d={edgePath(e)}
          fill="none"
          stroke={meta.color}
          stroke-width={active ? 2.6 : 1.4}
          stroke-opacity={edgeOpacity(e)}
          marker-end="url(#arrow)"
          style:stroke-dasharray={e.type === "conceptual" || e.type === "fork" ? "6 5" : e.confidence === "inferred" ? "3 4" : "none"}
        />
      {/each}

      {#each journeyStepIds as id, i}
        {@const n = nodeById.get(id)}
        {#if n}
          <text class="journey-idx" x={n.x + (n.r ?? 20) + 6} y={n.y - (n.r ?? 20)} fill="var(--gold)">
            {i + 1}
          </text>
        {/if}
      {/each}

      {#each nodes as n (n.id)}
        {@const d = domains[n.domain]}
        {@const r = n.r ?? 20}
        {@const sel = selectedId === n.id}
        {@const hi = highlightNodes.has(n.id)}
        <g
          class="node-hit"
          transform={`translate(${n.x},${n.y})`}
          opacity={nodeOpacity(n)}
          onclick={() => onselectnode?.(n.id)}
          onkeydown={(ev) => ev.key === "Enter" && onselectnode?.(n.id)}
          role="button"
          tabindex="0"
          aria-label={n.name}
        >
          {#if sel}
            <circle class="pulse" r={r + 14} fill="none" stroke={d?.accent ?? "#c4a35a"} stroke-width="1.2" />
          {/if}
          <circle
            r={r}
            fill={n.kind === "external" ? "#1c1810" : n.kind === "database" || n.kind === "infrastructure" ? "#101820" : "#151c26"}
            stroke={sel || hi ? d?.accent ?? "#c4a35a" : d?.color ?? "#555"}
            stroke-width={sel ? 2.4 : 1.4}
          />
          <circle r={Math.max(4, r * 0.22)} fill={d?.accent ?? "#c4a35a"} opacity="0.85" />
          <text class="node-label" y={r + 16} text-anchor="middle" fill="var(--fg)">
            {n.shortName}
          </text>
          <text class="node-kind" y={r + 30} text-anchor="middle" fill="var(--fg-mute)">
            {n.kind}
          </text>
        </g>
      {/each}
    </g>
  </svg>

  <div class="map-hint">Scroll to zoom · drag to pan · click node or link</div>
</div>

<style>
  .map-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse 70% 55% at 30% 20%, rgba(62, 90, 110, 0.22), transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 70%, rgba(80, 60, 30, 0.18), transparent 55%),
      var(--ink);
  }

  .galaxy {
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: grab;
  }

  .galaxy:active {
    cursor: grabbing;
  }

  .hull-label {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .edge {
    transition: stroke-opacity 180ms ease, stroke-width 180ms ease;
    pointer-events: none;
  }

  .edge-hit {
    cursor: pointer;
  }

  .node-hit {
    cursor: pointer;
    transition: opacity 180ms ease;
  }

  .node-hit:focus {
    outline: none;
  }

  .node-label {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    paint-order: stroke;
    stroke: rgba(12, 16, 20, 0.85);
    stroke-width: 3px;
  }

  .node-kind {
    font-family: var(--font-ui);
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .pulse {
    transform-origin: center;
    animation: pulse-ring 2.2s ease-out infinite;
  }

  .journey-idx {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 650;
  }

  .map-hint {
    position: absolute;
    left: 16px;
    bottom: 12px;
    font-size: 11px;
    color: var(--fg-mute);
    letter-spacing: 0.04em;
    pointer-events: none;
  }
</style>

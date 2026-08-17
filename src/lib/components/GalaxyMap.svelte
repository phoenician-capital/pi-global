<script>
  import { domains, edgeTypeMeta, nodeById, world, lodBand } from "$lib/ecosystem/index.js";
  import { animateValues } from "$lib/ecosystem/motion.js";
  import { guideFor } from "$lib/ecosystem/plainGuide.js";

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
   *   softDim?: boolean,
   *   journeyStepIds: string[],
   *   journeyActiveStep?: number,
   *   upstreamIds?: Set<string>,
   *   downstreamIds?: Set<string>,
   *   positionOverrides?: Map<string, { x: number, y: number }>|null,
   *   showEdgeLabels?: boolean,
   *   animateFlow?: boolean,
   *   focusedDomain?: string|null,
   *   controlsOffset?: number,
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
    softDim = false,
    journeyStepIds = [],
    journeyActiveStep = -1,
    upstreamIds = new Set(),
    downstreamIds = new Set(),
    positionOverrides = null,
    showEdgeLabels = false,
    animateFlow = false,
    focusedDomain = null,
    controlsOffset = 0,
    onselectnode,
    onselectedge,
    ondomain,
  } = $props();

  const MIN_SCALE = 0.28;
  const MAX_SCALE = 2.8;
  const DEFAULT_SCALE = 0.72;

  let svgEl = $state(/** @type {SVGSVGElement|null} */ (null));
  let wrapEl = $state(/** @type {HTMLDivElement|null} */ (null));
  let scale = $state(DEFAULT_SCALE);
  let tx = $state(40);
  let ty = $state(20);
  let panning = $state(false);
  let panStart = $state({ x: 0, y: 0, tx: 0, ty: 0 });
  let hoveredNode = $state(/** @type {string|null} */ (null));
  let hoveredEdge = $state(/** @type {string|null} */ (null));
  let tip = $state(/** @type {{ x: number, y: number, title: string, body: string, meta: string }|null} */ (null));
  /** @type {null|(() => void)} */
  let cancelCam = null;

  /** Pinch tracking */
  let pinch = $state(/** @type {{ dist: number, scale: number, cx: number, cy: number }|null} */ (null));
  /** @type {Map<number, { x: number, y: number }>} */
  let pointers = new Map();

  const zoomPct = $derived(Math.round((scale / DEFAULT_SCALE) * 100));

  const band = $derived(lodBand(scale));
  const hasHighlight = $derived(highlightNodes.size > 0 || highlightEdges.size > 0 || !!selectedId);
  const showKinds = $derived(band === "near");
  const showLabels = $derived(band !== "far" || hasHighlight || !!hoveredNode);
  const edgeLabelsOn = $derived(
    showEdgeLabels || (band === "near" && (hasHighlight || journeyStepIds.length > 0 || !!hoveredEdge)),
  );

  /** @param {string} id */
  function posOf(id) {
    const o = positionOverrides?.get(id);
    const n = nodeById.get(id);
    if (!n) return null;
    return { x: o?.x ?? n.x, y: o?.y ?? n.y, r: n.r ?? 20, node: n };
  }

  /** @param {EcoNode} n */
  function nodeOpacity(n) {
    if (focusedDomain && n.domain !== focusedDomain && n.domain !== "vendor" && n.domain !== "infra") {
      // keep vendors/infra visible if connected later; soft-hide other domains
      if (!highlightNodes.has(n.id) && selectedId !== n.id) return 0.24;
    }
    if (hoveredNode === n.id) return 1;
    if (!dimUnrelated && !hasHighlight) return 1;
    if (selectedId === n.id) return 1;
    if (highlightNodes.has(n.id)) return 1;
    if (dimUnrelated || hasHighlight) return softDim ? 0.45 : 0.24;
    return 1;
  }

  /** @param {EcoEdge} e */
  function edgeOpacity(e) {
    if (hoveredEdge === e.id) return 1;
    if (selectedEdgeId === e.id) return 1;
    if (highlightEdges.has(e.id)) return 0.95;
    if (selectedId && (e.source === selectedId || e.target === selectedId)) return 0.85;
    if (dimUnrelated || hasHighlight) return softDim ? 0.35 : 0.2;
    return band === "far" ? 0.4 : 0.7;
  }

  /** @param {EcoEdge} e */
  function edgePath(e) {
    const a = posOf(e.source);
    const b = posOf(e.target);
    if (!a || !b) return "";
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const mx = (a.x + b.x) / 2 + dy * 0.08;
    const my = (a.y + b.y) / 2 - dx * 0.08;
    return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
  }

  /** @param {EcoEdge} e */
  function edgeRole(e) {
    if (upstreamIds.has(e.source) && (upstreamIds.has(e.target) || e.target === selectedId)) return "up";
    if (downstreamIds.has(e.target) && (downstreamIds.has(e.source) || e.source === selectedId)) return "down";
    if (highlightEdges.has(e.id) && animateFlow) return "flow";
    return "";
  }

  const journeyBadges = $derived.by(() => {
    /** @type {Map<string, number>} */
    const seen = new Map();
    return journeyStepIds.map((id, i) => {
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      return { id, i, offset: count };
    });
  });

  function clampScale(s) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
  }

  /** @param {number} nextScale @param {number} nextTx @param {number} nextTy @param {number} [ms] */
  function animateCamera(nextScale, nextTx, nextTy, ms = 480) {
    cancelCam?.();
    cancelCam = animateValues({
      from: { scale, tx, ty },
      to: { scale: clampScale(nextScale), tx: nextTx, ty: nextTy },
      ms,
      onframe: (v) => {
        scale = v.scale;
        tx = v.tx;
        ty = v.ty;
      },
    });
  }

  function viewportCenter() {
    if (!svgEl) return { x: 400, y: 300 };
    const rect = svgEl.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2 };
  }

  /**
   * Zoom toward a screen point inside the SVG (or viewport center).
   * @param {number} factor
   * @param {number} [screenX]
   * @param {number} [screenY]
   * @param {boolean} [animate]
   */
  function zoomAt(factor, screenX, screenY, animate = false) {
    if (!svgEl) return;
    cancelCam?.();
    const rect = svgEl.getBoundingClientRect();
    const mx = screenX ?? rect.width / 2;
    const my = screenY ?? rect.height / 2;
    const next = clampScale(scale * factor);
    const wx = (mx - tx) / scale;
    const wy = (my - ty) / scale;
    const nextTx = mx - wx * next;
    const nextTy = my - wy * next;
    if (animate) animateCamera(next, nextTx, nextTy, 280);
    else {
      scale = next;
      tx = nextTx;
      ty = nextTy;
    }
  }

  export function zoomIn() {
    zoomAt(1.2, undefined, undefined, true);
  }

  export function zoomOut() {
    zoomAt(1 / 1.2, undefined, undefined, true);
  }

  /** @param {number} nextScale absolute */
  export function setZoom(nextScale) {
    const c = viewportCenter();
    const factor = clampScale(nextScale) / scale;
    zoomAt(factor, c.x, c.y, true);
  }

  /** @param {number} dx @param {number} dy */
  export function panBy(dx, dy) {
    cancelCam?.();
    animateCamera(scale, tx + dx, ty + dy, 220);
  }

  export function resetView() {
    animateCamera(DEFAULT_SCALE, 40, 20, 520);
  }

  /** Fit all currently visible nodes in the viewport */
  export function fitAll() {
    if (!svgEl || !nodes.length) {
      resetView();
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      const p = posOf(n.id);
      if (!p) continue;
      const r = p.r + 36;
      minX = Math.min(minX, p.x - r);
      minY = Math.min(minY, p.y - r);
      maxX = Math.max(maxX, p.x + r);
      maxY = Math.max(maxY, p.y + r);
    }
    if (!Number.isFinite(minX)) {
      resetView();
      return;
    }
    const rect = svgEl.getBoundingClientRect();
    const pad = 48;
    const w = maxX - minX || 400;
    const h = maxY - minY || 300;
    const nextScale = clampScale(Math.min((rect.width - pad * 2) / w, (rect.height - pad * 2) / h));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    animateCamera(nextScale, rect.width / 2 - cx * nextScale, rect.height / 2 - cy * nextScale, 520);
  }

  /** Zoom to selected / highlighted nodes */
  export function fitSelection() {
    const ids = selectedId
      ? [selectedId, ...highlightNodes]
      : [...highlightNodes];
    const unique = [...new Set(ids)];
    if (!unique.length || !svgEl) {
      fitAll();
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const id of unique) {
      const p = posOf(id);
      if (!p) continue;
      const r = p.r + 48;
      minX = Math.min(minX, p.x - r);
      minY = Math.min(minY, p.y - r);
      maxX = Math.max(maxX, p.x + r);
      maxY = Math.max(maxY, p.y + r);
    }
    if (!Number.isFinite(minX)) return;
    const rect = svgEl.getBoundingClientRect();
    const w = maxX - minX || 200;
    const h = maxY - minY || 200;
    const nextScale = clampScale(Math.min((rect.width - 80) / w, (rect.height - 80) / h, 1.6));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    animateCamera(nextScale, rect.width / 2 - cx * nextScale, rect.height / 2 - cy * nextScale, 480);
  }

  export function focusNode(id) {
    const p = posOf(id);
    if (!p || !svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const nextScale = clampScale(Math.max(scale, 1.05));
    animateCamera(nextScale, rect.width / 2 - p.x * nextScale, rect.height / 2 - p.y * nextScale, 520);
  }

  /** @param {WheelEvent} ev */
  function onWheel(ev) {
    ev.preventDefault();
    if (!svgEl) return;
    cancelCam?.();
    const rect = svgEl.getBoundingClientRect();
    // Trackpads send small deltas; mouse wheels larger — normalize
    const intensity = Math.abs(ev.deltaY) > 40 ? 1.12 : 1.06;
    const factor = ev.deltaY > 0 ? 1 / intensity : intensity;
    zoomAt(factor, ev.clientX - rect.left, ev.clientY - rect.top, false);
  }

  /** @param {PointerEvent} ev */
  function onPointerDown(ev) {
    if (ev.button !== 0 && ev.pointerType !== "touch") return;
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

    if (pointers.size === 2 && svgEl) {
      panning = false;
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const rect = svgEl.getBoundingClientRect();
      pinch = {
        dist: dist || 1,
        scale,
        cx: (pts[0].x + pts[1].x) / 2 - rect.left,
        cy: (pts[0].y + pts[1].y) / 2 - rect.top,
      };
      tip = null;
      return;
    }

    if (/** @type {Element} */ (ev.target).closest(".node-hit, .edge-hit, .hull-hit, .nav-pad")) return;
    panning = true;
    tip = null;
    panStart = { x: ev.clientX, y: ev.clientY, tx, ty };
    try {
      ev.currentTarget.setPointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
  }

  /** @param {PointerEvent} ev */
  function onPointerMove(ev) {
    if (pointers.has(ev.pointerId)) {
      pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    }

    if (pinch && pointers.size === 2 && svgEl) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const next = clampScale(pinch.scale * (dist / pinch.dist));
      const wx = (pinch.cx - tx) / scale;
      const wy = (pinch.cy - ty) / scale;
      scale = next;
      tx = pinch.cx - wx * next;
      ty = pinch.cy - wy * next;
      return;
    }

    if (!panning) return;
    tx = panStart.tx + (ev.clientX - panStart.x);
    ty = panStart.ty + (ev.clientY - panStart.y);
  }

  /** @param {PointerEvent} ev */
  function onPointerUp(ev) {
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) panning = false;
  }

  /** @param {MouseEvent} ev */
  function onDblClick(ev) {
    if (/** @type {Element} */ (ev.target).closest(".node-hit, .edge-hit, .hull-hit, .nav-pad")) return;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const factor = ev.shiftKey ? 1 / 1.35 : 1.35;
    zoomAt(factor, ev.clientX - rect.left, ev.clientY - rect.top, true);
  }

  /** Slider → absolute scale relative to default */
  function onSlider(/** @type {Event} */ ev) {
    const v = Number(/** @type {HTMLInputElement} */ (ev.target).value);
    setZoom(DEFAULT_SCALE * (v / 100));
  }

  function isTypingTarget(/** @type {EventTarget|null} */ t) {
    if (!(t instanceof HTMLElement)) return false;
    const tag = t.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
  }

  $effect(() => {
    /** @param {KeyboardEvent} ev */
    function onKey(ev) {
      if (isTypingTarget(ev.target)) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;

      const step = ev.shiftKey ? 120 : 72;
      if (ev.key === "+" || ev.key === "=") {
        ev.preventDefault();
        zoomIn();
      } else if (ev.key === "-" || ev.key === "_") {
        ev.preventDefault();
        zoomOut();
      } else if (ev.key === "0") {
        ev.preventDefault();
        resetView();
      } else if (ev.key === "f" || ev.key === "F") {
        ev.preventDefault();
        if (ev.shiftKey) fitSelection();
        else fitAll();
      } else if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        panBy(step, 0);
      } else if (ev.key === "ArrowRight") {
        ev.preventDefault();
        panBy(-step, 0);
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        panBy(0, step);
      } else if (ev.key === "ArrowDown") {
        ev.preventDefault();
        panBy(0, -step);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /** @param {string} id @param {MouseEvent} ev */
  function hoverNode(id, ev) {
    hoveredNode = id;
    hoveredEdge = null;
    const n = nodeById.get(id);
    if (!n || !svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const g = guideFor(id);
    tip = {
      x: Math.min(rect.width - 280, Math.max(12, ev.clientX - rect.left + 14)),
      y: Math.min(rect.height - 120, Math.max(12, ev.clientY - rect.top + 14)),
      title: g?.title ?? n.name,
      body: g?.oneLiner ?? n.purpose,
      meta: `${n.shortName} · ${domains[n.domain]?.name ?? n.domain}`,
    };
  }

  /** @param {string} id @param {MouseEvent} ev */
  function hoverEdge(id, ev) {
    hoveredEdge = id;
    hoveredNode = null;
    const e = edges.find((x) => x.id === id);
    if (!e || !svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const a = nodeById.get(e.source)?.shortName ?? e.source;
    const b = nodeById.get(e.target)?.shortName ?? e.target;
    tip = {
      x: Math.min(rect.width - 300, Math.max(12, ev.clientX - rect.left + 14)),
      y: Math.min(rect.height - 130, Math.max(12, ev.clientY - rect.top + 14)),
      title: `${a} → ${b}`,
      body: e.description,
      meta: `${edgeTypeMeta[e.type]?.label ?? e.type} · ${e.confidence} · ${e.label}`,
    };
  }

  function clearHover() {
    hoveredNode = null;
    hoveredEdge = null;
    tip = null;
  }

  const domainHulls = $derived.by(() => {
    /** @type {Record<string, {minX:number,minY:number,maxX:number,maxY:number}>} */
    const hull = {};
    for (const n of nodes) {
      if (n.domain === "vendor" || n.domain === "infra") continue;
      const p = posOf(n.id);
      if (!p) continue;
      const r = p.r;
      const h = hull[n.domain] ?? { minX: p.x, minY: p.y, maxX: p.x, maxY: p.y };
      h.minX = Math.min(h.minX, p.x - r);
      h.minY = Math.min(h.minY, p.y - r);
      h.maxX = Math.max(h.maxX, p.x + r);
      h.maxY = Math.max(h.maxY, p.y + r);
      hull[n.domain] = h;
    }
    return Object.entries(hull).map(([id, b]) => ({
      id,
      ...b,
      pad: band === "far" ? 56 : 48,
      meta: domains[id],
    }));
  });

  const lodHint = $derived(
    band === "far" ? "Zoom in · databases & vendors appear" : band === "mid" ? "Mid detail" : "Full detail",
  );
</script>

<div class="map-wrap" bind:this={wrapEl}>
  <svg
    bind:this={svgEl}
    class="galaxy"
    class:panning
    viewBox={`0 0 ${world.width} ${world.height}`}
    role="img"
    aria-label="Software ecosystem map"
    onwheel={onWheel}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onpointerleave={clearHover}
    ondblclick={onDblClick}
  >
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#8a6a2f" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#8a6a2f" stop-opacity="0" />
      </radialGradient>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="rgba(42,36,28,0.55)" />
      </marker>
      <marker id="arrow-up" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#2f6f8a" />
      </marker>
      <marker id="arrow-down" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#9a4d63" />
      </marker>
      <marker id="arrow-flow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#8a6a2f" />
      </marker>
    </defs>

    <g transform={`translate(${tx},${ty}) scale(${scale})`}>
      <circle cx="900" cy="560" r="520" fill="url(#glow)" opacity="0.55" />

      {#each domainHulls as h}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <g
          class="hull-hit"
          opacity={focusedDomain && focusedDomain !== h.id ? 0.35 : 1}
          onclick={() => ondomain?.(h.id)}
          role="button"
          tabindex="0"
          onkeydown={(ev) => ev.key === "Enter" && ondomain?.(h.id)}
        >
          <rect
            class="hull"
            class:focused={focusedDomain === h.id}
            x={h.minX - h.pad}
            y={h.minY - h.pad}
            width={h.maxX - h.minX + h.pad * 2}
            height={h.maxY - h.minY + h.pad * 2}
            rx="36"
            fill={h.meta?.color ?? "#5a5044"}
            fill-opacity={band === "far" ? 0.24 : 0.17}
            stroke={h.meta?.accent ?? "#6f685c"}
            stroke-opacity={focusedDomain === h.id ? 0.85 : 0.62}
            stroke-width={focusedDomain === h.id ? 2.2 : 1.4}
          />
          <text
            class="hull-label"
            x={h.minX - h.pad + 18}
            y={h.minY - h.pad + 28}
            fill={h.meta?.color ?? "#4a453c"}
          >
            {h.meta?.shortLabel ?? h.meta?.name ?? h.id}
          </text>
        </g>
      {/each}

      {#each edges as e (e.id)}
        {@const meta = edgeTypeMeta[e.type] ?? { color: "#888" }}
        {@const active = selectedEdgeId === e.id || highlightEdges.has(e.id) || hoveredEdge === e.id}
        {@const role = edgeRole(e)}
        {@const stroke =
          role === "up" ? "#2f6f8a" : role === "down" ? "#9a4d63" : role === "flow" ? "#8a6a2f" : meta.color}
        {@const marker =
          role === "up"
            ? "url(#arrow-up)"
            : role === "down"
              ? "url(#arrow-down)"
              : role === "flow"
                ? "url(#arrow-flow)"
                : "url(#arrow)"}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <path
          class="edge-hit"
          d={edgePath(e)}
          fill="none"
          stroke="transparent"
          stroke-width="16"
          role="button"
          tabindex="0"
          aria-label={`Link ${e.label}`}
          onclick={() => onselectedge?.(e.id)}
          onkeydown={(ev) => ev.key === "Enter" && onselectedge?.(e.id)}
          onpointerenter={(ev) => hoverEdge(e.id, ev)}
          onpointerleave={clearHover}
        />
        <path
          class="edge"
          class:flow={animateFlow && (active || role === "flow")}
          d={edgePath(e)}
          fill="none"
          stroke={stroke}
          stroke-width={active || role ? 2.8 : band === "far" ? 1.1 : 1.4}
          stroke-opacity={edgeOpacity(e)}
          marker-end={marker}
          style:stroke-dasharray={
            e.type === "conceptual" || e.type === "fork"
              ? "6 5"
              : e.confidence === "inferred"
                ? "3 4"
                : animateFlow && (active || role === "flow")
                  ? "8 10"
                  : "none"
          }
        />
        {#if edgeLabelsOn && active}
          {@const a = posOf(e.source)}
          {@const b = posOf(e.target)}
          {#if a && b}
            <text
              class="edge-label"
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 8}
              text-anchor="middle"
              fill={stroke}
            >
              {e.label}
            </text>
          {/if}
        {/if}
      {/each}

      {#each journeyBadges as jb}
        {@const p = posOf(jb.id)}
        {#if p}
          {@const active = journeyActiveStep === jb.i}
          <g
            class="journey-badge"
            class:on={active}
            transform={`translate(${p.x + p.r + 8 + jb.offset * 16}, ${p.y - p.r - 4 - jb.offset * 10})`}
          >
            <circle
              r="11"
              fill={active ? "rgba(138,106,47,0.28)" : "rgba(255,252,247,0.95)"}
              stroke="var(--gold)"
              stroke-width="1.4"
            />
            <text class="journey-idx" text-anchor="middle" dominant-baseline="central" fill="var(--fg)">
              {jb.i + 1}
            </text>
          </g>
        {/if}
      {/each}

      {#each nodes as n (n.id)}
        {@const d = domains[n.domain]}
        {@const p = posOf(n.id)}
        {#if p}
          {@const r = band === "far" ? Math.max(p.r, 26) : p.r}
          {@const sel = selectedId === n.id}
          {@const hi = highlightNodes.has(n.id) || hoveredNode === n.id}
          {@const isUp = upstreamIds.has(n.id)}
          {@const isDown = downstreamIds.has(n.id)}
          <g
            class="node-hit"
            class:hot={hoveredNode === n.id}
            transform={`translate(${p.x},${p.y})`}
            opacity={nodeOpacity(n)}
            onclick={() => onselectnode?.(n.id)}
            onkeydown={(ev) => ev.key === "Enter" && onselectnode?.(n.id)}
            onpointerenter={(ev) => hoverNode(n.id, ev)}
            onpointerleave={clearHover}
            role="button"
            tabindex="0"
            aria-label={n.name}
          >
            {#if sel}
              <circle class="pulse" r={r + 14} fill="none" stroke={d?.color ?? "#8a6a2f"} stroke-width="1.4" />
            {/if}
            <circle
              r={r}
              fill={
                n.kind === "external"
                  ? "var(--node-fill-vendor)"
                  : n.kind === "database" || n.kind === "infrastructure"
                    ? "var(--node-fill-data)"
                    : "var(--node-fill)"
              }
              stroke={
                sel
                  ? "#8a6a2f"
                  : isDown
                    ? "#9a4d63"
                    : isUp
                      ? "#2f6f8a"
                      : hi
                        ? d?.color ?? "#8a6a2f"
                        : d?.color ?? "#5a5044"
              }
              stroke-width={sel || isUp || isDown || hoveredNode === n.id ? 2.8 : 1.8}
            />
            <circle r={Math.max(4, r * 0.22)} fill={d?.color ?? "#8a6a2f"} opacity="0.95" />
            {#if showLabels || sel || hi}
              <text class="node-label" y={r + 16} text-anchor="middle" fill="var(--fg)">
                {n.shortName}
              </text>
            {/if}
            {#if showKinds && (sel || hi || band === "near")}
              <text class="node-kind" y={r + 30} text-anchor="middle" fill="var(--fg-mute)">
                {n.kind === "external" ? "vendor" : n.kind === "database" ? "data" : n.kind}
              </text>
            {/if}
          </g>
        {/if}
      {/each}
    </g>
  </svg>

  {#if tip}
    <div class="tip" style:left="{tip.x}px" style:top="{tip.y}px">
      <p class="tip-meta">{tip.meta}</p>
      <p class="tip-title">{tip.title}</p>
      <p class="tip-body">{tip.body}</p>
    </div>
  {/if}

  <div
    class="nav-pad"
    class:offset={controlsOffset > 0}
    style:--nav-offset="{controlsOffset}px"
    role="toolbar"
    aria-label="Map navigation"
  >
    <div class="nav-group zoom-group">
      <button type="button" class="nav-btn" title="Zoom in (+)" aria-label="Zoom in" onclick={zoomIn}>+</button>
      <button type="button" class="nav-btn" title="Zoom out (−)" aria-label="Zoom out" onclick={zoomOut}>−</button>
      <button type="button" class="nav-btn wide" title="Fit everything (F)" onclick={fitAll}>Fit</button>
    </div>
  </div>
</div>

<style>
  .map-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse 70% 55% at 28% 18%, rgba(47, 111, 138, 0.1), transparent 58%),
      radial-gradient(ellipse 55% 45% at 82% 72%, rgba(138, 106, 47, 0.1), transparent 55%),
      linear-gradient(165deg, #f7f4ed 0%, #efe9de 48%, #f4f1ea 100%);
  }

  .galaxy {
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: grab;
  }

  .galaxy.panning,
  .galaxy:active {
    cursor: grabbing;
  }

  .hull-hit {
    cursor: pointer;
  }

  .hull {
    transition:
      fill-opacity 220ms ease,
      stroke-opacity 220ms ease,
      stroke-width 220ms ease;
  }

  .hull-label {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 500;
    pointer-events: none;
  }

  .edge {
    transition:
      stroke-opacity 220ms ease,
      stroke-width 220ms ease;
    pointer-events: none;
  }

  .edge.flow {
    animation: dash-flow 1.1s linear infinite;
  }

  .edge-hit {
    cursor: pointer;
  }

  .edge-label {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 600;
    paint-order: stroke;
    stroke: rgba(244, 241, 234, 0.92);
    stroke-width: 3.5px;
    pointer-events: none;
  }

  .node-hit {
    cursor: pointer;
    transition: opacity 220ms ease;
  }

  .node-hit.hot {
    filter: brightness(0.97);
  }

  .node-hit:focus {
    outline: none;
  }

  .node-label {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 600;
    paint-order: stroke;
    stroke: rgba(244, 241, 234, 0.95);
    stroke-width: 3.5px;
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

  .journey-badge {
    transition: transform 220ms ease;
  }

  .journey-badge.on {
    transform-box: fill-box;
    transform-origin: center;
  }

  .journey-idx {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 650;
  }

  .tip {
    position: absolute;
    z-index: 6;
    width: min(280px, calc(100% - 24px));
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    box-shadow: var(--shadow);
    pointer-events: none;
    animation: fade-up 140ms ease;
  }

  .tip-meta {
    margin: 0 0 4px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .tip-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 550;
    color: var(--fg);
  }

  .tip-body {
    margin: 5px 0 0;
    font-size: 0.78rem;
    color: var(--fg-dim);
    line-height: 1.4;
  }

  .nav-pad {
    position: absolute;
    right: 14px;
    bottom: 14px;
    z-index: 7;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 14px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow);
    max-width: calc(100% - 28px);
    transition: right 260ms cubic-bezier(0.22, 0.9, 0.2, 1);
  }

  .nav-pad.offset {
    right: calc(14px + var(--nav-offset, 0px));
  }

  .nav-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .zoom-group {
    flex-wrap: nowrap;
  }

  .nav-btn {
    min-width: 36px;
    height: 34px;
    padding: 0 10px;
    border-radius: 9px;
    border: 1px solid rgba(60, 52, 40, 0.18);
    background: #fff;
    color: var(--fg);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1;
  }

  .nav-btn:hover:not(:disabled) {
    border-color: rgba(138, 106, 47, 0.45);
    background: rgba(138, 106, 47, 0.1);
    color: var(--gold);
  }

  .nav-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .nav-btn.wide {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .slider-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .pct {
    font-size: 0.72rem;
    color: var(--gold-soft);
    font-variant-numeric: tabular-nums;
    min-width: 2.6rem;
  }

  .slider-wrap input[type="range"] {
    flex: 1;
    min-width: 72px;
    accent-color: var(--gold);
    height: 4px;
  }

  .pan-pad {
    display: grid;
    grid-template-areas:
      ". up ."
      "left . right"
      ". down .";
    grid-template-columns: 36px 36px 36px;
    gap: 4px;
    justify-content: center;
    width: 100%;
  }

  .nav-btn.pan {
    min-width: 36px;
    padding: 0;
  }

  .map-chrome {
    position: absolute;
    left: 16px;
    bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    color: var(--fg-mute);
    letter-spacing: 0.04em;
    pointer-events: none;
    max-width: min(420px, calc(100% - 200px));
  }

  @media (max-width: 720px) {
    .nav-pad {
      right: 8px;
      bottom: 8px;
      padding: 8px;
    }

    .map-chrome {
      display: none;
    }

    .pan-pad {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .edge.flow,
    .pulse,
    .tip {
      animation: none;
    }
  }
</style>

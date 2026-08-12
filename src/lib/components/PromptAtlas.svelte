<script>
  import {
    dossierFor,
    intelligenceProjects,
  } from "$lib/ecosystem/intelligence.js";
  import { guideFor, plainForKind } from "$lib/ecosystem/plainGuide.js";
  import { domains, nodeById } from "$lib/ecosystem/index.js";
  import {
    productAnchors,
    providerHubs,
    providersForModel,
    productRadius,
    promptMapWorld,
  } from "$lib/ecosystem/promptMapLayout.js";
  import { ddSectionsInGenOrder } from "$lib/ecosystem/ddSections.js";

  /**
   * @type {{
   *   selectedId: string|null,
   *   onselect: (id: string) => void,
   *   onopendesk?: (id: string) => void,
   *   onshowmap?: (id: string) => void,
   * }}
   */
  let { selectedId = null, onselect, onopendesk, onshowmap } = $props();

  /** @type {'constellation'|'kinds'|'models'} */
  let layer = $state("constellation");
  /** @type {string|null} */
  let kindFocus = $state(null);
  /** @type {string|null} */
  let hoverId = $state(null);
  /** @type {string|null} */
  let hoverProv = $state(null);

  let wrapEl = $state(/** @type {HTMLDivElement|null} */ (null));
  let svgEl = $state(/** @type {SVGSVGElement|null} */ (null));
  /** Camera on top of viewBox meet — 1 = whole world fitted in the stage. */
  let scale = $state(1);
  let tx = $state(0);
  let ty = $state(0);
  let panning = $state(false);
  let panStart = $state({ x: 0, y: 0, tx: 0, ty: 0 });
  /** @type {{ id: string, x: number, y: number }|null} */
  let nodePress = null;

  const MIN_SCALE = 0.45;
  const MAX_SCALE = 6;
  const W = promptMapWorld.w;
  const H = promptMapWorld.h;
  const zoomPct = $derived(Math.round(scale * 100));

  /** @param {number} s */
  function clampScale(s) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
  }

  const projects = $derived(
    intelligenceProjects().map((p) => {
      const d = dossierFor(p.nodeId);
      const g = guideFor(p.nodeId);
      const anchor = productAnchors[p.nodeId] ?? { x: W / 2, y: H / 2, ring: 1 };
      const models = d?.prompting.models ?? [];
      /** @type {Set<string>} */
      const prov = new Set();
      for (const m of models) {
        for (const id of providersForModel(m.model)) prov.add(id);
      }
      /** @type {Set<string>} */
      const kinds = new Set((d?.calls ?? []).map((c) => c.kind.split(":")[0]));
      return {
        ...p,
        title: g?.title ?? p.project,
        oneLiner: g?.oneLiner ?? p.summary,
        dossier: d,
        domain: nodeById.get(p.nodeId)?.domain,
        x: anchor.x,
        y: anchor.y,
        ring: anchor.ring,
        r: productRadius(p),
        providers: [...prov],
        kinds,
        color: domains[nodeById.get(p.nodeId)?.domain ?? ""]?.color ?? "#5a4a3a",
      };
    }),
  );

  const aiProjects = $derived(projects.filter((p) => p.hasLlm));
  const activeId = $derived(
    selectedId && projects.some((p) => p.nodeId === selectedId)
      ? selectedId
      : aiProjects[0]?.nodeId ?? null,
  );
  const active = $derived(projects.find((p) => p.nodeId === activeId) ?? null);
  const dossier = $derived(active?.dossier ?? null);
  const guide = $derived(activeId ? guideFor(activeId) : null);

  const kindRollup = $derived.by(() => {
    /** @type {Map<string, { kind: string, count: number, products: Set<string> }>} */
    const map = new Map();
    for (const p of projects) {
      for (const c of p.dossier?.calls ?? []) {
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

  /** Product ↔ provider links from real model rows */
  const providerLinks = $derived.by(() => {
    /** @type {{ from: string, to: string, weight: number }[]} */
    const links = [];
    for (const p of aiProjects) {
      /** @type {Map<string, number>} */
      const w = new Map();
      for (const m of p.dossier?.prompting.models ?? []) {
        for (const id of providersForModel(m.model)) {
          w.set(id, (w.get(id) ?? 0) + 1);
        }
      }
      for (const [to, weight] of w) {
        links.push({ from: p.nodeId, to, weight });
      }
    }
    return links;
  });

  /** Shared-kind ribbons between AI products (precision: intersection of call kinds) */
  const kinshipLinks = $derived.by(() => {
    /** @type {{ a: string, b: string, shared: string[], strength: number }[]} */
    const out = [];
    for (let i = 0; i < aiProjects.length; i++) {
      for (let j = i + 1; j < aiProjects.length; j++) {
        const A = aiProjects[i];
        const B = aiProjects[j];
        const shared = [...A.kinds].filter((k) => B.kinds.has(k));
        if (shared.length < 3) continue;
        out.push({ a: A.nodeId, b: B.nodeId, shared, strength: shared.length });
      }
    }
    return out;
  });

  const activeSkew = $derived(dossier?.kindSkew ?? []);
  const activeModels = $derived(dossier?.prompting.models ?? []);
  const activeFrags = $derived((dossier?.prompting.fragments ?? []).slice(0, 5));
  const activeCalls = $derived((dossier?.calls ?? []).slice(0, 10));

  const tip = $derived.by(() => {
    if (hoverProv && providerHubs[hoverProv]) {
      const hub = providerHubs[hoverProv];
      const users = aiProjects.filter((p) => p.providers.includes(hoverProv));
      return {
        title: hub.label,
        body: `Used by ${users.map((u) => u.title).join(", ") || "—"}`,
      };
    }
    const id = hoverId ?? activeId;
    const p = projects.find((x) => x.nodeId === id);
    if (!p) return null;
    return {
      title: p.title,
      body: `${p.callCount} connections · ${p.hasLlm ? `${p.modelCount} model roles` : "no AI"} · ${p.oneLiner}`,
    };
  });

  /** Reset camera — viewBox `meet` already fits the world; camera scale 1 = that fit. */
  function fit() {
    scale = 1;
    tx = 0;
    ty = 0;
  }

  /**
   * Client (screen) → SVG root user units (viewBox space, before camera).
   * @param {number} clientX
   * @param {number} clientY
   */
  function clientToRoot(clientX, clientY) {
    const svg = svgEl;
    if (!svg) return { x: W / 2, y: H / 2 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: W / 2, y: H / 2 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const root = pt.matrixTransform(ctm.inverse());
    return { x: root.x, y: root.y };
  }

  /** Center of the visible SVG in root (viewBox) space. */
  function viewportRootCenter() {
    const svg = svgEl;
    if (!svg) return { x: W / 2, y: H / 2 };
    const rect = svg.getBoundingClientRect();
    return clientToRoot(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  /**
   * Zoom toward a screen point (or stage center). Uses getScreenCTM — same idea as estate Map.
   * @param {number} factor
   * @param {number} [clientX]
   * @param {number} [clientY]
   */
  function zoomAt(factor, clientX, clientY) {
    const before = scale;
    const next = clampScale(before * factor);
    if (Math.abs(next - before) < 1e-6) return;

    const svg = svgEl;
    let rootX;
    let rootY;
    if (svg && clientX != null && clientY != null) {
      const root = clientToRoot(clientX, clientY);
      rootX = root.x;
      rootY = root.y;
    } else {
      const c = viewportRootCenter();
      rootX = c.x;
      rootY = c.y;
    }

    // World point currently under the cursor
    const wx = (rootX - tx) / before;
    const wy = (rootY - ty) / before;
    scale = next;
    tx = rootX - wx * next;
    ty = rootY - wy * next;
  }

  function zoomIn() {
    zoomAt(1.35);
  }

  function zoomOut() {
    zoomAt(1 / 1.35);
  }

  /**
   * Non-passive wheel so preventDefault works (trackpad + mouse).
   * @param {HTMLElement} node
   */
  function wheelZoom(node) {
    /** @param {WheelEvent} ev */
    const handler = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      let dy = ev.deltaY;
      if (ev.deltaMode === 1) dy *= 16;
      if (ev.deltaMode === 2) dy *= 120;
      const intensity = Math.min(0.35, Math.abs(dy) / 360);
      const factor = dy > 0 ? 1 - intensity * 0.65 : 1 + intensity * 0.75;
      zoomAt(factor, ev.clientX, ev.clientY);
    };
    node.addEventListener("wheel", handler, { passive: false });
    return {
      destroy() {
        node.removeEventListener("wheel", handler);
      },
    };
  }

  /** @param {string} id */
  function pick(id) {
    onselect(id);
    layer = "constellation";
  }

  /** @param {PointerEvent} ev */
  function onPointerDown(ev) {
    if (ev.button != null && ev.button !== 0) return;
    const t = /** @type {Element} */ (ev.target);
    if (t.closest?.(".zoom-pad, button, a, input")) return;
    if (t.closest?.("[data-node]")) return;
    panning = true;
    panStart = { x: ev.clientX, y: ev.clientY, tx, ty };
    svgEl?.setPointerCapture?.(ev.pointerId);
  }

  /** @param {PointerEvent} ev */
  function onPointerMove(ev) {
    if (!panning || !svgEl) return;
    // Pan in root/viewBox units (not CSS px) so drag matches the camera.
    const a = clientToRoot(panStart.x, panStart.y);
    const b = clientToRoot(ev.clientX, ev.clientY);
    tx = panStart.tx + (b.x - a.x);
    ty = panStart.ty + (b.y - a.y);
  }

  /** @param {PointerEvent} ev */
  function onPointerUp(ev) {
    if (!panning) return;
    panning = false;
    try {
      svgEl?.releasePointerCapture?.(ev.pointerId);
    } catch {
      /* already released */
    }
  }

  /** @param {MouseEvent} ev */
  function onDblClick(ev) {
    const t = /** @type {Element} */ (ev.target);
    if (t.closest?.("[data-node], .zoom-pad, button")) return;
    zoomAt(ev.shiftKey ? 1 / 1.5 : 1.5, ev.clientX, ev.clientY);
  }

  /** @param {PointerEvent} ev @param {string} id */
  function onNodePointerDown(ev, id) {
    ev.stopPropagation();
    nodePress = { id, x: ev.clientX, y: ev.clientY };
  }

  /** @param {PointerEvent} ev @param {string} id */
  function onNodePointerUp(ev, id) {
    ev.stopPropagation();
    const press = nodePress;
    nodePress = null;
    if (!press || press.id !== id) return;
    const dx = ev.clientX - press.x;
    const dy = ev.clientY - press.y;
    if (dx * dx + dy * dy < 144) pick(id);
  }

  /**
   * Arc path for call-kind ring around selected product.
   * @param {number} cx
   * @param {number} cy
   * @param {number} r
   * @param {number} a0
   * @param {number} a1
   */
  function arcPath(cx, cy, r, a0, a1) {
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  }

  const selectedArcs = $derived.by(() => {
    if (!active || !activeSkew.length) return [];
    const total = activeSkew.reduce((s, k) => s + (typeof k.count === "number" ? k.count : 1), 0) || activeSkew.length;
    let angle = -Math.PI / 2;
    const r = active.r + 18;
    return activeSkew.map((k) => {
      const n = typeof k.count === "number" ? k.count : 1;
      const sweep = (n / total) * Math.PI * 2;
      const a0 = angle;
      const a1 = angle + Math.max(sweep, 0.12);
      angle = a1;
      const plain = plainForKind(k.kind);
      return {
        kind: k.kind,
        path: arcPath(active.x, active.y, r, a0, a1),
        color: plain.color,
        label: plain.label,
        mid: (a0 + a1) / 2,
        r,
      };
    });
  });

  /** Model satellites around selected AI product */
  const modelSats = $derived.by(() => {
    if (!active?.hasLlm || !activeModels.length) return [];
    const n = activeModels.length;
    return activeModels.map((m, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      const rad = active.r + 56;
      return {
        ...m,
        x: active.x + rad * Math.cos(a),
        y: active.y + rad * Math.sin(a),
        prov: providersForModel(m.model)[0] ?? "other",
      };
    });
  });

  /** @param {string} id */
  function dimmed(id) {
    if (kindFocus) {
      const p = projects.find((x) => x.nodeId === id);
      return !p?.kinds.has(kindFocus);
    }
    if (layer === "models" && hoverProv) {
      const p = projects.find((x) => x.nodeId === id);
      return !p?.providers.includes(hoverProv);
    }
    return false;
  }
</script>

<div class="atlas">
  <header class="hud-top">
    <div class="brand-line">
      <p class="kicker">AI &amp; calls</p>
      <h2>Prompt &amp; call constellation</h2>
      <p class="lede">
        Products sized by connections. Rings = activity mix. Orbits = model jobs. Spokes = shared AI providers.
      </p>
    </div>
    <div class="stats">
      <div><strong>{aiProjects.length}</strong><span>AI products</span></div>
      <div><strong>{providerLinks.length}</strong><span>model links</span></div>
      <div><strong>{kindRollup.length}</strong><span>call types</span></div>
      <div><strong>{kinshipLinks.length}</strong><span>shared-kind ties</span></div>
    </div>
  </header>

  <div class="hud-layers" role="toolbar" aria-label="Map layers">
    <button type="button" class:on={layer === "constellation"} onclick={() => { layer = "constellation"; kindFocus = null; }}>
      Constellation
    </button>
    <button type="button" class:on={layer === "kinds"} onclick={() => { layer = "kinds"; }}>
      Call-type lens
    </button>
    <button type="button" class:on={layer === "models"} onclick={() => { layer = "models"; kindFocus = null; }}>
      Model providers
    </button>
  </div>

  {#if layer === "kinds"}
    <div class="kind-lens" role="listbox" aria-label="Filter by call type">
      <button type="button" class:on={!kindFocus} onclick={() => (kindFocus = null)}>All types</button>
      {#each kindRollup as k}
        <button
          type="button"
          class:on={kindFocus === k.kind}
          style:--accent={k.color}
          onclick={() => (kindFocus = kindFocus === k.kind ? null : k.kind)}
          title={k.plain}
        >
          <i></i>{k.label}
          <em>{k.count}</em>
        </button>
      {/each}
    </div>
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="stage" class:grabbing={panning} bind:this={wrapEl} use:wheelZoom>
    <div
      class="zoom-pad"
      role="toolbar"
      aria-label="Zoom"
      onpointerdown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title="Zoom in (+)"
        aria-label="Zoom in"
        onpointerdown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          zoomIn();
        }}
      >+</button>
      <button
        type="button"
        title="Zoom out (−)"
        aria-label="Zoom out"
        onpointerdown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          zoomOut();
        }}
      >−</button>
      <button
        type="button"
        class="wide"
        title="Fit all"
        onpointerdown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          fit();
        }}
      >Fit</button>
      <span class="pct" title="Current zoom">{zoomPct}%</span>
    </div>

    <svg
      bind:this={svgEl}
      class="map"
      class:grabbing={panning}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Prompt and call constellation"
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      onpointercancel={onPointerUp}
      ondblclick={onDblClick}
    >
      <defs>
        <radialGradient id="atlas-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="rgba(196,163,90,0.14)" />
          <stop offset="55%" stop-color="rgba(126,184,212,0.06)" />
          <stop offset="100%" stop-color="rgba(244,241,234,0)" />
        </radialGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- viewBox fits the world; this group is the zoom/pan camera (estate-Map model). -->
      <g class="camera" transform={`translate(${tx} ${ty}) scale(${scale})`}>
      <rect width={W} height={H} fill="url(#atlas-glow)" pointer-events="none" />

      <!-- Domain hulls -->
      <g class="hulls" opacity="0.55" pointer-events="none">
        <ellipse cx="170" cy="460" rx="140" ry="160" class="hull screener" />
        <text x="90" y="320" class="hull-label">Screener</text>
        <ellipse cx="580" cy="360" rx="220" ry="180" class="hull research" />
        <text x="420" y="200" class="hull-label">Research hub</text>
        <ellipse cx="1040" cy="360" rx="180" ry="150" class="hull portfolio" />
        <text x="960" y="230" class="hull-label">Portfolio</text>
        <ellipse cx="700" cy="740" rx="220" ry="100" class="hull portal" />
        <text x="620" y="660" class="hull-label">Investors</text>
        <ellipse cx="340" cy="840" rx="120" ry="70" class="hull ops" />
        <text x="270" y="790" class="hull-label">Side tools</text>
      </g>

      <!-- Kinship ribbons (shared call kinds) -->
      {#if layer === "constellation" || layer === "kinds"}
        <g class="kin">
          {#each kinshipLinks as link}
            {@const A = projects.find((p) => p.nodeId === link.a)}
            {@const B = projects.find((p) => p.nodeId === link.b)}
            {#if A && B}
              {@const hide =
                (kindFocus && !link.shared.includes(kindFocus)) ||
                (activeId && link.a !== activeId && link.b !== activeId && layer === "constellation")}
              <path
                d={`M ${A.x} ${A.y} Q ${(A.x + B.x) / 2} ${(A.y + B.y) / 2 - 40} ${B.x} ${B.y}`}
                class="kin-path"
                class:dim={hide}
                stroke-width={1 + link.strength * 0.25}
              />
            {/if}
          {/each}
        </g>
      {/if}

      <!-- Provider hubs + spokes -->
      {#if layer === "models" || layer === "constellation"}
        <g class="providers" class:emphasis={layer === "models"}>
          {#each Object.entries(providerHubs) as [id, hub]}
            {@const used = providerLinks.some((l) => l.to === id)}
            {#if used}
              <g
                class="prov"
                class:hot={hoverProv === id || (active && active.providers.includes(id))}
                class:dim={layer === "models" && hoverProv && hoverProv !== id}
                onpointerenter={() => (hoverProv = id)}
                onpointerleave={() => (hoverProv = null)}
              >
                <circle cx={hub.x} cy={hub.y} r="22" class="prov-core" />
                <circle cx={hub.x} cy={hub.y} r="28" class="prov-ring" />
                <text x={hub.x} y={hub.y + 4} class="prov-label">{hub.label}</text>
              </g>
            {/if}
          {/each}
          {#each providerLinks as link}
            {@const p = projects.find((x) => x.nodeId === link.from)}
            {@const hub = providerHubs[link.to]}
            {#if p && hub}
              {@const hide =
                (layer === "models" && hoverProv && hoverProv !== link.to && activeId !== link.from) ||
                (kindFocus && !p.kinds.has(kindFocus))}
              <line
                x1={p.x}
                y1={p.y}
                x2={hub.x}
                y2={hub.y}
                class="spoke"
                class:dim={hide}
                stroke-width={0.8 + link.weight * 0.7}
              />
            {/if}
          {/each}
        </g>
      {/if}

      <!-- Selected activity ring -->
      {#if active && layer !== "kinds"}
        <g class="arcs">
          {#each selectedArcs as arc}
            <path
              d={arc.path}
              class="arc"
              stroke={arc.color}
              fill="none"
              stroke-width="10"
              stroke-linecap="butt"
              opacity="0.85"
            />
          {/each}
        </g>
      {/if}

      <!-- Model satellites -->
      {#if layer !== "kinds" && modelSats.length}
        <g class="sats">
          {#each modelSats as sat}
            <line x1={active?.x} y1={active?.y} x2={sat.x} y2={sat.y} class="sat-link" />
            <circle cx={sat.x} cy={sat.y} r="9" class="sat-dot" />
            <text x={sat.x} y={sat.y - 14} class="sat-label">{sat.role}</text>
            <text x={sat.x} y={sat.y + 22} class="sat-model">{sat.model}</text>
          {/each}
        </g>
      {/if}

      <!-- Product nodes -->
      <g class="products">
        {#each projects as p}
          {@const on = activeId === p.nodeId}
          {@const dim = dimmed(p.nodeId)}
          <g
            class="product"
            class:on
            class:dim
            class:llm={p.hasLlm}
            class:side={p.ring === 1}
            data-node={p.nodeId}
            style:--c={p.color}
            transform={`translate(${p.x}, ${p.y})`}
            onpointerenter={() => (hoverId = p.nodeId)}
            onpointerleave={() => (hoverId = null)}
            onpointerdown={(e) => onNodePointerDown(e, p.nodeId)}
            onpointerup={(e) => onNodePointerUp(e, p.nodeId)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === "Enter" && pick(p.nodeId)}
          >
            <circle class="hit" r={p.r + 16} />
            {#if on}
              <circle r={p.r + 10} class="pulse" />
            {/if}
            <circle r={p.r} class="body" />
            <circle r={Math.max(4, p.r * 0.28)} class="core" />
            <text y={p.r + 16} class="name">{p.title}</text>
            {#if p.hasLlm}
              <text y={p.r + 30} class="meta">{p.modelCount} models · {p.callCount} calls</text>
            {:else}
              <text y={p.r + 30} class="meta">no AI · {p.callCount} calls</text>
            {/if}
          </g>
        {/each}
      </g>
      </g>
    </svg>

    {#if tip}
      <div class="float-tip" aria-live="polite">
        <strong>{tip.title}</strong>
        <span>{tip.body}</span>
      </div>
    {/if}

    <p class="hint-bar">
      + / − / scroll to zoom · drag to pan · double-click zoom in · Fit resets
    </p>
  </div>

  {#if dossier && guide && active}
    <aside class="inspector">
      <header>
        <p class="eyebrow">{domains[active.domain ?? ""]?.shortLabel ?? "Product"}</p>
        <h3>{guide.title}</h3>
        <p class="tag">{guide.aiStory}</p>
        <div class="actions">
          {#if onopendesk}
            <button type="button" class="cta" onclick={() => onopendesk(active.nodeId)}>Full guide</button>
          {/if}
          {#if onopendesk && active.nodeId === "pi-py"}
            <button type="button" class="cta" onclick={() => onopendesk(active.nodeId, "sections")}>
              DD sections
            </button>
          {/if}
          {#if onshowmap}
            <button type="button" class="cta ghost" onclick={() => onshowmap(active.nodeId)}>Estate map</button>
          {/if}
        </div>
      </header>

      {#if active.nodeId === "pi-py"}
        <section>
          <h4>DD sections (gen order)</h4>
          <p class="tag" style="margin-bottom:8px">
            Precise call sequences, templates, models — open <strong>DD sections</strong>.
          </p>
          <ol class="dd-order">
            {#each ddSectionsInGenOrder() as s, i}
              <li>
                <span class="n">{i + 1}</span>
                <span><strong>§{s.id}</strong> {s.name}</span>
                <em>{s.models[0]}</em>
              </li>
            {/each}
          </ol>
        </section>
      {/if}

      {#if activeSkew.length}
        <section>
          <h4>Activity mix</h4>
          <div class="skew">
            {#each activeSkew as k}
              {@const plain = plainForKind(k.kind)}
              <button
                type="button"
                class="chip"
                style:--accent={plain.color}
                class:on={kindFocus === k.kind}
                onclick={() => {
                  layer = "kinds";
                  kindFocus = k.kind;
                }}
              >
                <strong>{plain.label}</strong>
                {#if k.count !== undefined}<em>{k.count}</em>{/if}
              </button>
            {/each}
          </div>
        </section>
      {/if}

      {#if activeModels.length}
        <section>
          <h4>Models by job</h4>
          <ul class="models">
            {#each activeModels as m}
              <li>
                <span>{m.role}</span>
                <code>{m.model}</code>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if activeFrags.length}
        <section>
          <h4>Key writing rules</h4>
          <ul class="frags">
            {#each activeFrags as f}
              <li>{f.instruction}</li>
            {/each}
          </ul>
        </section>
      {/if}

      <section>
        <h4>Connections</h4>
        <div class="calls">
          {#each activeCalls as c}
            {@const plain = plainForKind(c.kind)}
            <div class="call-row">
              <span class="kind" style:--accent={plain.color}>{plain.label}</span>
              <span class="why">{c.purpose}</span>
              <span class="to">{c.callee}</span>
            </div>
          {/each}
        </div>
      </section>
    </aside>
  {/if}
</div>

<style>
  .atlas {
    --atlas-ink: #f3efe6;
    position: relative;
    display: grid;
    grid-template-rows: auto auto auto 1fr;
    height: 100%;
    min-height: 0;
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    background:
      radial-gradient(80% 60% at 20% 10%, rgba(196, 163, 90, 0.1), transparent 50%),
      radial-gradient(70% 50% at 90% 80%, rgba(47, 111, 138, 0.08), transparent 45%),
      var(--panel);
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .hud-top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 14px 6px;
    border-bottom: 1px solid var(--line);
  }

  .kicker {
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .brand-line h2 {
    margin: 2px 0 0;
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 550;
  }

  .lede {
    margin: 3px 0 0;
    font-size: 0.72rem;
    color: var(--fg-mute);
    max-width: 52ch;
    line-height: 1.35;
  }

  .stats {
    display: flex;
    gap: 12px;
  }

  .stats div {
    display: grid;
    gap: 1px;
    min-width: 64px;
  }

  .stats strong {
    font-size: 1.1rem;
    font-variant-numeric: tabular-nums;
  }

  .stats span {
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-mute);
  }

  .hud-layers {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding: 8px 14px;
  }

  .hud-layers button {
    padding: 5px 11px;
    border-radius: 999px;
    border: 1px solid var(--line);
    font-size: 0.72rem;
    color: var(--fg-mute);
  }

  .hud-layers button.on {
    background: rgba(196, 163, 90, 0.18);
    border-color: rgba(196, 163, 90, 0.45);
    color: var(--fg);
    font-weight: 560;
  }

  .kind-lens {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 0 14px 8px;
    max-height: 72px;
    overflow: auto;
  }

  .kind-lens button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid var(--line);
    font-size: 0.66rem;
    color: var(--fg-dim);
  }

  .kind-lens button i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent, var(--gold));
  }

  .kind-lens button.on {
    border-color: color-mix(in srgb, var(--accent, var(--gold)) 55%, transparent);
    background: color-mix(in srgb, var(--accent, var(--gold)) 16%, transparent);
    font-weight: 560;
  }

  .kind-lens em {
    font-style: normal;
    color: var(--gold);
    font-variant-numeric: tabular-nums;
  }

  .stage {
    position: relative;
    min-height: 280px;
    height: 100%;
    cursor: grab;
    overflow: hidden;
    touch-action: none;
    overscroll-behavior: none;
  }

  .stage.grabbing {
    cursor: grabbing;
  }

  .zoom-pad {
    position: absolute;
    z-index: 20;
    left: 12px;
    top: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px;
    border-radius: 12px;
    background: rgba(255, 253, 248, 0.96);
    border: 1px solid var(--panel-border);
    box-shadow: 0 8px 22px rgba(28, 25, 20, 0.1);
    backdrop-filter: blur(8px);
    pointer-events: auto;
  }

  .zoom-pad button {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: #fffdf8;
    color: var(--fg);
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 1;
  }

  .zoom-pad button:hover {
    border-color: rgba(47, 111, 138, 0.45);
    background: rgba(47, 111, 138, 0.08);
  }

  .zoom-pad button.wide {
    width: auto;
    padding: 0 10px;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .zoom-pad .pct {
    min-width: 42px;
    text-align: center;
    font-size: 0.68rem;
    font-variant-numeric: tabular-nums;
    color: var(--fg-mute);
    padding: 0 4px;
  }

  .map {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 280px;
    touch-action: none;
    cursor: grab;
    overflow: hidden;
    background: transparent;
  }

  .map.grabbing {
    cursor: grabbing;
  }

  .hull {
    fill: rgba(28, 25, 20, 0.03);
    stroke: rgba(28, 25, 20, 0.08);
    stroke-dasharray: 4 6;
  }

  .hull.research {
    fill: rgba(42, 85, 112, 0.05);
  }

  .hull.screener {
    fill: rgba(30, 90, 92, 0.08);
  }

  .hull.ops {
    fill: rgba(107, 61, 74, 0.07);
  }

  .hull.portfolio {
    fill: rgba(106, 84, 48, 0.05);
  }

  .hull.portal {
    fill: rgba(53, 96, 64, 0.05);
  }

  .hull-label {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    fill: var(--fg-mute);
    font-family: var(--font-ui);
  }

  .kin-path {
    fill: none;
    stroke: rgba(138, 106, 47, 0.18);
    stroke-linecap: round;
    pointer-events: none;
  }

  .kin-path.dim {
    opacity: 0.08;
  }

  .spoke {
    stroke: rgba(47, 111, 138, 0.28);
    stroke-dasharray: 3 5;
    pointer-events: none;
  }

  .spoke.dim {
    opacity: 0.06;
  }

  .providers.emphasis .spoke {
    stroke: rgba(47, 111, 138, 0.45);
  }

  .prov-core {
    fill: #fffdf8;
    stroke: var(--cyan);
    stroke-width: 1.5;
  }

  .prov-ring {
    fill: none;
    stroke: rgba(47, 111, 138, 0.25);
    stroke-dasharray: 2 3;
  }

  .prov.hot .prov-core {
    stroke: var(--gold);
    filter: url(#soft);
  }

  .prov.dim {
    opacity: 0.2;
  }

  .prov-label {
    text-anchor: middle;
    font-size: 9px;
    fill: var(--fg-dim);
    font-family: var(--font-ui);
    pointer-events: none;
  }

  .arc {
    pointer-events: none;
  }

  .sat-link {
    stroke: rgba(196, 163, 90, 0.35);
    stroke-width: 1;
  }

  .sat-dot {
    fill: var(--gold-soft);
    stroke: #fff;
    stroke-width: 1.5;
  }

  .sat-label,
  .sat-model {
    text-anchor: middle;
    font-family: var(--font-ui);
    pointer-events: none;
  }

  .sat-label {
    font-size: 9px;
    fill: var(--fg);
    font-weight: 560;
  }

  .sat-model {
    font-size: 8px;
    fill: var(--fg-mute);
  }

  .product {
    cursor: pointer;
  }

  .product .hit {
    fill: transparent;
    stroke: none;
    pointer-events: all;
  }

  .product .body {
    fill: #fff;
    stroke: var(--c);
    stroke-width: 2.2;
  }

  .product .core {
    fill: var(--c);
    opacity: 0.85;
  }

  .product.llm .body {
    fill: #fffdf8;
  }

  .product.side .body {
    stroke-width: 1.4;
    stroke-dasharray: 3 2;
  }

  .product .name {
    text-anchor: middle;
    font-size: 12px;
    font-weight: 600;
    fill: var(--fg);
    font-family: var(--font-ui);
    pointer-events: none;
  }

  .product .meta {
    text-anchor: middle;
    font-size: 9px;
    pointer-events: none;
    fill: var(--fg-mute);
    font-family: var(--font-ui);
  }

  .product.on .body {
    stroke-width: 3;
    filter: url(#soft);
  }

  .product.dim {
    opacity: 0.18;
  }

  .pulse {
    fill: none;
    stroke: var(--c);
    stroke-width: 1.5;
    animation: pulse-op 2.2s ease-out infinite;
  }

  @keyframes pulse-op {
    0% {
      opacity: 0.55;
    }
    100% {
      opacity: 0;
    }
  }

  .float-tip {
    position: absolute;
    left: 12px;
    bottom: 36px;
    z-index: 6;
    max-width: min(360px, 55%);
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(255, 252, 247, 0.94);
    border: 1px solid var(--panel-border);
    box-shadow: var(--shadow);
    display: grid;
    gap: 2px;
    pointer-events: none;
  }

  .float-tip strong {
    font-size: 0.8rem;
  }

  .float-tip span {
    font-size: 0.7rem;
    color: var(--fg-mute);
    line-height: 1.35;
  }

  .hint-bar {
    position: absolute;
    right: 12px;
    bottom: 10px;
    margin: 0;
    font-size: 0.66rem;
    color: var(--fg-mute);
    pointer-events: none;
  }

  .inspector {
    position: absolute;
    top: 108px;
    right: 10px;
    bottom: 10px;
    width: min(320px, 38vw);
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255, 252, 247, 0.94);
    border: 1px solid var(--panel-border);
    box-shadow: var(--shadow);
    overflow: auto;
    backdrop-filter: blur(10px);
    animation: fade-up 280ms ease;
  }

  .inspector .eyebrow {
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .inspector h3 {
    margin: 2px 0 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 550;
  }

  .tag {
    margin: 6px 0 0;
    font-size: 0.74rem;
    color: var(--fg-mute);
    line-height: 1.35;
  }

  .dd-order {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }

  .dd-order li {
    display: grid;
    grid-template-columns: 18px 1fr;
    gap: 2px 6px;
    font-size: 0.68rem;
    padding: 4px 0;
    border-bottom: 1px solid var(--line);
  }

  .dd-order .n {
    grid-row: span 2;
    align-self: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(196, 163, 90, 0.16);
    color: var(--gold-soft);
    font-size: 0.6rem;
    font-weight: 600;
  }

  .dd-order em {
    grid-column: 2;
    font-style: normal;
    color: var(--fg-mute);
    font-size: 0.62rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .cta {
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(196, 163, 90, 0.16);
    border: 1px solid rgba(196, 163, 90, 0.4);
    font-size: 0.72rem;
    font-weight: 550;
  }

  .cta.ghost {
    background: transparent;
    border-color: var(--line);
    color: var(--fg-mute);
  }

  .inspector section h4 {
    margin: 0 0 6px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-mute);
  }

  .skew {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .chip {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 7px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: 0.66rem;
  }

  .chip.on {
    font-weight: 600;
  }

  .chip em {
    font-style: normal;
    color: var(--gold);
  }

  .models {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }

  .models li {
    display: grid;
    gap: 1px;
    font-size: 0.72rem;
  }

  .models code {
    font-size: 0.66rem;
    color: var(--gold-soft);
    word-break: break-word;
  }

  .frags {
    margin: 0;
    padding-left: 14px;
    font-size: 0.7rem;
    color: var(--fg-dim);
    line-height: 1.35;
  }

  .calls {
    display: grid;
    gap: 4px;
  }

  .call-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 6px;
    font-size: 0.66rem;
    padding: 4px 0;
    border-bottom: 1px solid var(--line);
  }

  .kind {
    grid-row: span 2;
    align-self: center;
    padding: 2px 6px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-weight: 550;
    white-space: nowrap;
  }

  .why {
    color: var(--fg);
  }

  .to {
    color: var(--fg-mute);
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.62rem;
    word-break: break-all;
  }

  @media (max-width: 900px) {
    .inspector {
      position: relative;
      top: auto;
      right: auto;
      bottom: auto;
      width: 100%;
      max-height: 38vh;
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-bottom: none;
    }

    .atlas {
      grid-template-rows: auto auto auto 1fr auto;
    }

    .stage {
      min-height: 42vh;
    }
  }
</style>

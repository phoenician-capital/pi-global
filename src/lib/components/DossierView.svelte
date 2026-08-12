<script>
  import { plainForKind, guideFor } from "$lib/ecosystem/plainGuide.js";

  /**
   * @type {{
   *   dossier: import('$lib/ecosystem/intelligence.js').Dossier,
   *   pane?: 'calls' | 'prompts' | 'both',
   *   compact?: boolean,
   *   hideHero?: boolean,
   * }}
   */
  let { dossier, pane = "both", compact = false, hideHero = false } = $props();

  const guide = $derived(guideFor(dossier.nodeId));

  let kindFilter = $state("");
  let callQuery = $state("");
  let showTechnical = $state(false);

  const filteredCalls = $derived.by(() => {
    const q = callQuery.trim().toLowerCase();
    return dossier.calls.filter((c) => {
      const base = c.kind.split(":")[0];
      if (kindFilter && base !== kindFilter && c.kind !== kindFilter) return false;
      if (!q) return true;
      const plain = plainForKind(c.kind);
      return `${c.caller} ${c.callee} ${c.kind} ${c.purpose} ${c.auth ?? ""} ${plain.label}`
        .toLowerCase()
        .includes(q);
    });
  });

  /** @param {string} kind */
  function kindBase(kind) {
    return kind.split(":")[0];
  }

  /** @param {string} s */
  function shorten(s) {
    if (!s) return "—";
    const cleaned = s.replace(/^['"`]|['"`]$/g, "");
    if (cleaned.length <= 42) return cleaned;
    const parts = cleaned.split(/[./]/).filter(Boolean);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      const short = `${prev}/${last}`;
      return short.length <= 42 ? short : `…${cleaned.slice(-40)}`;
    }
    return `…${cleaned.slice(-40)}`;
  }

  /** @param {string|undefined} auth */
  function friendlyAuth(auth) {
    if (!auth || auth === "—" || auth === "none") return "Open / none";
    if (/public/i.test(auth)) return "Public";
    if (/jwt|bearer|cookie|pi_auth|securestore/i.test(auth)) return "Signed-in user";
    if (/callback secret|x-api-key|x-webhook|x-auth|origin-auth/i.test(auth)) return "Shared secret";
    if (/iam|mount|conn|redis|fs\b/i.test(auth)) return "Internal / cloud role";
    if (/key|apikey|api key|anthropic|openai|deepseek|resend|smtp/i.test(auth)) return "API key";
    if (/cap iq|capiq|user\/pass|creds|password/i.test(auth)) return "Vendor login";
    if (/not di|orphan/i.test(auth)) return auth;
    return auth.length > 48 ? `${auth.slice(0, 46)}…` : auth;
  }

  /** @param {string} name */
  function friendlyService(name) {
    return name
      .replace(/^OpenAi/, "OpenAI ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\*/g, "")
      .trim();
  }
</script>

<div class="dossier" class:compact>
  {#if guide && !hideHero && (pane === "both" || pane === "calls")}
    <section class="hero">
      <p class="hero-kicker">In plain English</p>
      <h3 class="hero-title">{guide.title}</h3>
      <p class="hero-line">{guide.oneLiner}</p>
      <div class="hero-grid">
        <article>
          <h4>What this does</h4>
          <p>{guide.doesThis}</p>
        </article>
        {#if guide.doesNot}
          <article class="warn">
            <h4>Don’t confuse it with</h4>
            <p>{guide.doesNot}</p>
          </article>
        {/if}
        <article>
          <h4>Who uses it</h4>
          <p>{guide.whoFor}</p>
        </article>
        <article class:ai={dossier.prompting.hasLlm} class:quiet={!dossier.prompting.hasLlm}>
          <h4>How AI shows up</h4>
          <p>{guide.aiStory}</p>
        </article>
      </div>
    </section>
  {/if}

  <div class="toolbar-local">
    <label class="tech-toggle">
      <input type="checkbox" bind:checked={showTechnical} />
      Show technical names
    </label>
    <span class="toolbar-hint">Off by default — easier to read. Turn on for code paths & env vars.</span>
  </div>

  {#if pane === "both" || pane === "calls"}
    <section class="block">
      <header class="block-head">
        <div>
          <h3>Who talks to whom</h3>
          <p class="sub">
            Each row is a real connection. Tap an activity chip to filter.
          </p>
        </div>
        <span class="count">{dossier.calls.length} connections</span>
      </header>

      {#if !guide && !hideHero}
        <p class="lede">{dossier.summary}</p>
      {/if}

      {#if dossier.kindSkew?.length}
        <h4 class="section-label">Activity mix</h4>
        <div class="skew">
          {#each dossier.kindSkew as k}
            {@const plain = plainForKind(k.kind)}
            <button
              type="button"
              class="skew-chip"
              class:on={kindFilter === kindBase(k.kind)}
              style:--accent={plain.color}
              title={plain.plain}
              onclick={() => {
                const base = kindBase(k.kind);
                kindFilter = kindFilter === base ? "" : base;
              }}
            >
              <strong>{plain.label}</strong>
              {#if k.count !== undefined}<em>{k.count}</em>{/if}
              <span>{k.role}</span>
            </button>
          {/each}
        </div>
      {/if}

      <div class="filters">
        <input
          type="search"
          placeholder="Filter by purpose, system, or activity…"
          bind:value={callQuery}
        />
        {#if kindFilter || callQuery}
          <button type="button" class="clear" onclick={() => { kindFilter = ""; callQuery = ""; }}>
            Clear
          </button>
        {/if}
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Why</th>
              <th>{showTechnical ? "From (code)" : "From"}</th>
              <th>{showTechnical ? "To (system)" : "Talks to"}</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredCalls as c}
              {@const plain = plainForKind(c.kind)}
              <tr>
                <td>
                  <span class="kind" style:--accent={plain.color}>{plain.label}</span>
                  {#if showTechnical}
                    <span class="kind-raw">{c.kind}</span>
                  {/if}
                </td>
                <td class="purpose">{c.purpose}</td>
                <td class="mono" title={c.caller}>{showTechnical ? c.caller : shorten(c.caller)}</td>
                <td class="mono" title={c.callee}>{showTechnical ? c.callee : shorten(c.callee)}</td>
                <td class="mute">{showTechnical ? (c.auth ?? "—") : friendlyAuth(c.auth)}</td>
              </tr>
            {:else}
              <tr>
                <td colspan="5" class="empty">Nothing matches that filter.</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if dossier.nonEdges?.length}
        <h4 class="section-label">Intentionally not connected</h4>
        <ul class="notes">
          {#each dossier.nonEdges as n}<li>{n}</li>{/each}
        </ul>
      {/if}
      {#if dossier.notes?.length}
        <h4 class="section-label">Extra notes</h4>
        <ul class="notes">
          {#each dossier.notes as n}<li>{n}</li>{/each}
        </ul>
      {/if}
    </section>
  {/if}

  {#if pane === "both" || pane === "prompts"}
    <section class="block prompts">
      <header class="block-head">
        <div>
          <h3>AI instructions & models</h3>
          <p class="sub">
            {dossier.prompting.hasLlm
              ? "Which AI brains are used, and the rules that steer them."
              : "This product does not call AI models to write or judge."}
          </p>
        </div>
        <span class="count" class:llm={dossier.prompting.hasLlm} class:none={!dossier.prompting.hasLlm}>
          {dossier.prompting.hasLlm ? "Uses AI" : "No AI"}
        </span>
      </header>

      {#if guide}
        <div class="ai-banner" class:on={dossier.prompting.hasLlm}>
          <p>{guide.aiStory}</p>
        </div>
      {/if}

      <p class="lede">{dossier.prompting.summary}</p>

      {#if dossier.prompting.models?.length}
        <h4 class="section-label">Models by job</h4>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th>
                <th>AI model</th>
                {#if showTechnical}
                  <th>Config / notes</th>
                {/if}
              </tr>
            </thead>
            <tbody>
              {#each dossier.prompting.models as m}
                <tr>
                  <td>{m.role}</td>
                  <td class="mono gold">{m.model}</td>
                  {#if showTechnical}
                    <td class="mute mono">{m.env ?? "—"}</td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      {#if dossier.prompting.services?.length}
        <h4 class="section-label">AI helper jobs</h4>
        <ul class="svc">
          {#each dossier.prompting.services as s}
            <li>
              <strong>{friendlyService(s.name)}</strong>
              <span>{s.job}</span>
              {#if showTechnical}<code>{s.name}</code>{/if}
            </li>
          {/each}
        </ul>
      {/if}

      {#if dossier.prompting.pipeline?.length}
        <h4 class="section-label">How the work flows</h4>
        <ol class="pipe">
          {#each dossier.prompting.pipeline as step}<li>{step}</li>{/each}
        </ol>
      {/if}

      {#if dossier.prompting.fragments?.length}
        <h4 class="section-label">Key writing rules</h4>
        <div class="frags">
          {#each dossier.prompting.fragments as f}
            <article class="frag">
              <p class="frag-rule">{f.instruction}</p>
              {#if showTechnical}
                <p class="frag-loc">{f.location}</p>
              {/if}
            </article>
          {/each}
        </div>
      {/if}

      {#if dossier.prompting.corpus && showTechnical}
        <h4 class="section-label">Where prompt files live</h4>
        <p class="mono corpus">{dossier.prompting.corpus}</p>
      {/if}

      {#if dossier.prompting.langfuse && showTechnical}
        <h4 class="section-label">Observability</h4>
        <p class="mute">{dossier.prompting.langfuse}</p>
      {/if}

      <p class="kb">Full documentation: <code>.cursor/{dossier.kbPath}</code></p>
    </section>
  {/if}
</div>

<style>
  .dossier {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .toolbar-local {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--line);
  }

  .tech-toggle {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.8rem;
    color: var(--fg);
    font-weight: 500;
  }

  .toolbar-hint {
    font-size: 0.74rem;
    color: var(--fg-mute);
  }

  .hero {
    padding: 18px 18px 16px;
    border-radius: 14px;
    background:
      radial-gradient(120% 80% at 0% 0%, rgba(196, 163, 90, 0.14), transparent 55%),
      rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(196, 163, 90, 0.22);
    animation: fade-up 360ms ease;
  }

  .hero-kicker {
    margin: 0 0 6px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .hero-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 550;
    letter-spacing: -0.02em;
  }

  .hero-line {
    margin: 8px 0 0;
    color: var(--fg);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .hero-grid article {
    padding: 12px;
    border-radius: 10px;
    background: rgba(40, 32, 20, 0.06);
    border: 1px solid var(--line);
  }

  .hero-grid h4 {
    margin: 0 0 6px;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg-mute);
    font-weight: 500;
  }

  .hero-grid p {
    margin: 0;
    font-size: 0.84rem;
    color: var(--fg-dim);
    line-height: 1.4;
  }

  .hero-grid article.warn {
    border-color: rgba(224, 122, 106, 0.35);
    background: rgba(224, 122, 106, 0.08);
  }

  .hero-grid article.ai {
    border-color: rgba(196, 163, 90, 0.35);
  }

  .block-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .block-head h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 550;
    letter-spacing: -0.02em;
  }

  .sub {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: var(--fg-mute);
    max-width: 40rem;
    line-height: 1.35;
  }

  .section-label {
    margin: 14px 0 8px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--fg-mute);
    font-weight: 500;
  }

  .count {
    flex-shrink: 0;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--fg-mute);
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid var(--line);
  }

  .count.llm {
    color: var(--gold-soft);
    border-color: rgba(196, 163, 90, 0.4);
  }

  .lede {
    margin: 0 0 10px;
    color: var(--fg-dim);
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .ai-banner {
    margin: 0 0 12px;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--line);
  }

  .ai-banner.on {
    background: rgba(196, 163, 90, 0.08);
    border-color: rgba(196, 163, 90, 0.28);
  }

  .ai-banner p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--fg);
    line-height: 1.45;
  }

  .skew {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .skew-chip {
    text-align: left;
    max-width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--line);
    border-left: 3px solid var(--accent, var(--line));
    display: grid;
    gap: 2px;
  }

  .skew-chip strong {
    font-size: 0.78rem;
    color: var(--fg);
    font-weight: 550;
  }

  .skew-chip em {
    font-style: normal;
    font-size: 0.7rem;
    color: var(--accent, var(--gold));
  }

  .skew-chip span {
    font-size: 0.72rem;
    color: var(--fg-mute);
    line-height: 1.3;
  }

  .skew-chip.on {
    background: color-mix(in srgb, var(--accent, var(--gold)) 14%, transparent);
    border-color: color-mix(in srgb, var(--accent, var(--gold)) 45%, transparent);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin: 12px 0 8px;
  }

  .filters input[type="search"] {
    flex: 1;
    min-width: 160px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: rgba(40, 32, 20, 0.06);
    color: var(--fg);
    font-size: 0.82rem;
  }

  .clear {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--line);
    color: var(--fg-dim);
    font-size: 0.75rem;
  }

  .table-wrap {
    overflow: auto;
    border: 1px solid var(--line);
    border-radius: 10px;
    max-height: min(52vh, 520px);
  }

  .compact {
    gap: 12px;
  }

  .compact .block-head h3 {
    font-size: 1rem;
  }

  .compact .sub {
    font-size: 0.74rem;
  }

  .compact .lede,
  .compact .ai-banner p {
    font-size: 0.8rem;
  }

  .compact .skew-chip {
    padding: 5px 8px;
  }

  .compact .skew-chip span {
    display: none;
  }

  .compact th,
  .compact td {
    padding: 6px 8px;
    font-size: 0.74rem;
  }

  .compact .table-wrap {
    max-height: min(48vh, 420px);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }

  th {
    position: sticky;
    top: 0;
    background: var(--panel);
    text-align: left;
    padding: 9px 10px;
    color: var(--fg-mute);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--line);
    z-index: 1;
  }

  td {
    padding: 8px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: var(--fg-dim);
    vertical-align: top;
  }

  tr:hover td {
    background: rgba(255, 255, 255, 0.03);
  }

  .purpose {
    color: var(--fg);
    font-size: 0.82rem;
    line-height: 1.35;
  }

  .mono {
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 0.74rem;
    word-break: break-word;
  }

  .gold {
    color: var(--gold-soft);
  }

  .mute {
    color: var(--fg-mute);
    font-size: 0.78rem;
  }

  .kind {
    display: inline-block;
    padding: 3px 7px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--accent, var(--cyan)) 16%, transparent);
    color: var(--accent, var(--cyan));
    font-size: 0.72rem;
    font-weight: 500;
    line-height: 1.25;
  }

  .kind-raw {
    display: block;
    margin-top: 4px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.65rem;
    color: var(--fg-mute);
  }

  .empty {
    text-align: center;
    color: var(--fg-mute);
    padding: 18px !important;
  }

  .notes {
    margin: 0;
    padding-left: 1.1rem;
    color: var(--fg-dim);
    font-size: 0.84rem;
  }

  .notes li {
    margin: 4px 0;
  }

  .svc {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .svc li {
    display: grid;
    gap: 2px;
    padding: 10px 0;
    border-bottom: 1px solid var(--line);
  }

  .svc strong {
    color: var(--fg);
    font-size: 0.9rem;
  }

  .svc span {
    color: var(--fg-dim);
    font-size: 0.84rem;
  }

  .svc code {
    font-size: 0.7rem;
    color: var(--fg-mute);
  }

  .corpus {
    margin: 0;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(40, 32, 20, 0.06);
    border: 1px solid var(--line);
    color: var(--fg-dim);
    line-height: 1.45;
    word-break: break-word;
  }

  .pipe {
    margin: 0;
    padding-left: 1.2rem;
    color: var(--fg-dim);
    font-size: 0.88rem;
  }

  .pipe li {
    margin: 6px 0;
  }

  .frags {
    display: grid;
    gap: 8px;
  }

  .frag {
    padding: 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--line);
  }

  .frag-rule {
    margin: 0;
    color: var(--fg);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .frag-loc {
    margin: 6px 0 0;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.7rem;
    color: var(--fg-mute);
  }

  .kb {
    margin: 16px 0 0;
    font-size: 0.75rem;
    color: var(--fg-mute);
  }

  .kb code {
    color: var(--gold-soft);
    font-size: 0.72rem;
  }

  @media (max-width: 720px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<script>
  import {
    ddPipelinePhases,
    ddSectionsInGenOrder,
    ddOptionalJobs,
    ddParallelPairs,
    ddSectionById,
  } from "$lib/ecosystem/ddSections.js";
  import { plainForKind } from "$lib/ecosystem/plainGuide.js";

  /** @type {{ sectionId?: string|null }} */
  let { sectionId = null } = $props();

  let selectedId = $state(/** @type {string|null} */ (null));
  let selectedSub = $state(/** @type {string|null} */ (null));
  let showPhases = $state(true);

  const ordered = $derived(ddSectionsInGenOrder());

  $effect(() => {
    if (sectionId && ddSectionById(sectionId)) {
      selectedId = sectionId;
      return;
    }
    if (!selectedId && ordered[0]) selectedId = ordered[0].id;
  });

  const selected = $derived(selectedId ? ddSectionById(selectedId) : null);

  const activeSub = $derived(
    selected?.subs?.find((s) => s.id === selectedSub) ?? selected?.subs?.[0] ?? null,
  );

  /** @param {string} id */
  function isParallel(id) {
    return ddParallelPairs.some((pair) => pair.includes(id));
  }

  /** @param {string} id */
  function parallelMate(id) {
    const pair = ddParallelPairs.find((p) => p.includes(id));
    if (!pair) return null;
    return pair.find((x) => x !== id) ?? null;
  }
</script>

<div class="dd">
  <header class="dd-head">
    <div>
      <p class="kicker">DD engine · per section</p>
      <h3>Precise calls &amp; prompts by section</h3>
      <p class="lede">
        Production order from <code>workflow.py</code>:
        {#each ordered as s, i}
          <button type="button" class="inline" class:on={selectedId === s.id} onclick={() => { selectedId = s.id; selectedSub = null; }}>
            §{s.id}</button>{i < ordered.length - 1 ? " → " : ""}
        {/each}
      </p>
    </div>
    <label class="toggle">
      <input type="checkbox" bind:checked={showPhases} />
      Pipeline phases
    </label>
  </header>

  {#if showPhases}
    <section class="phases">
      <h4>Before &amp; around writing</h4>
      <ol>
        {#each ddPipelinePhases as ph}
          <li>
            <strong>{ph.name}</strong>
            <p>{ph.detail}</p>
            {#if ph.calls.length}
              <div class="call-chips">
                {#each ph.calls as c}
                  {@const plain = plainForKind(c.kind)}
                  <span class="chip" style:--accent={plain.color} title={c.purpose}>
                    {plain.label} → {c.callee}
                  </span>
                {/each}
              </div>
            {/if}
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  <div class="split">
    <aside class="rail">
      <p class="rail-label">Generation order</p>
      <ol>
        {#each ordered as s, i}
          <li>
            <button
              type="button"
              class:on={selectedId === s.id}
              onclick={() => {
                selectedId = s.id;
                selectedSub = null;
              }}
            >
              <span class="num">{i + 1}</span>
              <span class="body">
                <strong>§{s.id} · {s.name}</strong>
                <em>
                  {s.writer}
                  {#if isParallel(s.id)}
                    · ∥ §{parallelMate(s.id)}
                  {/if}
                </em>
              </span>
            </button>
          </li>
        {/each}
      </ol>
    </aside>

    <section class="detail">
      {#if selected}
        <header class="sec-head">
          <p class="eyebrow">
            Section {selected.id}
            {#if selected.deps.length}
              · needs {selected.deps.map((d) => `§${d}`).join(", ")}
            {:else}
              · no deps
            {/if}
            {#if selected.engine}
              · {selected.engine}
            {/if}
          </p>
          <h4>{selected.name}</h4>
          {#if selected.notes}
            <p class="notes">{selected.notes}</p>
          {/if}
        </header>

        <div class="grid">
          <article>
            <h5>Writer / models</h5>
            <p class="mono">{selected.writer}</p>
            <ul class="models">
              {#each selected.models as m}
                <li>{m}</li>
              {/each}
            </ul>
          </article>
          <article>
            <h5>Templates &amp; queries</h5>
            <ul class="paths">
              {#each selected.templates as t}
                <li><code>{t}</code></li>
              {/each}
            </ul>
          </article>
        </div>

        {#if selected.flags?.length || selected.langfuse?.length}
          <div class="meta-row">
            {#if selected.flags?.length}
              <article>
                <h5>Flags / env</h5>
                <ul class="models">
                  {#each selected.flags as f}
                    <li><code>{f}</code></li>
                  {/each}
                </ul>
              </article>
            {/if}
            {#if selected.langfuse?.length}
              <article>
                <h5>Langfuse</h5>
                <ul class="models">
                  {#each selected.langfuse as lf}
                    <li><code>{lf}</code></li>
                  {/each}
                </ul>
              </article>
            {/if}
          </div>
        {/if}

        {#if selected.steps?.length}
          <h5>Call sequence (precise)</h5>
          <ol class="steps">
            {#each selected.steps as st}
              <li>
                <strong>{st.name}</strong>
                {#if st.prompt}<code>{st.prompt}</code>{/if}
                {#if st.model}<em>{st.model}</em>{/if}
                {#if st.detail}<p>{st.detail}</p>{/if}
              </li>
            {/each}
          </ol>
        {/if}

        <h5>Calls for this section</h5>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Talks to</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {#each selected.calls as c}
                {@const plain = plainForKind(c.kind)}
                <tr>
                  <td><span class="kind" style:--accent={plain.color}>{plain.label}</span></td>
                  <td class="mono">{c.callee}</td>
                  <td>{c.purpose}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        {#if selected.subs?.length}
          <div class="subs">
            <h5>Sub-workflows</h5>
            <div class="sub-tabs">
              {#each selected.subs as sub}
                <button
                  type="button"
                  class:on={(selectedSub ?? selected.subs[0].id) === sub.id}
                  onclick={() => (selectedSub = sub.id)}
                >
                  §{sub.id} {sub.name}
                </button>
              {/each}
            </div>
            {#if activeSub}
              <p class="notes">{activeSub.notes}</p>
              <ul class="paths">
                {#each activeSub.templates as t}
                  <li><code>{t}</code></li>
                {/each}
              </ul>
              <ul class="models">
                {#each activeSub.models as m}
                  <li>{m}</li>
                {/each}
              </ul>
              {#if activeSub.steps?.length}
                <ol class="steps">
                  {#each activeSub.steps as st}
                    <li>
                      <strong>{st.name}</strong>
                      {#if st.prompt}<code>{st.prompt}</code>{/if}
                      {#if st.model}<em>{st.model}</em>{/if}
                      {#if st.detail}<p>{st.detail}</p>{/if}
                    </li>
                  {/each}
                </ol>
              {/if}
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr><th>Activity</th><th>Talks to</th><th>Why</th></tr>
                  </thead>
                  <tbody>
                    {#each activeSub.calls as c}
                      {@const plain = plainForKind(c.kind)}
                      <tr>
                        <td><span class="kind" style:--accent={plain.color}>{plain.label}</span></td>
                        <td class="mono">{c.callee}</td>
                        <td>{c.purpose}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </section>
  </div>

  <section class="optional">
    <h4>Optional jobs (not in hot section loop)</h4>
    <div class="opt-grid">
      {#each ddOptionalJobs as job}
        <article>
          <h5>{job.name}</h5>
          <p>{job.detail}</p>
          <p class="mono">{job.models.join(" · ")}</p>
          {#if job.steps?.length}
            <ol class="steps compact">
              {#each job.steps as st}
                <li>
                  <strong>{st.name}</strong>
                  {#if st.prompt}<code>{st.prompt}</code>{/if}
                </li>
              {/each}
            </ol>
          {/if}
          <div class="call-chips">
            {#each job.calls as c}
              {@const plain = plainForKind(c.kind)}
              <span class="chip" style:--accent={plain.color}>{plain.label}: {c.purpose}</span>
            {/each}
          </div>
        </article>
      {/each}
    </div>
  </section>
</div>

<style>
  .dd {
    display: grid;
    gap: 14px;
  }

  .meta-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
    margin-bottom: 10px;
  }

  .steps {
    margin: 0 0 14px;
    padding: 0 0 0 1.1rem;
    display: grid;
    gap: 8px;
    font-size: 0.72rem;
    line-height: 1.35;
  }

  .steps li {
    padding-left: 2px;
  }

  .steps code {
    display: block;
    margin-top: 2px;
    font-size: 0.66rem;
    color: var(--cyan);
    word-break: break-all;
  }

  .steps em {
    display: block;
    margin-top: 2px;
    font-style: normal;
    color: var(--gold-soft);
    font-size: 0.66rem;
  }

  .steps p {
    margin: 3px 0 0;
    color: var(--fg-mute);
  }

  .steps.compact {
    margin: 8px 0;
    gap: 4px;
  }

  .dd-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .kicker {
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .dd-head h3 {
    margin: 2px 0 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 550;
  }

  .lede {
    margin: 6px 0 0;
    font-size: 0.74rem;
    color: var(--fg-mute);
    line-height: 1.5;
    max-width: 72ch;
  }

  .lede code {
    font-size: 0.7rem;
  }

  .inline {
    font: inherit;
    color: var(--cyan);
    text-decoration: underline;
    text-underline-offset: 2px;
    padding: 0 1px;
  }

  .inline.on {
    color: var(--gold-soft);
    font-weight: 600;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: var(--fg-mute);
  }

  .phases {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: rgba(28, 25, 20, 0.03);
  }

  .phases h4,
  .optional h4,
  .rail-label,
  .detail h5 {
    margin: 0 0 8px;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-mute);
  }

  .phases ol {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 8px;
  }

  .phases li strong {
    font-size: 0.8rem;
  }

  .phases li p {
    margin: 2px 0 4px;
    font-size: 0.72rem;
    color: var(--fg-dim);
    line-height: 1.35;
  }

  .call-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .chip {
    font-size: 0.64rem;
    padding: 2px 7px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    max-width: 100%;
  }

  .split {
    display: grid;
    grid-template-columns: minmax(200px, 240px) 1fr;
    gap: 10px;
    min-height: 0;
  }

  .rail {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 8px;
    background: rgba(40, 32, 20, 0.03);
    max-height: min(520px, 60vh);
    overflow: auto;
  }

  .rail ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rail button {
    width: 100%;
    display: flex;
    gap: 8px;
    text-align: left;
    padding: 7px 8px;
    border-radius: 8px;
    margin-bottom: 3px;
    border: 1px solid transparent;
  }

  .rail button:hover {
    background: rgba(28, 25, 20, 0.04);
  }

  .rail button.on {
    background: rgba(196, 163, 90, 0.14);
    border-color: rgba(196, 163, 90, 0.35);
  }

  .num {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 0.65rem;
    font-weight: 600;
    background: rgba(196, 163, 90, 0.16);
    color: var(--gold-soft);
  }

  .body {
    display: grid;
    gap: 1px;
    min-width: 0;
  }

  .body strong {
    font-size: 0.76rem;
  }

  .body em {
    font-style: normal;
    font-size: 0.64rem;
    color: var(--fg-mute);
    line-height: 1.3;
  }

  .detail {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 12px;
    min-width: 0;
    overflow: auto;
    max-height: min(520px, 60vh);
  }

  .eyebrow {
    margin: 0;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .sec-head h4 {
    margin: 4px 0 0;
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 550;
  }

  .notes {
    margin: 6px 0 0;
    font-size: 0.76rem;
    color: var(--fg-dim);
    line-height: 1.4;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 12px 0;
  }

  .grid article {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--line);
    background: rgba(28, 25, 20, 0.02);
  }

  .mono {
    font-family: ui-monospace, Menlo, monospace;
    font-size: 0.7rem;
    word-break: break-word;
    color: var(--gold-soft);
  }

  .models,
  .paths {
    margin: 6px 0 0;
    padding-left: 14px;
    font-size: 0.7rem;
    color: var(--fg-dim);
    line-height: 1.35;
  }

  .paths code {
    font-size: 0.66rem;
    word-break: break-all;
  }

  .table-wrap {
    overflow: auto;
    border: 1px solid var(--line);
    border-radius: 8px;
    margin-top: 6px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.72rem;
  }

  th,
  td {
    padding: 6px 8px;
    text-align: left;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }

  th {
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-mute);
    background: rgba(255, 252, 247, 0.9);
  }

  .kind {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: 0.64rem;
    font-weight: 550;
    white-space: nowrap;
  }

  .subs {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }

  .sub-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }

  .sub-tabs button {
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid var(--line);
    font-size: 0.7rem;
    color: var(--fg-mute);
  }

  .sub-tabs button.on {
    background: rgba(196, 163, 90, 0.14);
    border-color: rgba(196, 163, 90, 0.4);
    color: var(--fg);
  }

  .optional {
    padding-top: 4px;
  }

  .opt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
  }

  .opt-grid article {
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: rgba(28, 25, 20, 0.02);
  }

  .opt-grid h5 {
    margin: 0 0 4px;
    font-size: 0.82rem;
  }

  .opt-grid p {
    margin: 0 0 6px;
    font-size: 0.72rem;
    color: var(--fg-dim);
    line-height: 1.35;
  }

  @media (max-width: 900px) {
    .split {
      grid-template-columns: 1fr;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .rail,
    .detail {
      max-height: none;
    }
  }
</style>

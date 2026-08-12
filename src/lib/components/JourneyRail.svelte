<script>
  import { nodeById } from "$lib/ecosystem/index.js";

  /**
   * @type {{
   *   journey: { name: string, description: string, steps: string[], edgeIds: string[], plainSteps?: string[] } | null | undefined,
   *   activeStep: number,
   *   onstep: (index: number) => void,
   *   onplay?: () => void,
   *   playing?: boolean,
   * }}
   */
  let { journey = null, activeStep = 0, onstep, onplay, playing = false } = $props();
</script>

{#if journey}
  <aside class="rail">
    <header>
      <p class="kicker">Walkthrough</p>
      <h3>{journey.name}</h3>
      <p class="desc">{journey.description}</p>
      <p class="how">Numbers on the map match the steps below. Press Play to auto-advance.</p>
    </header>

    <div class="play-row">
      <button type="button" class="play" onclick={() => onplay?.()}>
        {playing ? "Pause" : "Play"}
      </button>
      <span class="count">Step {activeStep + 1} of {journey.steps.length}</span>
    </div>

    <ol>
      {#each journey.steps as id, i}
        {@const n = nodeById.get(id)}
        {@const plain = journey.plainSteps?.[i]}
        <li>
          <button type="button" class:on={activeStep === i} onclick={() => onstep(i)}>
            <span class="num">{i + 1}</span>
            <span class="body">
              <strong>{n?.shortName ?? id}</strong>
              <em>{plain ?? n?.purpose ?? ""}</em>
            </span>
          </button>
        </li>
      {/each}
    </ol>
  </aside>
{/if}

<style>
  .rail {
    position: absolute;
    left: 12px;
    top: 12px;
    bottom: 12px;
    width: min(300px, calc(100vw - 40px));
    z-index: 4;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 14px 12px;
    border-radius: 14px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(14px);
    box-shadow: var(--shadow);
    animation: fade-up 320ms ease;
  }

  header {
    padding: 0 4px 10px;
    border-bottom: 1px solid var(--line);
  }

  .kicker {
    margin: 0 0 4px;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }

  h3 {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 550;
  }

  .desc {
    margin: 6px 0 0;
    font-size: 0.78rem;
    color: var(--fg-mute);
    line-height: 1.4;
  }

  .how {
    margin: 8px 0 0;
    font-size: 0.72rem;
    color: var(--fg-faint, var(--fg-mute));
    line-height: 1.35;
  }

  .play-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 4px;
  }

  .play {
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(196, 163, 90, 0.14);
    border: 1px solid rgba(196, 163, 90, 0.4);
    color: var(--gold-soft);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .count {
    font-size: 0.72rem;
    color: var(--fg-mute);
    font-variant-numeric: tabular-nums;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: auto;
    min-height: 0;
    flex: 1;
  }

  ol button {
    width: 100%;
    display: flex;
    gap: 10px;
    text-align: left;
    padding: 9px 8px;
    border-radius: 10px;
    margin-bottom: 4px;
    border: 1px solid transparent;
  }

  ol button:hover {
    background: rgba(28, 25, 20, 0.04);
  }

  ol button.on {
    background: rgba(196, 163, 90, 0.12);
    border-color: rgba(196, 163, 90, 0.35);
  }

  .num {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(196, 163, 90, 0.16);
    color: var(--gold-soft);
    font-size: 0.72rem;
    font-weight: 650;
    font-family: var(--font-display);
  }

  .body {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .body strong {
    font-size: 0.84rem;
    color: var(--fg);
  }

  .body em {
    font-style: normal;
    font-size: 0.72rem;
    color: var(--fg-mute);
    line-height: 1.35;
  }

  @media (max-width: 900px) {
    .rail {
      position: relative;
      left: auto;
      top: auto;
      bottom: auto;
      width: 100%;
      max-height: 34vh;
      margin-bottom: 8px;
    }
  }
</style>

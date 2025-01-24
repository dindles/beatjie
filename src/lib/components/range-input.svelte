<script lang="ts">
  let {
    min = 0,
    max = 100,
    step = 1,
    value = $bindable(),
    label = '',
  } = $props()

  // cool little CSS variable pattern:
  const vars = {
    '--gap': 'clamp(3px, 1vmin, 8px)',
    '--line': 'clamp(2px, 0.5vmin, 4px)',
    '--thumb': 'clamp(0.8rem, 2vmin, 2.4rem)',
    '--width': 'clamp(80px, 2vw, 200px)',
  }
</script>

<!-- And then: -->
<label
  style={Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')}
>
  {#if label}
    <span class="emoji-small">{label}</span>
  {/if}

  <input type="range" {min} {max} {step} bind:value />
</label>

<style>
  .emoji-small {
    font-family: 'Noto Emoji';
    font-size: clamp(1.5rem, 6vmin, 4rem);
  }

  input[type='range'] {
    width: var(--width);
    height: var(--thumb);
    appearance: none;
    background: none;
    cursor: pointer;
  }

  /* Track styling */
  input[type='range']::-webkit-slider-runnable-track {
    height: var(--line);
    background: var(--user-colour);
    border-radius: calc(var(--line) / 2);
  }

  input[type='range']::-moz-range-track {
    height: var(--line);
    background: var(--user-colour);
    border-radius: calc(var(--line) / 2);
  }

  /* Thumb styling */
  input[type='range']::-webkit-slider-thumb {
    height: var(--thumb);
    width: var(--thumb);
    border-radius: 15%;
    background: var(--user-colour);
    border: var(--line) solid var(--user-colour);
    appearance: none;
    margin-top: calc((var(--line) - var(--thumb)) / 2);
  }

  input[type='range']::-moz-range-thumb {
    height: var(--thumb);
    width: var(--thumb);
    border-radius: 15%;
    background: var(--user-colour);
    border: var(--line) solid var(--user-colour);
    appearance: none;
  }

  /* Focus state */
  input[type='range']:focus {
    outline: none;
  }

  /* Hover state */
  input[type='range']:hover::-webkit-slider-thumb {
    background: var(--user-colour);
  }

  input[type='range']:hover::-moz-range-thumb {
    background: var(--user-colour);
  }

  label {
    display: flex;
    align-items: center;
    gap: var(--gap);
  }
</style>

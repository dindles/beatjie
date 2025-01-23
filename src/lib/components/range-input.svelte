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
    '--g': '3px', // gap
    '--l': '2px', // line thickness
    '--s': '0.8rem', // thumb size
    '--w': '100px', // width
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
    font-size: min(2vw, 1.5rem);
  }

  input[type='range'] {
    width: var(--w);
    height: var(--s);
    appearance: none;
    background: none;
    cursor: pointer;
  }

  /* Track styling */
  input[type='range']::-webkit-slider-runnable-track {
    height: var(--l);
    background: var(--user-colour);
    border-radius: calc(var(--l) / 2);
  }

  input[type='range']::-moz-range-track {
    height: var(--l);
    background: var(--user-colour);
    border-radius: calc(var(--l) / 2);
  }

  /* Thumb styling */
  input[type='range']::-webkit-slider-thumb {
    height: var(--s);
    width: var(--s);
    border-radius: 15%;
    background: var(--other-color);
    border: var(--l) solid var(--user-colour);
    appearance: none;
    margin-top: calc((var(--l) - var(--s)) / 2);
  }

  input[type='range']::-moz-range-thumb {
    height: var(--s);
    width: var(--s);
    border-radius: 15%;
    background: var(--other-color);
    border: var(--l) solid var(--user-colour);
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
    gap: var(--g);
  }
</style>

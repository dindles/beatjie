<script lang="ts">
  interface Props {
    tagline?: string
  }

  let { tagline }: Props = $props()
</script>

<header class="brand">
  <h1 class="wordmark text-logo">beatjie</h1>
  <div class="face emoji-large" aria-hidden="true">😊</div>
  {#if tagline}
    <p class="tagline">{tagline}</p>
  {/if}
</header>

<style>
  .brand {
    display: grid;
    justify-items: center;
    gap: 0.3em;
    text-align: center;
  }

  .wordmark {
    font-weight: normal;
    line-height: 1;
  }

  .tagline {
    font-family: var(--font-text);
    font-size: var(--text-display);
  }
</style>

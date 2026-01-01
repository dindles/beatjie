<script lang="ts">
  import BeatjieLogo from '$lib/components/beatjie-logo.svelte';
</script>

<main>
  <h1 class="text-logo">Beatjie Logo Demo</h1>

  <section>
    <h2>Default (200px, random hue)</h2>
    <BeatjieLogo />
  </section>

  <section>
    <h2>Small (100px)</h2>
    <BeatjieLogo size={100} />
  </section>

  <section>
    <h2>Large (300px)</h2>
    <BeatjieLogo size={300} />
  </section>

  <section>
    <h2>Interactive (click to change color!)</h2>
    <BeatjieLogo size={200} interactive={true} />
  </section>

  <section>
    <h2>All hues</h2>
    <div class="hue-grid">
      <BeatjieLogo size={120} hue={30} />
      <BeatjieLogo size={120} hue={90} />
      <BeatjieLogo size={120} hue={140} />
      <BeatjieLogo size={120} hue={200} />
      <BeatjieLogo size={120} hue={280} />
      <BeatjieLogo size={120} hue={330} />
    </div>
  </section>
</main>

<style>
  main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  section {
    margin: 3rem 0;
    padding: 2rem;
    border: 5px solid var(--user-colour);
    border-radius: 14px;
  }

  h2 {
    font-family: var(--font-text);
    font-size: var(--text-small);
    margin-bottom: 1rem;
  }

  .hue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    justify-items: center;
  }
</style>

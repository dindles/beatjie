<script lang="ts">
  import '../../fonts.css'
</script>

<svelte:head>
  <title>Beatjie OG Image</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #000;
    }
  </style>
</svelte:head>

<div class="og-container">
  <h1 class="title">beatjie</h1>
  <div class="smiley">😊</div>
  <p class="tagline">have fun <br /> make beats</p>
</div>

<style>
  .og-container {
    width: 1200px;
    height: 630px;
    background: #000;
    display: flex;
    text-align: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .title {
    font-family: 'Zen Dots', sans-serif;
    font-size: 120px;
    font-weight: 500;
    color: oklch(0.75 0.15 200);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .smiley {
    font-family: 'Noto Emoji', sans-serif;
    font-size: 140px;
    font-weight: 700;
    color: oklch(0.75 0.15 200);
    line-height: 1;
    margin: -0.5rem 0;
    margin-top: 0.5rem;
    font-variant-emoji: text;
  }

  .tagline {
    font-family: 'Zen Dots', sans-serif;
    font-size: 36px;
    font-weight: 500;
    color: oklch(0.6 0.1 200);
    margin: 0;
    margin-top: 2.5rem;
    letter-spacing: 0.02em;
  }
</style>

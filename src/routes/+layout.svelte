<script>
  import '../app.css'
  // Supports weights 300-700
  import '@fontsource-variable/noto-emoji'
</script>

<slot />

<style>
  :global(:root) {
    --bg-color: #ffffff;
    --user-color: #000000;
    --max-width: 288px;
    --button-size: 4rem;
    --moji-size: 2rem;
    /* --bg-color: rgb(189, 107, 189); */
  }
</style>

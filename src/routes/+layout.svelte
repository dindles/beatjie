<script>
  import '../app.css'
  // Supports weights 300-700
  import '@fontsource-variable/noto-emoji'
</script>

<slot />

<style>
  :global(:root) {
    --border-color: #333;
    --accent-color: magenta;
    --active-color: teal;
    --playing-color: rgb(178, 26, 178);
    --selected-color: rgb(0, 238, 255);
  }
</style>

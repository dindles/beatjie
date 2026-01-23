<script lang="ts">
  import '../app.css';
  import '../fonts.css';
  import Cursor from '$lib/components/cursor.svelte';
  import ClickPulse from '$lib/components/click-pulse.svelte';

  let { children } = $props();
</script>

<Cursor />
<ClickPulse />
{@render children()}

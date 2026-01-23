<script lang="ts">
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';

  interface Props {
    feedback_state: FeedbackState;
  }

  let { feedback_state }: Props = $props();
</script>

{#if feedback_state.is_visible}
  <div class="global-feedback text-display">
    {feedback_state.message}
  </div>
{/if}

<style>
  .global-feedback {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 50;
    pointer-events: none;
    animation: fadeIn 0.2s ease;
    opacity: 0.8;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.8;
    }
  }
</style>

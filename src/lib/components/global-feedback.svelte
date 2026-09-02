<script lang="ts">
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte'

  interface Props {
    feedback_state: FeedbackState
  }

  let { feedback_state }: Props = $props()
</script>

<div class="global-feedback text-display">
  <!-- confirmations are announced. tooltips repeat the focused control's own label, so they're visual only -->
  <div role="status" aria-live="polite">
    {#if feedback_state.is_visible && feedback_state.kind === 'confirmation'}
      <span class="message">{feedback_state.message}</span>
    {/if}
  </div>
  {#if feedback_state.is_visible && feedback_state.kind === 'tooltip'}
    <span class="message" aria-hidden="true">{feedback_state.message}</span>
  {/if}
</div>

<style>
  .global-feedback {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 50;
    pointer-events: none;
  }

  .message {
    display: block;
    animation: fadeIn 0.2s ease;
    opacity: 0.85;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.85;
    }
  }
</style>

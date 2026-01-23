<script lang="ts">
  interface PulseEffect {
    id: number;
    x: number;
    y: number;
  }

  let pulses: PulseEffect[] = $state([]);
  let pulse_id = 0;

  function handleClick(e: MouseEvent) {
    const new_pulse: PulseEffect = {
      id: pulse_id++,
      x: e.clientX,
      y: e.clientY
    };
    pulses = [...pulses, new_pulse];

    // Remove after animation completes
    setTimeout(() => {
      pulses = pulses.filter((p) => p.id !== new_pulse.id);
    }, 400);
  }

  $effect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  });
</script>

{#each pulses as pulse (pulse.id)}
  <div class="pulse-ring" style="left: {pulse.x}px; top: {pulse.y}px;"></div>
{/each}

<style>
  .pulse-ring {
    position: fixed;
    width: 40px;
    height: 40px;
    border: 3px solid var(--user-colour);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9998;
    animation: pulse-expand 0.4s ease-out forwards;
  }

  @keyframes pulse-expand {
    0% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(0.5);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(2);
    }
  }
</style>

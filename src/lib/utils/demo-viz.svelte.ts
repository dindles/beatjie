// demo-viz.svelte.ts
// Expose demo visualization controls to Playwright via window object

import {
  spotlight,
  pulse,
  setSpotlightDuration,
  setPulseDuration,
  getPulseDuration
} from './demo-mode.svelte';

export function initDemoViz() {
  if (typeof window !== 'undefined') {
    // Expose to Playwright test scripts
    (window as any).demoViz = {
      spotlight: (selector: string | null) => spotlight(selector),
      pulse: (selector: string) => {
        // Apply pulse class directly for immediate effect
        const element = document.querySelector(selector);
        if (element) {
          const duration = getPulseDuration();
          (element as HTMLElement).style.setProperty('--pulse-duration', `${duration}ms`);
          element.classList.add('demo-pulse');
          setTimeout(() => {
            element.classList.remove('demo-pulse');
          }, duration);
          console.log('[Demo Viz] Pulse applied to:', selector, 'duration:', duration);
        } else {
          console.warn('[Demo Viz] Pulse element not found:', selector);
        }
        // Also update state for reactive components
        pulse(selector);
      },
      clearSpotlight: () => spotlight(null),
      setSpotlightDuration: (ms: number) => setSpotlightDuration(ms),
      setPulseDuration: (ms: number) => setPulseDuration(ms)
    };

    console.log('[Demo Viz] Window API initialized');
  }
}

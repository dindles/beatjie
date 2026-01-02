<script lang="ts">
	import {
		getDemoMode,
		getSpotlightTarget,
		getSpotlightDuration
	} from '$lib/utils/demo-mode.svelte';

	let spotlightRect = $state<DOMRect | null>(null);
	let previousTarget = $state<string | null>(null);
	let isVisible = $state(false);

	$effect(() => {
		const target = getSpotlightTarget();
		console.log('[Demo Overlay] Spotlight target changed:', target);

		if (target && target !== previousTarget) {
			const element = document.querySelector(target);
			console.log('[Demo Overlay] Found element:', element);
			if (element) {
				spotlightRect = element.getBoundingClientRect();
				console.log('[Demo Overlay] Spotlight rect:', spotlightRect);
				isVisible = true;
			} else {
				console.warn('[Demo Overlay] Element not found for selector:', target);
			}
		} else if (!target) {
			isVisible = false;
			// Delay clearing rect until fade-out completes
			setTimeout(() => {
				spotlightRect = null;
			}, getSpotlightDuration());
		}

		previousTarget = target;
	});

	$effect(() => {
		console.log('[Demo Overlay] Demo mode:', getDemoMode(), 'Visible:', isVisible, 'Rect:', spotlightRect);
	});
</script>

{#if getDemoMode() && spotlightRect}
	<svg
		class="demo-spotlight-mask"
		class:visible={isVisible}
		style="--spotlight-duration: {getSpotlightDuration()}ms;"
	>
		<defs>
			<mask id="spotlight-mask">
				<rect width="100%" height="100%" fill="black" />
				<rect
					x={spotlightRect.left}
					y={spotlightRect.top}
					width={spotlightRect.width}
					height={spotlightRect.height}
					fill="white"
					rx="14"
				/>
			</mask>
		</defs>
		<rect width="100%" height="100%" fill="black" fill-opacity="0.6" mask="url(#spotlight-mask)" />
	</svg>
{:else}
	<!-- Debug: Show why overlay isn't rendering -->
	<!-- Demo mode: {getDemoMode()}, Rect: {spotlightRect ? 'exists' : 'null'} -->
{/if}

<style>
	.demo-spotlight-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 9999;
		opacity: 0;
		transition: opacity var(--spotlight-duration) ease;
	}

	.demo-spotlight-mask.visible {
		opacity: 1;
	}
</style>

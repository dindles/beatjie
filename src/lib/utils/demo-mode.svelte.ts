// demo-mode.svelte.ts
// Simple reactive state for demo mode

let isDemoMode = $state(false);

export function setDemoMode(value: boolean) {
	isDemoMode = value;
}

export function getDemoMode() {
	return isDemoMode;
}

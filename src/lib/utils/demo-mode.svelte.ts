// demo-mode.svelte.ts
// Demo mode state and visualization controls

let isDemoMode = $state(false);
let spotlightTarget = $state<string | null>(null);
let pulseTarget = $state<string | null>(null);

// Timing configuration (adjustable)
let spotlightDuration = $state(300); // ms for spotlight fade in/out
let pulseDuration = $state(200); // ms for pulse animation

export function setDemoMode(value: boolean) {
	isDemoMode = value;
}

export function getDemoMode() {
	return isDemoMode;
}

export function spotlight(selector: string | null) {
	spotlightTarget = selector;
}

export function pulse(selector: string) {
	pulseTarget = selector;
	setTimeout(() => {
		pulseTarget = null;
	}, pulseDuration);
}

export function getSpotlightTarget() {
	return spotlightTarget;
}

export function getPulseTarget() {
	return pulseTarget;
}

export function setSpotlightDuration(ms: number) {
	spotlightDuration = ms;
}

export function setPulseDuration(ms: number) {
	pulseDuration = ms;
}

export function getSpotlightDuration() {
	return spotlightDuration;
}

export function getPulseDuration() {
	return pulseDuration;
}

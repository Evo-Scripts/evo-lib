/** Accent colour helpers. CEF (Chromium 103) has no color-mix(), so the tints are computed here. */

const DEFAULT_ACCENT = "#19d3f5";

function parse(hex: string): [number, number, number] | null {
	const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
	if (!match) return null;
	return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function mix(rgb: [number, number, number], target: number, amount: number): string {
	const channel = (value: number) => Math.round(value + (target - value) * amount).toString(16).padStart(2, "0");
	return `#${channel(rgb[0])}${channel(rgb[1])}${channel(rgb[2])}`;
}

/** Writes --evo-accent, --evo-accent-rgb, --evo-accent-hi and --evo-accent-lo on :root. */
export function applyAccent(hex: string): void {
	const rgb = parse(hex);
	if (!rgb) return;
	const style = document.documentElement.style;
	const isDefault = hex.toLowerCase() === DEFAULT_ACCENT;
	style.setProperty("--evo-accent", hex);
	style.setProperty("--evo-accent-rgb", rgb.join(", "));
	style.setProperty("--evo-accent-hi", isDefault ? "#7debff" : mix(rgb, 255, 0.45));
	style.setProperty("--evo-accent-lo", isDefault ? "#0a6f94" : mix(rgb, 0, 0.5));
}

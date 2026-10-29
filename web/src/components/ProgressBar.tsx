import { useEffect, useState } from "react";
import { EXIT_MS, useUi } from "../store";

const HOLD_MS = 260;
/** Segments in the track (a gap roughly every 8 %). */
const CELLS = 12;

export function ProgressBar() {
	const progress = useUi((state) => state.progress);
	const clear = useUi((state) => state.clearProgress);
	const config = useUi((state) => state.config);
	const [now, setNow] = useState(() => performance.now());
	const [leaving, setLeaving] = useState(false);

	// Frame clock while running.
	useEffect(() => {
		if (!progress || progress.result) return;
		setLeaving(false);
		let frame = 0;
		const tick = () => {
			setNow(performance.now());
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [progress]);

	// Short hold on the final state, then slide out and clear.
	useEffect(() => {
		if (!progress?.result) return;
		const fade = window.setTimeout(() => setLeaving(true), HOLD_MS);
		const done = window.setTimeout(() => {
			setLeaving(false);
			clear();
		}, HOLD_MS + EXIT_MS);
		return () => {
			window.clearTimeout(fade);
			window.clearTimeout(done);
		};
	}, [progress?.result, clear]);

	if (!progress) return null;

	const elapsed = progress.result === "done" ? progress.duration : Math.min(progress.duration, now - progress.startedAt);
	const ratio = progress.duration > 0 ? Math.max(0, elapsed / progress.duration) : 1;
	const percent = Math.round(ratio * 100);
	const remaining = Math.max(0, (progress.duration - elapsed) / 1000);
	const cancelled = progress.result === "cancelled";
	const filled = ratio * CELLS;
	const lead = ratio >= 1 ? -1 : Math.floor(filled);

	return (
		<div
			className={`absolute left-1/2 -translate-x-1/2`}
			style={{ bottom: `${config.progress.offset}vh` }}
		>
			<div
				className={`evo-slant evo-progress ${cancelled ? "evo-progress--cancelled" : ""} ${leaving ? "evo-out" : "evo-in-up"}`}
				role="progressbar"
				aria-valuenow={percent}
				aria-valuemin={0}
				aria-valuemax={100}
			>
				<div className="evo-progress__top">
					<span className="evo-tick" />
					<span className="evo-display evo-progress__label">{progress.label}</span>
					<span className="evo-progress__percent">
						{String(percent).padStart(3, "0")}
						<small>%</small>
					</span>
				</div>

				{progress.description && <div className="evo-progress__desc">{progress.description}</div>}

				<div className="evo-track">
					{Array.from({ length: CELLS }, (_, index) => {
						const amount = Math.min(1, Math.max(0, filled - index));
						return (
							<div key={index} className={`evo-track__cell ${index === lead && !progress.result ? "evo-track__cell--lead" : ""}`}>
								{amount > 0 && <div className="evo-track__fill" style={{ width: `${amount * 100}%` }} />}
							</div>
						);
					})}
				</div>

				<div className="evo-progress__foot">
					<span className="evo-mono evo-progress__time">{remaining.toFixed(1)}s</span>
					{progress.cancelable && !progress.result && (
						<span className="ml-auto flex items-center gap-3">
							<kbd className="evo-key evo-key--sm">{config.progress.cancelLabel}</kbd>
							<span className="evo-mono">{config.strings.cancel}</span>
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

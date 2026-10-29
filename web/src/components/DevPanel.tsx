import { useEffect, useState } from "react";
import mark from "../assets/evo-mark.svg";
import { emitNui } from "../nui";
import { useUi } from "../store";
import type { NotifyPosition, NotifyType, TextPosition } from "../types";

const SAMPLES: Record<NotifyType, { title: string; description: string; tag?: string }> = {
	success: { title: "Vehicle stored", description: "Your **Sultan RS** was parked in `Pillbox Garage`." },
	error: { title: "Not enough money", description: "You need **$2 500** in cash for this." },
	warning: { title: "Low fuel", description: "Fuel level is at `12%`, find a station.", tag: "Vehicle" },
	info: { title: "Shift started", description: "Report to the front desk.\nYour radio is set to channel `3`.", tag: "Police" },
};

const POSITIONS: NotifyPosition[] = ["top-right", "top-left", "top", "right", "left", "bottom-right", "bottom-left"];
const TEXT_POSITIONS: TextPosition[] = ["left", "right", "top", "bottom"];
const ACCENTS = ["#19D3F5", "#3EE6A0", "#FFB547", "#B78CFF", "#EEF2F6"];

let mockTimer = 0;

/** Starts a mock progress bar and, like the Lua side, stops it once the duration has passed. */
function mockProgress(label: string, description: string, duration: number) {
	window.clearTimeout(mockTimer);
	emitNui("evo-lib:progress", { op: "start", label, description, duration, cancelable: true });
	mockTimer = window.setTimeout(() => emitNui("evo-lib:progress", { op: "stop", completed: true }), duration);
}

function Button({ label, onClick, on = false }: { label: string; onClick: () => void; on?: boolean }) {
	return (
		<button type="button" onClick={onClick} className={`evo-ghost ${on ? "evo-ghost--on" : ""}`}>
			{label}
		</button>
	);
}

/** Browser-only controls that fire the same messages the Lua side sends. */
export function DevPanel() {
	const config = useUi((state) => state.config);
	const [open, setOpen] = useState(true);

	useEffect(() => {
		const timers = [
			window.setTimeout(() => emitNui("evo-lib:notify", { type: "success", ...SAMPLES.success, duration: 6000 }), 300),
			window.setTimeout(() => emitNui("evo-lib:notify", { type: "info", ...SAMPLES.info, duration: 8000 }), 700),
			window.setTimeout(() => emitNui("evo-lib:textui", { op: "show", key: "E", label: "Open stash", description: "Evidence locker #12" }), 500),
			window.setTimeout(() => mockProgress("Lockpicking", "Driver door", 6000), 900),
		];
		return () => timers.forEach((timer) => window.clearTimeout(timer));
	}, []);

	return (
		<div className="evo-slant evo-dev pointer-events-auto absolute bottom-8 left-10">
			<button type="button" onClick={() => setOpen(!open)} className="flex w-full cursor-pointer items-center gap-2.5">
				<img src={mark} alt="" className="h-6 w-6" />
				<span className="evo-display text-[0.95rem]">evo-lib</span>
				<span className="evo-mono ml-auto text-[var(--evo-dim)]">{open ? "hide" : "show"}</span>
			</button>

			{open && (
				<>
					<section className="evo-dev__section">
						<span className="evo-mono">Notify</span>
						<div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
							{(Object.keys(SAMPLES) as NotifyType[]).map((type) => (
								<Button key={type} label={type} onClick={() => emitNui("evo-lib:notify", { type, ...SAMPLES[type] })} />
							))}
						</div>
						<select
							value={config.notify.position}
							onChange={(event) =>
								useUi.getState().setConfig({ notify: { ...config.notify, position: event.target.value as NotifyPosition } })
							}
							className="rounded-md border border-[var(--evo-line-strong)] bg-[var(--evo-surface-2)] px-2 py-1 font-[var(--evo-font-mono)] text-[0.6875rem] text-[var(--evo-text)]"
						>
							{POSITIONS.map((position) => (
								<option key={position} value={position}>
									{position}
								</option>
							))}
						</select>
					</section>

					<section className="evo-dev__section">
						<span className="evo-mono">Progress</span>
						<div className="grid grid-cols-2 gap-3">
							<Button label="start 5s" onClick={() => mockProgress("Repairing engine", "Hold still", 5000)} />
							<Button
								label="cancel"
								onClick={() => {
									window.clearTimeout(mockTimer);
									emitNui("evo-lib:progress", { op: "stop", completed: false });
								}}
							/>
						</div>
					</section>

					<section className="evo-dev__section">
						<span className="evo-mono">Text UI</span>
						<div className="grid grid-cols-4 gap-2.5">
							{TEXT_POSITIONS.map((position) => (
								<Button
									key={position}
									label={position}
									on={config.textui.position === position}
									onClick={() => {
										useUi.getState().setConfig({ textui: { position } });
										emitNui("evo-lib:textui", { op: "show", key: "G", label: "Search", description: "Dumpster" });
									}}
								/>
							))}
						</div>
						<Button label="hide" onClick={() => emitNui("evo-lib:textui", { op: "hide" })} />
					</section>

					<section className="evo-dev__section">
						<span className="evo-mono">Accent</span>
						<div className="flex gap-2.5 pl-1">
							{ACCENTS.map((accent) => (
								<button
									key={accent}
									type="button"
									aria-label={accent}
									onClick={() => emitNui("evo-lib:config", { accent })}
									className="h-5 w-6 cursor-pointer rounded-[4px] -skew-x-12"
									style={{
										background: accent,
										outline: config.accent.toLowerCase() === accent.toLowerCase() ? "2px solid var(--evo-text)" : "none",
										outlineOffset: 2,
									}}
								/>
							))}
						</div>
					</section>
				</>
			)}
		</div>
	);
}

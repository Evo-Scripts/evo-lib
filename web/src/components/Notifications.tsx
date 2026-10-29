import { type CSSProperties, type ReactNode, useEffect } from "react";
import { EXIT_MS, useUi } from "../store";
import type { NotifyPosition, NotifyType, Toast } from "../types";
import { RichText } from "./RichText";

interface Tone {
	color: string;
	rgb: string;
	label: string;
	glyph: ReactNode;
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const TONES: Record<NotifyType, Tone> = {
	success: {
		color: "var(--evo-success)",
		rgb: "var(--evo-success-rgb)",
		label: "Done",
		glyph: (
			<svg viewBox="0 0 16 16" aria-hidden="true">
				<path {...stroke} d="M3 8.5l3.2 3L13 4.5" />
			</svg>
		),
	},
	error: {
		color: "var(--evo-danger)",
		rgb: "var(--evo-danger-rgb)",
		label: "Error",
		glyph: (
			<svg viewBox="0 0 16 16" aria-hidden="true">
				<path {...stroke} d="M4 4l8 8M12 4l-8 8" />
			</svg>
		),
	},
	warning: {
		color: "var(--evo-warning)",
		rgb: "var(--evo-warning-rgb)",
		label: "Warning",
		glyph: (
			<svg viewBox="0 0 16 16" aria-hidden="true">
				<path {...stroke} d="M8 3v6.5" />
				<circle cx="8" cy="12.6" r="1.3" fill="currentColor" />
			</svg>
		),
	},
	info: {
		color: "var(--evo-info)",
		rgb: "var(--evo-info-rgb)",
		label: "Info",
		glyph: (
			<svg viewBox="0 0 16 16" aria-hidden="true">
				<circle cx="8" cy="3.6" r="1.3" fill="currentColor" />
				<path {...stroke} d="M8 7v6" />
			</svg>
		),
	},
};

const STACK: Record<NotifyPosition, string> = {
	"top-right": "top-8 right-8 items-end",
	"top-left": "top-8 left-8 items-start",
	top: "top-8 left-1/2 -translate-x-1/2 items-center",
	right: "top-1/2 right-8 -translate-y-1/2 items-end",
	left: "top-1/2 left-8 -translate-y-1/2 items-start",
	"bottom-right": "bottom-8 right-8 items-end flex-col-reverse",
	"bottom-left": "bottom-8 left-8 items-start flex-col-reverse",
};

function enterAnimation(position: NotifyPosition): string {
	if (position.endsWith("left")) return "evo-in-left";
	if (position === "top") return "evo-in-down";
	return "evo-in-right";
}

function ToastCard({ toast }: { toast: Toast }) {
	const dismiss = useUi((state) => state.dismiss);
	const remove = useUi((state) => state.remove);
	const notice = useUi((state) => state.config.strings.notice);
	const tone = TONES[toast.type];

	// Timer restarts whenever a duplicate merged into this toast (stamp changes).
	useEffect(() => {
		if (toast.leaving) return;
		const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
		return () => window.clearTimeout(timer);
	}, [toast.id, toast.duration, toast.stamp, toast.leaving, dismiss]);

	useEffect(() => {
		if (!toast.leaving) return;
		const timer = window.setTimeout(() => remove(toast.id), EXIT_MS);
		return () => window.clearTimeout(timer);
	}, [toast.leaving, toast.id, remove]);

	const style = { "--tone": tone.color, "--tone-rgb": tone.rgb } as CSSProperties;

	return (
		<div
			className={`evo-slant evo-toast ${toast.leaving ? "evo-out" : enterAnimation(toast.position)}`}
			style={style}
			role="status"
		>
			<span className="evo-toast__slash" />

			<div className="evo-toast__head">
				<span className="evo-toast__glyph">{tone.glyph}</span>
				<span className="evo-display evo-toast__title">{toast.title ?? toast.tag ?? notice}</span>
				{toast.count > 1 && <span className="evo-mono evo-toast__count">x{toast.count}</span>}
			</div>

			<div className="evo-mono evo-toast__meta">
				{tone.label}
				{toast.title && toast.tag && <span> / {toast.tag}</span>}
			</div>

			{toast.description && (
				<div className="evo-toast__body">
					<RichText text={toast.description} />
				</div>
			)}

			<div className="evo-toast__timer">
				<div
					key={toast.stamp}
					style={{ animationDuration: `${toast.duration}ms`, animationPlayState: toast.leaving ? "paused" : "running" }}
				/>
			</div>
		</div>
	);
}

export function Notifications() {
	const toasts = useUi((state) => state.toasts);
	if (toasts.length === 0) return null;

	const groups = new Map<NotifyPosition, Toast[]>();
	for (const toast of toasts) {
		const list = groups.get(toast.position) ?? [];
		list.push(toast);
		groups.set(toast.position, list);
	}

	return (
		<>
			{[...groups.entries()].map(([position, list]) => (
				<div key={position} className={`pointer-events-none absolute flex flex-col gap-3 ${STACK[position] ?? STACK["top-right"]}`}>
					{list.map((toast) => (
						<ToastCard key={toast.id} toast={toast} />
					))}
				</div>
			))}
		</>
	);
}

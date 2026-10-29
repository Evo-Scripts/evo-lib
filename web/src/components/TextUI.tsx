import { useEffect } from "react";
import { EXIT_MS, useUi } from "../store";
import type { TextPosition } from "../types";

const PLACE: Record<TextPosition, string> = {
	left: "left-8 top-1/2 -translate-y-1/2",
	right: "right-8 top-1/2 -translate-y-1/2",
	top: "top-8 left-1/2 -translate-x-1/2",
	bottom: "bottom-[6vh] left-1/2 -translate-x-1/2",
};

const ENTER: Record<TextPosition, string> = {
	left: "evo-in-left",
	right: "evo-in-right",
	top: "evo-in-down",
	bottom: "evo-in-up",
};

export function TextUI() {
	const text = useUi((state) => state.text);
	const clear = useUi((state) => state.clearText);
	const position = useUi((state) => state.config.textui.position);
	const press = useUi((state) => state.config.strings.press);

	useEffect(() => {
		if (!text?.leaving) return;
		const timer = window.setTimeout(clear, EXIT_MS);
		return () => window.clearTimeout(timer);
	}, [text?.leaving, clear]);

	if (!text) return null;
	const place = PLACE[position] ? position : "left";

	return (
		<div className={`absolute ${PLACE[place]}`}>
			<div
				className={`evo-textui ${place === "right" ? "evo-textui--right" : ""} ${
					text.leaving ? "evo-out" : ENTER[place]
				}`}
			>
				{text.key && (
					<div className="evo-textui__cap">
						<span className="evo-mono">{press}</span>
						<kbd className="evo-key">{text.key}</kbd>
					</div>
				)}
				<div className="evo-slant evo-textui__chip">
					<span className="evo-textui__label">
						<span className="evo-tick" />
						{text.label}
					</span>
					{text.description && <span className="evo-textui__desc">{text.description}</span>}
				</div>
			</div>
		</div>
	);
}

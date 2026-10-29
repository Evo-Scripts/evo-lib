import { useEffect } from "react";
import { applyAccent } from "./accent";
import { DevPanel } from "./components/DevPanel";
import { Notifications } from "./components/Notifications";
import { ProgressBar } from "./components/ProgressBar";
import { SoundEngine } from "./components/SoundEngine";
import { TextUI } from "./components/TextUI";
import { isBrowser, postNui, useNuiAction } from "./nui";
import { useUi } from "./store";
import type { NotifyPayload, ProgressPayload, TextPayload, UiConfig } from "./types";

export function App() {
	const accent = useUi((state) => state.config.accent);

	useNuiAction<Partial<UiConfig>>("evo-lib:config", (config) => useUi.getState().setConfig(config));
	useNuiAction<NotifyPayload>("evo-lib:notify", (payload) => useUi.getState().notify(payload));
	useNuiAction<ProgressPayload>("evo-lib:progress", (payload) => useUi.getState().progressEvent(payload));
	useNuiAction<TextPayload>("evo-lib:textui", (payload) => useUi.getState().textEvent(payload));

	useEffect(() => {
		applyAccent(accent);
	}, [accent]);

	useEffect(() => {
		void postNui("ready");
	}, []);

	const browser = isBrowser();

	return (
		<div className="pointer-events-none relative h-full w-full overflow-hidden">
			{browser && <DevBackdrop />}
			<Notifications />
			<TextUI />
			<ProgressBar />
			<SoundEngine />
			{browser && <DevPanel />}
		</div>
	);
}

/** Stand-in for the game world in browser dev mode: a dusk street so the UI is judged over a busy scene. */
function DevBackdrop() {
	return (
		<div
			className="absolute inset-0"
			style={{
				background:
					"radial-gradient(at 78% 30%, rgba(255,181,71,.18), transparent 45%), linear-gradient(180deg, #2a3646 0%, #4a5866 40%, #5e5a52 54%, #24282c 55%, #15181b 100%)",
			}}
		/>
	);
}

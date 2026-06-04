// Generiert mit Claude Opus 4.8
import { icons, type IconName } from "../../lib/icons";

/** Solid-Variante des Icons (für interaktive Komponenten wie die Boards). */
export default function Icon(props: { name: IconName; size?: number; class?: string }) {
	return (
		<svg
			width={props.size ?? 20}
			height={props.size ?? 20}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={props.class}
			aria-hidden="true"
			innerHTML={icons[props.name]}
		/>
	);
}

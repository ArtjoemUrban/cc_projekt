import { createSignal, onMount } from "solid-js";
import Icon from "../ui/Icon";

/** Schaltet zwischen Dark/Light um und merkt sich die Wahl im localStorage. */
export default function ThemeToggle() {
	const [dark, setDark] = createSignal(true);

	onMount(() => setDark(document.documentElement.classList.contains("dark")));

	const toggle = () => {
		const el = document.documentElement;
		const isDark = el.classList.toggle("dark");
		localStorage.setItem("theme", isDark ? "dark" : "light");
		setDark(isDark);
	};

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label="Theme wechseln"
			class="grid place-items-center size-10 rounded-full text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
		>
			<Icon name={dark() ? "sun" : "moon"} />
		</button>
	);
}

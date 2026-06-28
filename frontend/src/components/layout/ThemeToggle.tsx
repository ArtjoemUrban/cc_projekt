import { createSignal, onMount, onCleanup } from "solid-js";
import Icon from "../ui/Icon";

export default function ThemeToggle() {
	const [dark, setDark] = createSignal(true);

	onMount(() => {
		setDark(document.documentElement.classList.contains("dark"));

		const handler = (e: Event) => setDark((e as CustomEvent<{ dark: boolean }>).detail.dark);
		window.addEventListener('theme-change', handler);
		onCleanup(() => window.removeEventListener('theme-change', handler));
	});

	const toggle = () => {
		const isDark = document.documentElement.classList.toggle("dark");
		localStorage.setItem("theme", isDark ? "dark" : "light");
		setDark(isDark);
		window.dispatchEvent(new CustomEvent('theme-change', { detail: { dark: isDark } }));
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

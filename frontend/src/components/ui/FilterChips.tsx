// Generiert mit Claude Opus 4.8
import { For } from "solid-js";

/** Wiederverwendbare Filter-Pills (eine Auswahl aktiv). */
export default function FilterChips(props: {
	options: string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div class="flex flex-wrap gap-2">
			<For each={props.options}>
				{(option) => {
					const active = () => props.value === option;
					return (
						<button
							type="button"
							onClick={() => props.onChange(option)}
							class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
							classList={{
								"bg-accent text-accent-contrast": active(),
								"bg-surface-2 text-muted border border-line hover:text-text": !active(),
							}}
						>
							{option}
						</button>
					);
				}}
			</For>
		</div>
	);
}

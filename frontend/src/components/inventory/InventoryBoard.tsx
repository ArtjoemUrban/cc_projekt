// Generiert mit Claude Opus 4.8
import { createMemo, createSignal, For, Show } from "solid-js";
import Icon from "../ui/Icon";
import FilterChips from "../ui/FilterChips";
import type { InventoryItem } from "../../lib/types";

/**
 * Inventar mit Suche, Kategorie- und Status-Filter.
 * `admin` blendet die Verwaltungs-Buttons ein (Backend folgt).
 */
export default function InventoryBoard(props: {
	items: InventoryItem[];
	categories: string[];
	admin?: boolean;
}) {
	const [query, setQuery] = createSignal("");
	const [category, setCategory] = createSignal("Alle");
	const [status, setStatus] = createSignal("Alle");

	const filtered = createMemo(() => {
		const q = query().trim().toLowerCase();
		return props.items.filter((item) => {
			const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
			const matchesCategory = category() === "Alle" || item.category === category();
			const matchesStatus =
				status() === "Alle" ||
				(status() === "Verfügbar" && item.status === "available") ||
				(status() === "Ausgeliehen" && item.status === "borrowed");
			return matchesQuery && matchesCategory && matchesStatus;
		});
	});

	return (
		<div class="flex flex-col gap-5">
			{/* Suche + Kategorie-Filter */}
			<div class="flex flex-col lg:flex-row lg:items-center gap-3">
				<div class="relative lg:w-64">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
						<Icon name="search" size={18} />
					</span>
					<input
						type="search"
						value={query()}
						onInput={(e) => setQuery(e.currentTarget.value)}
						placeholder="Suchen…"
						class="w-full bg-surface border border-line rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
					/>
				</div>
				<div class="flex-1">
					<FilterChips options={["Alle", ...props.categories]} value={category()} onChange={setCategory} />
				</div>
			</div>

			{/* Status-Filter + Admin-Aktion */}
			<div class="flex flex-wrap items-center justify-between gap-3">
				<FilterChips options={["Alle", "Verfügbar", "Ausgeliehen"]} value={status()} onChange={setStatus} />
				<Show when={props.admin}>
					<button
						type="button"
						class="inline-flex items-center gap-2 px-4 py-2 rounded-ui text-sm font-medium border border-accent text-accent hover:bg-accent-soft transition-colors cursor-pointer"
					>
						<Icon name="plus" size={16} /> Gegenstand
					</button>
				</Show>
			</div>

			{/* Item-Grid */}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<For each={filtered()}>
					{(item) => {
						const available = item.status === "available";
						return (
							<article class="bg-surface border border-line rounded-ui-lg p-5 flex flex-col gap-3">
								<div class="flex items-start justify-between gap-2">
									<h3 class="font-semibold leading-tight">{item.name}</h3>
									<span class="shrink-0 bg-surface-2 border border-line text-muted px-2.5 py-0.5 rounded-full text-xs font-mono">
										{item.category}
									</span>
								</div>
								<p class="text-sm text-muted leading-relaxed flex-1">{item.description}</p>
								<div class="pt-3 border-t border-line">
									<span
										class="inline-flex items-center gap-2 text-sm font-medium"
										classList={{ "text-accent": available, "text-muted": !available }}
									>
										<span
											class="size-2 rounded-full"
											classList={{ "bg-accent": available, "bg-muted": !available }}
										/>
										{available ? "Verfügbar" : "Ausgeliehen"}
									</span>
								</div>
							</article>
						);
					}}
				</For>
			</div>

			<Show when={filtered().length === 0}>
				<p class="text-muted text-center py-10">Keine Gegenstände gefunden.</p>
			</Show>
		</div>
	);
}

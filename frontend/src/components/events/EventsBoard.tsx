// Generiert mit Claude Opus 4.8 und manuell bearbeitet
import { createMemo, createSignal, For, Show } from "solid-js";
import FilterChips from "../ui/FilterChips";
import EventCard from "./EventCard";
import type { EventItem } from "../../lib/types";

/** Event-Liste mit Kategorie-Filter (Daten kommen als Prop rein). */
export default function EventsBoard(props: { events: EventItem[]; categories: string[] }) {
	const options = (): string[] => ["Alle", ...props.categories]; // Hier auch nur fürs Verständnis
	const [active, setActive] = createSignal("Alle");

	const filtered = createMemo(() =>
		active() === "Alle" ? props.events : props.events.filter((e) => e.category === active()),
	);

	return (
		<div class="flex flex-col gap-6">
			<FilterChips options={options()} value={active()} onChange={setActive} />

			<div class="flex flex-col gap-4">
				<For each={filtered()}>{(event) => <EventCard event={event} />}</For>
			</div>

			<Show when={filtered().length === 0}>
				<p class="text-muted text-center py-10">Keine Events in dieser Kategorie.</p>
			</Show>
		</div>
	);
}
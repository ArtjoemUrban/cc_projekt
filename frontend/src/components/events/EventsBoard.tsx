import { createResource, For, Show } from "solid-js";
import { getEvents } from "../../lib/api";
import EventCard from "./EventCard";
import type { EventItem } from "../../lib/types";

export default function EventsBoard() {
	const [events] = createResource<EventItem[]>(getEvents);

	return (
		<div class="flex flex-col gap-4">
			<Show when={!events.loading} fallback={<p class="text-muted text-center py-10">Lade Events…</p>}>
				<Show
					when={(events() ?? []).length > 0}
					fallback={<p class="text-muted text-center py-10">Aktuell keine Events geplant.</p>}
				>
					<For each={events() as EventItem[]}>{(event) => <EventCard event={event} />}</For>
				</Show>
			</Show>
		</div>
	);
}

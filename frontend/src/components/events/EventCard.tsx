import { Show } from "solid-js";
import Icon from "../ui/Icon";
import { dateParts, longDate, shortTime } from "../../lib/format";
import type { EventItem } from "../../lib/types";

export default function EventCard(props: { event: EventItem }) {
	const e = (): EventItem => props.event;
	const parts = () => dateParts(e().start_time);

	return (
		<article class="bg-surface border border-line rounded-ui-lg p-5 flex flex-col sm:flex-row gap-5">
			{/* Datumskachel */}
			<div class="shrink-0 size-16 rounded-ui bg-surface-2 border border-line grid place-content-center text-center">
				<span class="text-2xl font-bold leading-none text-accent">{parts().day}</span>
				<span class="font-mono text-[10px] tracking-widest text-muted mt-1">{parts().month}</span>
			</div>

			{/* Inhalt */}
			<div class="flex-1 min-w-0">
				<h3 class="font-semibold text-lg">{e().title}</h3>
				<Show when={e().description}>
					<p class="text-muted text-sm mt-1 leading-relaxed">{e().description}</p>
				</Show>
				<div class="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 font-mono text-xs text-muted">
					<span class="inline-flex items-center gap-1.5">
						<Icon name="calendar" size={14} /> {longDate(e().start_time)}
					</span>
					<span class="inline-flex items-center gap-1.5">
						<Icon name="clock" size={14} /> {shortTime(e().start_time)} – {shortTime(e().end_time)}
					</span>
					<Show when={e().location}>
						<span class="inline-flex items-center gap-1.5">
							<Icon name="pin" size={14} /> {e().location}
						</span>
					</Show>
					<Show when={e().host_name}>
						<span class="inline-flex items-center gap-1.5">
							{e().host_name}
						</span>
					</Show>
				</div>
			</div>
		</article>
	);
}

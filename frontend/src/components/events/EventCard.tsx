import Icon from "../ui/Icon";
import { dateParts, longDate } from "../../lib/format";
import type { EventItem } from "../../lib/types";

/** Eine Event-Zeile: Datumskachel · Inhalt · Plätze + Anmeldung. */
export default function EventCard(props: { event: EventItem }) {
	const e = props.event;
	const parts = () => dateParts(e.date);
	const full = () => e.taken >= e.capacity;
	const percent = () => Math.min(100, Math.round((e.taken / e.capacity) * 100));

	return (
		<article class="bg-surface border border-line rounded-ui-lg p-5 flex flex-col sm:flex-row gap-5">
			{/* Datumskachel */}
			<div class="shrink-0 size-16 rounded-ui bg-surface-2 border border-line grid place-content-center text-center">
				<span class="text-2xl font-bold leading-none text-accent">{parts().day}</span>
				<span class="font-mono text-[10px] tracking-widest text-muted mt-1">{parts().month}</span>
			</div>

			{/* Inhalt */}
			<div class="flex-1 min-w-0">
				<div class="flex flex-wrap items-center gap-3">
					<h3 class="font-semibold text-lg">{e.title}</h3>
					<span class="bg-accent-soft text-accent px-3 py-0.5 rounded-full text-xs font-mono">
						{e.category}
					</span>
				</div>
				<p class="text-muted text-sm mt-1 leading-relaxed">{e.description}</p>
				<div class="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 font-mono text-xs text-muted">
					<span class="inline-flex items-center gap-1.5">
						<Icon name="calendar" size={14} /> {longDate(e.date)}
					</span>
					<span class="inline-flex items-center gap-1.5">
						<Icon name="clock" size={14} /> {e.time}
					</span>
					<span class="inline-flex items-center gap-1.5">
						<Icon name="pin" size={14} /> {e.location}
					</span>
				</div>
			</div>

			{/* Plätze + Anmeldung */}
			<div class="shrink-0 sm:w-40 flex flex-col sm:items-end gap-2">
				<span class="text-sm font-mono text-muted">
					{e.taken}/{e.capacity} Plätze
				</span>
				<div class="w-full sm:w-32 h-1.5 rounded-full bg-surface-2 overflow-hidden">
					<div class="h-full rounded-full bg-accent" style={{ width: `${percent()}%` }} />
				</div>
				<button
					type="button"
					disabled={full()}
					class="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-ui text-sm font-medium transition-colors"
					classList={{
						"bg-accent text-accent-contrast hover:bg-accent-strong cursor-pointer": !full(),
						"bg-surface-2 text-muted border border-line cursor-not-allowed": full(),
					}}
				>
					{full() ? "Ausgebucht" : "Anmelden"}
				</button>
			</div>
		</article>
	);
}

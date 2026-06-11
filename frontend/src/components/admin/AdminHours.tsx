import { createResource, createSignal, For, Show } from "solid-js";
import { getOpeningHours } from "../../lib/api/openingHours";
import { updateOpeningHours } from "../../lib/api";
import type { OpeningHour } from "../../lib/api/openingHours";

type HourRow = OpeningHour & { name: string };

/** Eine editierbare Zeile pro Wochentag. */
function HourRow(props: { row: HourRow; onSave: (wd: number, open: string, close: string) => Promise<void> }) {
	const [open, setOpen] = createSignal(props.row.open_time ?? "00:00");
	const [close, setClose] = createSignal(props.row.close_time ?? "00:00");

	return (
		<div class="flex flex-wrap items-center gap-3">
			<span class="w-28 text-sm font-medium">{props.row.name}</span>
			<input
				type="time"
				value={open()}
				onInput={(e) => setOpen(e.currentTarget.value)}
				class="bg-surface-2 border border-line rounded-ui px-3 py-1.5 text-sm outline-none focus:border-accent"
			/>
			<span class="text-muted">–</span>
			<input
				type="time"
				value={close()}
				onInput={(e) => setClose(e.currentTarget.value)}
				class="bg-surface-2 border border-line rounded-ui px-3 py-1.5 text-sm outline-none focus:border-accent"
			/>
			<button
				type="button"
				onClick={() => props.onSave(props.row.weekday, open(), close())}
				class="inline-flex items-center justify-center px-3 py-1.5 rounded-ui text-sm border border-line hover:bg-surface-2 cursor-pointer"
			>
				Speichern
			</button>
		</div>
	);
}

export default function AdminHours(props: { onFlash: (msg: string, ok?: boolean) => void }) {
	const [hours] = createResource(getOpeningHours);

	const save = async (wd: number, open: string, close: string) => {
		try {
			await updateOpeningHours(wd, open, close);
			props.onFlash("Öffnungszeiten gespeichert.");
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	return (
		<Show when={!hours.loading} fallback={<p class="text-muted text-sm">Lade…</p>}>
			<Show when={!hours.error} fallback={<p class="text-sm text-red-500">{String(hours.error)}</p>}>
				<div class="flex flex-col gap-3">
					<For each={hours() as HourRow[]}>{(row) => <HourRow row={row} onSave={save} />}</For>
				</div>
			</Show>
		</Show>
	);
}

import { createResource, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../../lib/api";

const inputClass = "w-full bg-surface-2 border border-line rounded-ui px-3 py-2 outline-none focus:border-accent transition-colors text-sm";
const labelClass = "flex flex-col gap-1 text-sm";
const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-ui font-medium text-sm bg-accent text-accent-contrast hover:bg-accent-strong transition-colors cursor-pointer";
const btnOutline = "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-ui text-sm border border-line text-text hover:bg-surface-2 transition-colors cursor-pointer";
const btnDanger = "inline-flex items-center justify-center px-3 py-1.5 rounded-ui text-sm border border-line text-red-500 hover:bg-red-500/10 cursor-pointer";

type EventForm = {
	title: string;
	start_time: string;
	end_time: string;
	location: string;
	host_name: string;
	description: string;
};

const emptyForm = (): EventForm => ({ title: "", start_time: "", end_time: "", location: "", host_name: "", description: "" });

function fmtRange(start: string, end: string) {
	const f = (s: string) => {
		const d = new Date(s);
		return isNaN(d.getTime()) ? s : d.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
	};
	return `${f(start)} – ${f(end)}`;
}

function toLocalInput(value: string) {
	const d = new Date(value);
	if (isNaN(d.getTime())) return value?.slice(0, 16) ?? "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminEvents(props: { onFlash: (msg: string, ok?: boolean) => void }) {
	const [events, { refetch }] = createResource(getEvents);
	const [editingId, setEditingId] = createSignal<number | null>(null);
	const [form, setForm] = createStore<EventForm>(emptyForm());

	const startEdit = (ev: any) => {
		setEditingId(ev.id);
		setForm({
			title: ev.title ?? "",
			start_time: toLocalInput(ev.start_time),
			end_time: toLocalInput(ev.end_time),
			location: ev.location ?? "",
			host_name: ev.host_name ?? "",
			description: ev.description ?? "",
		});
	};

	const reset = () => {
		setEditingId(null);
		setForm(emptyForm());
	};

	const submit = async (e: Event) => {
		e.preventDefault();
		const payload = {
			title: form.title.trim(),
			start_time: form.start_time,
			end_time: form.end_time,
			location: form.location.trim() || null,
			host_name: form.host_name.trim() || null,
			description: form.description.trim() || null,
		};
		try {
			if (editingId() !== null) {
				await updateEvent(editingId()!, payload);
				props.onFlash("Event aktualisiert.");
			} else {
				await createEvent(payload);
				props.onFlash("Event erstellt.");
			}
			reset();
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	const remove = async (id: number) => {
		if (!confirm("Event wirklich löschen?")) return;
		try {
			await deleteEvent(id);
			props.onFlash("Event gelöscht.");
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	return (
		<div class="flex flex-col gap-6">
			<div class="bg-surface border border-line rounded-ui-lg p-5">
				<h2 class="font-display text-xl font-bold mb-4">
					{editingId() !== null ? "Event bearbeiten" : "Neues Event"}
				</h2>
				<form class="grid sm:grid-cols-2 gap-4" onSubmit={submit}>
					<label class={`${labelClass} sm:col-span-2`}>
						<span class="font-medium">Titel</span>
						<input class={inputClass} value={form.title} onInput={(e) => setForm("title", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Start</span>
						<input class={inputClass} type="datetime-local" value={form.start_time} onInput={(e) => setForm("start_time", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Ende</span>
						<input class={inputClass} type="datetime-local" value={form.end_time} onInput={(e) => setForm("end_time", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Ort</span>
						<input class={inputClass} value={form.location} onInput={(e) => setForm("location", e.currentTarget.value)} />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Veranstalter:in</span>
						<input class={inputClass} value={form.host_name} onInput={(e) => setForm("host_name", e.currentTarget.value)} />
					</label>
					<label class={`${labelClass} sm:col-span-2`}>
						<span class="font-medium">Beschreibung</span>
						<textarea class={inputClass} rows="2" value={form.description} onInput={(e) => setForm("description", e.currentTarget.value)} />
					</label>
					<div class="sm:col-span-2 flex gap-2">
						<button type="submit" class={btnPrimary}>Speichern</button>
						<button type="button" class={btnOutline} onClick={reset}>Abbrechen</button>
					</div>
				</form>
			</div>

			<Show when={!events.loading} fallback={<p class="text-muted text-sm">Lade…</p>}>
				<Show when={(events() as any[])?.length > 0} fallback={<p class="text-muted text-sm">Noch keine Events.</p>}>
					<div class="flex flex-col gap-3">
						<For each={events() as any[]}>
							{(ev) => (
								<div class="bg-surface border border-line rounded-ui-lg p-4 flex flex-wrap items-start justify-between gap-3">
									<div>
										<h3 class="font-medium">{ev.title}</h3>
										<p class="text-sm text-muted">{fmtRange(ev.start_time, ev.end_time)}</p>
										<Show when={ev.location}><p class="text-sm text-muted">📍 {ev.location}</p></Show>
										<Show when={ev.description}><p class="text-sm mt-1">{ev.description}</p></Show>
									</div>
									<div class="flex gap-2">
										<button class={btnOutline} onClick={() => startEdit(ev)}>Bearbeiten</button>
										<button class={btnDanger} onClick={() => remove(ev.id)}>Löschen</button>
									</div>
								</div>
							)}
						</For>
					</div>
				</Show>
			</Show>
		</div>
	);
}

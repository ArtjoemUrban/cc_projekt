import { createResource, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "../../lib/api";

const inputClass = "w-full bg-surface-2 border border-line rounded-ui px-3 py-2 outline-none focus:border-accent transition-colors text-sm";
const labelClass = "flex flex-col gap-1 text-sm";
const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-ui font-medium text-sm bg-accent text-accent-contrast hover:bg-accent-strong transition-colors cursor-pointer";
const btnOutline = "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-ui text-sm border border-line text-text hover:bg-surface-2 transition-colors cursor-pointer";
const btnDanger = "inline-flex items-center justify-center px-3 py-1.5 rounded-ui text-sm border border-line text-red-500 hover:bg-red-500/10 cursor-pointer";

type InvForm = {
	name: string;
	category: string;
	quantity: number;
	picture_url: string;
	description: string;
	is_for_borrow: boolean;
};

const emptyForm = (): InvForm => ({ name: "", category: "", quantity: 0, picture_url: "", description: "", is_for_borrow: true });

export default function AdminInventory(props: { onFlash: (msg: string, ok?: boolean) => void }) {
	const [items, { refetch }] = createResource(getInventory);
	const [editingId, setEditingId] = createSignal<number | null>(null);
	const [form, setForm] = createStore<InvForm>(emptyForm());

	const startEdit = (it: any) => {
		setEditingId(it.id);
		setForm({
			name: it.name ?? "",
			category: it.category ?? "",
			quantity: it.quantity ?? 0,
			picture_url: it.picture_url ?? "",
			description: it.description ?? "",
			is_for_borrow: !!it.is_for_borrow,
		});
	};

	const reset = () => {
		setEditingId(null);
		setForm(emptyForm());
	};

	const submit = async (e: Event) => {
		e.preventDefault();
		const payload = {
			name: form.name.trim(),
			category: form.category.trim(),
			quantity: form.quantity,
			picture_url: form.picture_url.trim() || null,
			description: form.description.trim() || null,
			is_for_borrow: form.is_for_borrow,
		};
		try {
			if (editingId() !== null) {
				await updateInventoryItem(editingId()!, payload);
				props.onFlash("Artikel aktualisiert.");
			} else {
				await createInventoryItem(payload);
				props.onFlash("Artikel erstellt.");
			}
			reset();
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	const remove = async (id: number) => {
		if (!confirm("Artikel wirklich löschen?")) return;
		try {
			await deleteInventoryItem(id);
			props.onFlash("Artikel gelöscht.");
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	return (
		<div class="flex flex-col gap-6">
			<div class="bg-surface border border-line rounded-ui-lg p-5">
				<h2 class="font-display text-xl font-bold mb-4">
					{editingId() !== null ? "Artikel bearbeiten" : "Neuer Inventar-Artikel"}
				</h2>
				<form class="grid sm:grid-cols-2 gap-4" onSubmit={submit}>
					<label class={labelClass}>
						<span class="font-medium">Name</span>
						<input class={inputClass} value={form.name} onInput={(e) => setForm("name", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Kategorie</span>
						<input class={inputClass} value={form.category} onInput={(e) => setForm("category", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Menge</span>
						<input class={inputClass} type="number" min="0" value={form.quantity} onInput={(e) => setForm("quantity", Number(e.currentTarget.value))} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Bild-URL</span>
						<input class={inputClass} value={form.picture_url} onInput={(e) => setForm("picture_url", e.currentTarget.value)} />
					</label>
					<label class={`${labelClass} sm:col-span-2`}>
						<span class="font-medium">Beschreibung</span>
						<textarea class={inputClass} rows="2" value={form.description} onInput={(e) => setForm("description", e.currentTarget.value)} />
					</label>
					<label class="flex items-center gap-2 text-sm sm:col-span-2">
						<input type="checkbox" checked={form.is_for_borrow} onChange={(e) => setForm("is_for_borrow", e.currentTarget.checked)} />
						<span>Verleihbar</span>
					</label>
					<div class="sm:col-span-2 flex gap-2">
						<button type="submit" class={btnPrimary}>Speichern</button>
						<button type="button" class={btnOutline} onClick={reset}>Abbrechen</button>
					</div>
				</form>
			</div>

			<Show when={!items.loading} fallback={<p class="text-muted text-sm">Lade…</p>}>
				<Show when={(items() as any[])?.length > 0} fallback={<p class="text-muted text-sm">Noch keine Artikel.</p>}>
					<div class="flex flex-col gap-3">
						<For each={items() as any[]}>
							{(it) => (
								<div class="bg-surface border border-line rounded-ui-lg p-4 flex flex-wrap items-start justify-between gap-3">
									<div>
										<h3 class="font-medium">{it.name} <span class="text-muted text-sm">· {it.category}</span></h3>
										<p class="text-sm text-muted">Bestand: {it.quantity_available}/{it.quantity}{!it.is_for_borrow ? " · nicht verleihbar" : ""}</p>
										<Show when={it.description}><p class="text-sm mt-1">{it.description}</p></Show>
									</div>
									<div class="flex gap-2">
										<button class={btnOutline} onClick={() => startEdit(it)}>Bearbeiten</button>
										<button class={btnDanger} onClick={() => remove(it.id)}>Löschen</button>
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

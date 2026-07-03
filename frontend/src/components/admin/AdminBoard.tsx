import { createResource, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { getAllBoardMembers, createBoardMember, updateBoardMember, deleteBoardMember, uploadBoardMemberImage, removeBoardMemberImage } from "../../lib/api";

const API_URL = "http://localhost:3000";
const inputClass = "w-full bg-surface-2 border border-line rounded-ui px-3 py-2 outline-none focus:border-accent transition-colors text-sm";
const labelClass = "flex flex-col gap-1 text-sm";
const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-ui font-medium text-sm bg-accent text-accent-contrast hover:bg-accent-strong transition-colors cursor-pointer";
const btnOutline = "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-ui text-sm border border-line text-text hover:bg-surface-2 transition-colors cursor-pointer";
const btnDanger = "inline-flex items-center justify-center px-3 py-1.5 rounded-ui text-sm border border-line text-red-500 hover:bg-red-500/10 cursor-pointer";

type BoardForm = {
	name: string;
	position: string;
	description: string;
	image_path: string;
	sort_order: number;
	visible: boolean;
};

const emptyForm = (): BoardForm => ({ name: "", position: "", description: "", image_path: "", sort_order: 0, visible: true });

export default function AdminBoard(props: { onFlash: (msg: string, ok?: boolean) => void }) {
	const [members, { refetch }] = createResource(getAllBoardMembers);
	const [editingId, setEditingId] = createSignal<number | null>(null);
	const [form, setForm] = createStore<BoardForm>(emptyForm());
	const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
	let fileInput!: HTMLInputElement;

	const startEdit = (m: any) => {
		setEditingId(m.id);
		setForm({
			name: m.name ?? "",
			position: m.position ?? "",
			description: m.description ?? "",
			image_path: m.image_path ?? "",
			sort_order: m.sort_order ?? 0,
			visible: !!m.visible,
		});
		setPreviewUrl(m.image_path ? `${API_URL}${m.image_path}` : null);
		if (fileInput) fileInput.value = "";
	};

	const reset = () => {
		setEditingId(null);
		setForm(emptyForm());
		setPreviewUrl(null);
		if (fileInput) fileInput.value = "";
	};

	const removeImage = async () => {
		if (fileInput?.files?.[0]) {
			fileInput.value = "";
			setPreviewUrl(form.image_path ? `${API_URL}${form.image_path}` : null);
			return;
		}
		if (!form.image_path) return;
		if (editingId() === null) {
			setForm("image_path", "");
			setPreviewUrl(null);
			return;
		}
		if (!confirm("Bild wirklich entfernen?")) return;
		try {
			await removeBoardMemberImage(editingId()!);
			setForm("image_path", "");
			setPreviewUrl(null);
			props.onFlash("Bild entfernt.");
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	const submit = async (e: Event) => {
		e.preventDefault();
		let imagePath = form.image_path || null;
		const file = fileInput?.files?.[0];
		if (file) {
			try {
				const { url } = await uploadBoardMemberImage(file);
				imagePath = url;
			} catch (err) {
				props.onFlash(`Bild-Upload fehlgeschlagen: ${(err as Error).message}`, false);
				return;
			}
		}
		const payload = {
			name: form.name.trim(),
			position: form.position.trim(),
			description: form.description.trim() || null,
			image_path: imagePath,
			sort_order: form.sort_order || 0,
			visible: form.visible,
		};
		try {
			if (editingId() !== null) {
				await updateBoardMember(editingId()!, payload);
				props.onFlash("Boardmitglied aktualisiert.");
			} else {
				await createBoardMember(payload);
				props.onFlash("Boardmitglied erstellt.");
			}
			reset();
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	const remove = async (id: number) => {
		if (!confirm("Boardmitglied wirklich löschen?")) return;
		try {
			await deleteBoardMember(id);
			props.onFlash("Boardmitglied gelöscht.");
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	return (
		<div class="flex flex-col gap-6">
			<div class="bg-surface border border-line rounded-ui-lg p-5">
				<h2 class="font-display text-xl font-bold mb-4">
					{editingId() !== null ? "Boardmitglied bearbeiten" : "Neues Boardmitglied"}
				</h2>
				<form class="grid sm:grid-cols-2 gap-4" onSubmit={submit}>
					<label class={labelClass}>
						<span class="font-medium">Name</span>
						<input class={inputClass} value={form.name} onInput={(e) => setForm("name", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Position</span>
						<input class={inputClass} value={form.position} onInput={(e) => setForm("position", e.currentTarget.value)} required placeholder="z. B. 1. Vorsitzende:r" />
					</label>
					<label class={`${labelClass} sm:col-span-2`}>
						<span class="font-medium">Beschreibung</span>
						<textarea class={inputClass} rows="2" value={form.description} onInput={(e) => setForm("description", e.currentTarget.value)} placeholder="Studiengang, Bio, …" />
					</label>
					<div class={labelClass}>
						<span class="font-medium">Bild</span>
						<div class="flex items-center gap-3">
							<Show when={previewUrl()}>
								<img src={previewUrl()!} alt="" class="size-14 rounded-full object-cover border border-line" />
							</Show>
							<label class={`cursor-pointer ${btnOutline}`}>
								Bild auswählen
								<input
									type="file"
									accept="image/*"
									class="sr-only"
									ref={fileInput}
									onChange={() => {
										const file = fileInput?.files?.[0];
										if (file) setPreviewUrl(URL.createObjectURL(file));
									}}
								/>
							</label>
							<Show when={previewUrl()}>
								<button type="button" class={btnDanger} onClick={removeImage}>Bild entfernen</button>
							</Show>
						</div>
					</div>
					<label class={labelClass}>
						<span class="font-medium">Reihenfolge</span>
						<input class={inputClass} type="number" min="0" value={form.sort_order} onInput={(e) => setForm("sort_order", Number(e.currentTarget.value))} />
					</label>
					<label class="flex items-center gap-2 text-sm sm:col-span-2">
						<input type="checkbox" checked={form.visible} onChange={(e) => setForm("visible", e.currentTarget.checked)} />
						<span>Sichtbar auf der Mitgliederseite</span>
					</label>
					<div class="sm:col-span-2 flex gap-2">
						<button type="submit" class={btnPrimary}>Speichern</button>
						<button type="button" class={btnOutline} onClick={reset}>Abbrechen</button>
					</div>
				</form>
			</div>

			<Show when={!members.loading} fallback={<p class="text-muted text-sm">Lade…</p>}>
				<Show when={(members() as any[])?.length > 0} fallback={<p class="text-muted text-sm">Noch keine Boardmitglieder.</p>}>
					<div class="flex flex-col gap-3">
						<For each={members() as any[]}>
							{(m) => (
								<div class="bg-surface border border-line rounded-ui-lg p-4 flex flex-wrap items-start justify-between gap-3">
									<div class="flex items-center gap-3">
										<Show
											when={m.image_path}
											fallback={<div class="size-10 rounded-full bg-surface-2 border border-line grid place-items-center text-xs text-muted">Foto</div>}
										>
											<img src={`${API_URL}${m.image_path}`} alt={m.name} class="size-10 rounded-full object-cover border border-line" />
										</Show>
										<div>
											<h3 class="font-medium">{m.name} <span class="text-muted text-sm font-normal">· {m.position}</span></h3>
											<Show when={m.description}><p class="text-sm text-muted">{m.description}</p></Show>
											<p class="text-xs text-muted mt-0.5">Reihenfolge: {m.sort_order} · {m.visible ? "sichtbar" : <span class="text-red-400">versteckt</span>}</p>
										</div>
									</div>
									<div class="flex gap-2">
										<button class={btnOutline} onClick={() => startEdit(m)}>Bearbeiten</button>
										<button class={btnDanger} onClick={() => remove(m.id)}>Löschen</button>
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

import { createResource, createMemo, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import Icon from "../ui/Icon";
import FilterChips from "../ui/FilterChips";
import { getInventory, createBorrowForGuest, createBorrowForUser } from "../../lib/api";
import { getPayload } from "../../lib/auth";
import type { InventoryItem } from "../../lib/types";

const today = () => new Date().toISOString().split("T")[0];

type BorrowForm = {
	guest_name: string;
	guest_email: string;
	quantity: number;
	start_date: string;
	end_date: string;
};

const inputClass =
	"w-full bg-surface-2 border border-line rounded-ui px-3 py-2 outline-none focus:border-accent transition-colors text-sm";
const labelClass = "flex flex-col gap-1 text-sm";
const btnPrimary =
	"inline-flex items-center justify-center gap-2 px-4 py-2 rounded-ui font-medium text-sm bg-accent text-accent-contrast hover:bg-accent-strong transition-colors cursor-pointer disabled:opacity-50";
const btnOutline =
	"inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-ui text-sm border border-line text-text hover:bg-surface-2 transition-colors cursor-pointer";

export default function InventoryBoard() {
	const [items, { refetch }] = createResource<InventoryItem[]>(getInventory);
	const [filters, setFilters] = createStore({ query: "", category: "Alle", status: "Alle" });
	const [selectedItem, setSelectedItem] = createSignal<InventoryItem | null>(null);
	const [form, setForm] = createStore<BorrowForm>({
		guest_name: "",
		guest_email: "",
		quantity: 1,
		start_date: "",
		end_date: "",
	});
	const [submitting, setSubmitting] = createSignal(false);
	const [successMsg, setSuccessMsg] = createSignal<string | null>(null);
	const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

	const user = () => getPayload();

	const categories = createMemo(() => {
		const cats = new Set((items() ?? []).map((i) => i.category));
		return [...cats].sort();
	});

	const stats = createMemo(() => {
		const list = items() ?? [];
		return {
			total: list.length,
			available: list.filter((i) => i.quantity_available > 0).length,
			borrowed: list.filter((i) => i.quantity_available < i.quantity).length,
			categories: new Set(list.map((i) => i.category)).size,
		};
	});

	const filtered = createMemo(() => {
		const q = filters.query.trim().toLowerCase();
		return (items() ?? []).filter((item) => {
			const matchesQuery =
				!q ||
				item.name.toLowerCase().includes(q) ||
				(item.description ?? "").toLowerCase().includes(q);
			const matchesCategory =
				filters.category === "Alle" || item.category === filters.category;
			const matchesStatus =
				filters.status === "Alle" ||
				(filters.status === "Verfügbar" && item.quantity_available > 0) ||
				(filters.status === "Ausgeliehen" && item.quantity_available === 0);
			return matchesQuery && matchesCategory && matchesStatus;
		});
	});

	const openModal = (item: InventoryItem) => {
		setSelectedItem(item);
		setForm({ guest_name: "", guest_email: "", quantity: 1, start_date: today(), end_date: "" });
		setSuccessMsg(null);
		setErrorMsg(null);
	};

	const closeModal = () => {
		setSelectedItem(null);
		setSuccessMsg(null);
		setErrorMsg(null);
	};

	const submitBorrow = async (e: Event) => {
		e.preventDefault();
		const item = selectedItem();
		if (!item) return;
		setSubmitting(true);
		setErrorMsg(null);
		try {
			const payload = user();
			if (payload) {
				await createBorrowForUser({
					item_id: item.id,
					user_id: payload.id,
					quantity: form.quantity,
					start_date: form.start_date,
					end_date: form.end_date,
				});
			} else {
				await createBorrowForGuest({
					item_id: item.id,
					guest_name: form.guest_name.trim(),
					guest_email: form.guest_email.trim(),
					quantity: form.quantity,
					start_date: form.start_date,
					end_date: form.end_date,
				});
			}
			setSuccessMsg("Deine Anfrage wurde eingereicht! Wir melden uns per E-Mail.");
			refetch();
		} catch (err) {
			setErrorMsg((err as Error).message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div class="flex flex-col gap-8">
			{/* Stats */}
			<Show when={items()}>
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[
						{ value: stats().total, label: "Gegenstände" },
						{ value: stats().available, label: "verfügbar" },
						{ value: stats().borrowed, label: "ausgeliehen" },
						{ value: stats().categories, label: "Kategorien" },
					].map(({ value, label }) => (
						<div class="bg-surface border border-line rounded-ui p-4 sm:p-6 text-center">
							<div class="font-display text-2xl sm:text-4xl font-bold text-accent">{value}</div>
							<div class="text-xs sm:text-sm text-muted mt-1">{label}</div>
						</div>
					))}
				</div>
			</Show>

			{/* Filter */}
			<div class="flex flex-col gap-5">
				<div class="flex flex-col lg:flex-row lg:items-center gap-3">
					<div class="relative lg:w-64">
						<span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
							<Icon name="search" size={18} />
						</span>
						<input
							type="search"
							value={filters.query}
							onInput={(e) => setFilters("query", e.currentTarget.value)}
							placeholder="Suchen…"
							class="w-full bg-surface border border-line rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
						/>
					</div>
					<div class="flex-1">
						<FilterChips
							options={["Alle", ...categories()]}
							value={filters.category}
							onChange={(v) => setFilters("category", v)}
						/>
					</div>
				</div>
				<FilterChips
					options={["Alle", "Verfügbar", "Ausgeliehen"]}
					value={filters.status}
					onChange={(v) => setFilters("status", v)}
				/>
			</div>

			{/* Item-Grid */}
			<Show
				when={!items.loading}
				fallback={<p class="text-muted text-center py-10">Lade Inventar…</p>}
			>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<For each={filtered()}>
						{(item) => {
							const available = item.quantity_available > 0;
							return (
								<article class="bg-surface border border-line rounded-ui-lg p-5 flex flex-col gap-3">
									<div class="flex items-start justify-between gap-2">
										<h3 class="font-semibold leading-tight">{item.name}</h3>
										<span class="shrink-0 bg-surface-2 border border-line text-muted px-2.5 py-0.5 rounded-full text-xs font-mono">
											{item.category}
										</span>
									</div>
									<Show when={item.description}>
										<p class="text-sm text-muted leading-relaxed flex-1">{item.description}</p>
									</Show>
									<div class="pt-3 border-t border-line flex items-center justify-between gap-2">
										<span
											class="inline-flex items-center gap-2 text-sm font-medium"
											classList={{ "text-accent": available, "text-muted": !available }}
										>
											<span
												class="size-2 rounded-full"
												classList={{ "bg-accent": available, "bg-muted": !available }}
											/>
											{available
												? item.quantity_available === item.quantity
													? "Verfügbar"
													: `${item.quantity_available} / ${item.quantity} verfügbar`
												: "Ausgeliehen"}
										</span>
										<Show when={item.is_for_borrow && available}>
											<button
												type="button"
												onClick={() => openModal(item)}
												class="text-sm font-medium px-3 py-1.5 rounded-ui border border-accent text-accent hover:bg-accent-soft transition-colors cursor-pointer"
											>
												Ausleihen
											</button>
										</Show>
									</div>
								</article>
							);
						}}
					</For>
				</div>
				<Show when={filtered().length === 0}>
					<p class="text-muted text-center py-10">Keine Gegenstände gefunden.</p>
				</Show>
			</Show>

			{/* Ausleih-Modal */}
			<Show when={selectedItem()}>
				<div
					class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
					onClick={(e) => e.target === e.currentTarget && closeModal()}
				>
					<div class="bg-surface border border-line rounded-ui-lg w-full max-w-md p-6 flex flex-col gap-5">
						<div class="flex items-start justify-between gap-2">
							<div>
								<h2 class="font-display text-xl font-bold">{selectedItem()!.name} ausleihen</h2>
								<p class="text-sm text-muted mt-0.5">{selectedItem()!.category}</p>
							</div>
							<button
								type="button"
								onClick={closeModal}
								class="text-muted hover:text-text transition-colors cursor-pointer text-lg leading-none mt-0.5"
							>
								✕
							</button>
						</div>

						<Show when={successMsg()}>
							<div class="bg-accent-soft text-accent text-sm rounded-ui px-4 py-3">
								{successMsg()}
							</div>
							<button type="button" onClick={closeModal} class={btnPrimary}>
								Schließen
							</button>
						</Show>

						<Show when={!successMsg()}>
							<form class="flex flex-col gap-4" onSubmit={submitBorrow}>
								<Show
									when={user()}
									fallback={
										<>
											<label class={labelClass}>
												<span class="font-medium">Name *</span>
												<input
													class={inputClass}
													required
													value={form.guest_name}
													onInput={(e) => setForm("guest_name", e.currentTarget.value)}
													placeholder="Vor- und Nachname"
												/>
											</label>
											<label class={labelClass}>
												<span class="font-medium">E-Mail *</span>
												<input
													class={inputClass}
													type="email"
													required
													value={form.guest_email}
													onInput={(e) => setForm("guest_email", e.currentTarget.value)}
													placeholder="deine@email.de"
												/>
											</label>
										</>
									}
								>
									<p class="text-sm text-muted">
										Angemeldet als{" "}
										<strong class="text-text">{user()!.username}</strong>
									</p>
								</Show>

								<div class="grid grid-cols-2 gap-3">
									<label class={labelClass}>
										<span class="font-medium">Von *</span>
										<input
											class={inputClass}
											type="date"
											required
											min={today()}
											value={form.start_date}
											onInput={(e) => setForm("start_date", e.currentTarget.value)}
										/>
									</label>
									<label class={labelClass}>
										<span class="font-medium">Bis *</span>
										<input
											class={inputClass}
											type="date"
											required
											min={form.start_date || today()}
											value={form.end_date}
											onInput={(e) => setForm("end_date", e.currentTarget.value)}
										/>
									</label>
								</div>

								<Show when={selectedItem()!.quantity_available > 1}>
									<label class={labelClass}>
										<span class="font-medium">Menge</span>
										<input
											class={inputClass}
											type="number"
											min="1"
											max={selectedItem()!.quantity_available}
											value={form.quantity}
											onInput={(e) => setForm("quantity", Number(e.currentTarget.value))}
										/>
									</label>
								</Show>

								<Show when={errorMsg()}>
									<p class="text-sm text-red-500 bg-red-500/10 rounded-ui px-3 py-2">
										{errorMsg()}
									</p>
								</Show>

								<div class="flex gap-2 pt-1">
									<button type="submit" class={btnPrimary} disabled={submitting()}>
										{submitting() ? "Wird gesendet…" : "Anfrage stellen"}
									</button>
									<button type="button" onClick={closeModal} class={btnOutline}>
										Abbrechen
									</button>
								</div>
							</form>
						</Show>
					</div>
				</div>
			</Show>
		</div>
	);
}

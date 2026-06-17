import { createResource, createSignal, For, Show } from "solid-js";
import { getBorrows, approveBorrow, rejectBorrow, returnBorrow, deleteBorrow } from "../../lib/api";
import type { BorrowItem, BorrowStatus } from "../../lib/types";

const STATUS_LABELS: Record<BorrowStatus, string> = {
	pending: "Ausstehend",
	borrowed: "Ausgeliehen",
	returned: "Zurückgegeben",
	overdue: "Überfällig",
	rejected: "Abgelehnt",
};

const STATUS_COLORS: Record<BorrowStatus, string> = {
	pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	borrowed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	returned: "bg-green-500/10 text-green-600 dark:text-green-400",
	overdue: "bg-red-500/10 text-red-500",
	rejected: "bg-surface-2 text-muted",
};

const btnAccent =
	"inline-flex items-center justify-center px-3 py-1.5 rounded-ui text-sm bg-accent text-accent-contrast hover:bg-accent-strong transition-colors cursor-pointer";
const btnOutline =
	"inline-flex items-center justify-center px-3 py-1.5 rounded-ui text-sm border border-line text-text hover:bg-surface-2 transition-colors cursor-pointer";
const btnDanger =
	"inline-flex items-center justify-center px-3 py-1.5 rounded-ui text-sm border border-line text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer";

type FilterKey = "all" | BorrowStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
	{ key: "all", label: "Alle" },
	{ key: "pending", label: "Ausstehend" },
	{ key: "borrowed", label: "Ausgeliehen" },
	{ key: "overdue", label: "Überfällig" },
	{ key: "returned", label: "Zurückgegeben" },
	{ key: "rejected", label: "Abgelehnt" },
];

export default function AdminBorrows(props: { onFlash: (msg: string, ok?: boolean) => void }) {
	const [borrows, { refetch }] = createResource<BorrowItem[]>(getBorrows);
	const [filter, setFilter] = createSignal<FilterKey>("all");

	const list = () => (borrows() as BorrowItem[]) ?? [];

	const filtered = () => {
		const f = filter();
		return f === "all" ? list() : list().filter((b) => b.status === f);
	};

	const count = (key: FilterKey) =>
		key === "all" ? list().length : list().filter((b) => b.status === key).length;

	const act = async (fn: () => Promise<unknown>, msg: string) => {
		try {
			await fn();
			props.onFlash(msg);
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	const borrowerLabel = (b: BorrowItem) =>
		b.user_id ? `User #${b.user_id}` : `${b.guest_name} (${b.guest_email})`;

	return (
		<div class="flex flex-col gap-6">
			{/* Filter-Tabs */}
			<div class="flex flex-wrap gap-2">
				{FILTERS.map(({ key, label }) => (
					<button
						class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
						classList={{
							"bg-accent-soft text-accent": filter() === key,
							"text-muted hover:text-text hover:bg-surface-2": filter() !== key,
						}}
						onClick={() => setFilter(key)}
					>
						{label}{" "}
						<span class="text-xs opacity-60">({count(key)})</span>
					</button>
				))}
			</div>

			<Show
				when={!borrows.loading}
				fallback={<p class="text-muted text-sm">Lade Verleiheinträge…</p>}
			>
				<Show
					when={filtered().length > 0}
					fallback={<p class="text-muted text-sm">Keine Einträge.</p>}
				>
					<div class="flex flex-col gap-3">
						<For each={filtered()}>
							{(borrow) => (
								<div class="bg-surface border border-line rounded-ui-lg p-4 flex flex-wrap items-start justify-between gap-3">
									<div class="flex flex-col gap-1 min-w-0">
										<div class="flex items-center gap-2 flex-wrap">
											<h3 class="font-medium">
												{borrow.item_name ?? `Artikel #${borrow.item_id}`}
											</h3>
											<Show when={borrow.item_category}>
												<span class="text-xs text-muted font-mono bg-surface-2 border border-line px-2 py-0.5 rounded-full">
													{borrow.item_category}
												</span>
											</Show>
											<span
												class={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[borrow.status]}`}
											>
												{STATUS_LABELS[borrow.status]}
											</span>
										</div>
										<p class="text-sm text-muted">
											{borrowerLabel(borrow)} · {borrow.quantity} Stk. ·{" "}
											{borrow.start_date}
											{borrow.end_date ? ` – ${borrow.end_date}` : ""}
										</p>
										<p class="text-xs text-muted">
											Erstellt:{" "}
											{new Date(borrow.created_at).toLocaleDateString("de-DE", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
											})}
										</p>
									</div>

									<div class="flex flex-wrap gap-2 shrink-0">
										<Show when={borrow.status === "pending"}>
											<button
												class={btnAccent}
												onClick={() => act(() => approveBorrow(borrow.id), "Anfrage genehmigt.")}
											>
												Genehmigen
											</button>
											<button
												class={btnDanger}
												onClick={() => act(() => rejectBorrow(borrow.id), "Anfrage abgelehnt.")}
											>
												Ablehnen
											</button>
										</Show>
										<Show when={borrow.status === "borrowed" || borrow.status === "overdue"}>
											<button
												class={btnOutline}
												onClick={() =>
													act(() => returnBorrow(borrow.id), "Als zurückgegeben markiert.")
												}
											>
												Zurückgegeben
											</button>
										</Show>
										<Show
											when={
												borrow.status === "returned" ||
												borrow.status === "rejected"
											}
										>
											<button
												class={btnDanger}
												onClick={() => act(() => deleteBorrow(borrow.id), "Eintrag gelöscht.")}
											>
												Löschen
											</button>
										</Show>
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

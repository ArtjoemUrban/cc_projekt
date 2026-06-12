import { createResource, createSignal, Match, Show, Switch } from "solid-js";
import { clearToken, getPayload } from "../../lib/auth";
import { getMe } from "../../lib/api";
import AdminEvents from "./AdminEvents";
import AdminInventory from "./AdminInventory";
import AdminHours from "./AdminHours";
import AdminBoard from "./AdminBoard";
import AdminUsers from "./AdminUsers";

type Tab = "events" | "inventory" | "hours" | "board" | "users";

const MEMBER_TABS: { id: Tab; label: string }[] = [
	{ id: "events", label: "Events" },
	{ id: "inventory", label: "Inventar" },
	{ id: "hours", label: "Öffnungszeiten" },
];

const ADMIN_TABS: { id: Tab; label: string }[] = [
	{ id: "board", label: "Boardmitglieder" },
	{ id: "users", label: "Benutzer" },
];

const tabClass = "px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer";
const btnOutline = "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-ui text-sm border border-line text-text hover:bg-surface-2 transition-colors cursor-pointer";

export default function AdminPanel() {
	const [activeTab, setActiveTab] = createSignal<Tab>("events");
	const [flash, setFlash] = createSignal<{ msg: string; ok: boolean } | null>(null);

	const [me] = createResource(async () => {
		if (!getPayload()) {
			window.location.href = "/login";
			return null;
		}
		const user = await getMe();
		if (user.role !== "admin" && user.role !== "member") return null;
		return user;
	});

	const showFlash = (msg: string, ok = true) => {
		setFlash({ msg, ok });
		setTimeout(() => setFlash(null), 4000);
	};

	const logout = () => {
		clearToken();
		window.location.href = "/login";
	};

	return (
		<Switch>
			<Match when={me.loading}>
				<div class="min-h-[50vh] grid place-items-center text-muted">
					<p>Lade…</p>
				</div>
			</Match>

			<Match when={me.error}>
				<div class="min-h-[50vh] grid place-items-center">
					<div class="text-center">
						<p class="mb-2">Sitzung abgelaufen. Bitte neu anmelden.</p>
						<a class="text-accent underline" href="/login">Zum Login</a>
					</div>
				</div>
			</Match>

			<Match when={me() === null && !me.loading}>
				<div class="min-h-[50vh] grid place-items-center">
					<div class="text-center">
						<p class="mb-2">Kein Zugriff – dieser Bereich ist nur für Mitglieder.</p>
						<a class="text-accent underline" href="/">Zur Startseite</a>
					</div>
				</div>
			</Match>

			<Match when={me()}>
				<div class="flex flex-col gap-8">
					<header class="flex flex-wrap items-center justify-between gap-4">
						<div>
							<p class="text-accent text-sm font-medium uppercase tracking-wide">Verwaltung</p>
							<h1 class="font-display text-3xl font-bold">Admin Panel</h1>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-sm text-muted">
								Angemeldet als <strong class="text-text">{me()!.username}</strong>
							</span>
							<button class={btnOutline} onClick={logout}>Abmelden</button>
						</div>
					</header>

					<div class="flex flex-wrap gap-2 border-b border-line pb-3" role="tablist">
						{MEMBER_TABS.map((t) => (
							<button
								class={tabClass}
								classList={{
									"bg-accent-soft text-accent": activeTab() === t.id,
									"text-muted hover:text-text hover:bg-surface-2": activeTab() !== t.id,
								}}
								onClick={() => setActiveTab(t.id)}
							>
								{t.label}
							</button>
						))}
						{me()!.role === "admin" && ADMIN_TABS.map((t) => (
							<button
								class={tabClass}
								classList={{
									"bg-accent-soft text-accent": activeTab() === t.id,
									"text-muted hover:text-text hover:bg-surface-2": activeTab() !== t.id,
								}}
								onClick={() => setActiveTab(t.id)}
							>
								{t.label}
							</button>
						))}
					</div>

					<Show when={flash()}>
						<p
							class="text-sm rounded-ui px-4 py-2"
							classList={{
								"bg-accent-soft text-accent": flash()!.ok,
								"bg-red-500/10 text-red-500": !flash()!.ok,
							}}
						>
							{flash()!.msg}
						</p>
					</Show>

					<Switch>
						<Match when={activeTab() === "events"}>
							<AdminEvents onFlash={showFlash} />
						</Match>
						<Match when={activeTab() === "inventory"}>
							<AdminInventory onFlash={showFlash} />
						</Match>
						<Match when={activeTab() === "hours"}>
							<AdminHours onFlash={showFlash} />
						</Match>
						<Match when={activeTab() === "board"}>
							<AdminBoard onFlash={showFlash} />
						</Match>
						<Match when={activeTab() === "users"}>
							<AdminUsers onFlash={showFlash} />
						</Match>
					</Switch>
				</div>
			</Match>
		</Switch>
	);
}

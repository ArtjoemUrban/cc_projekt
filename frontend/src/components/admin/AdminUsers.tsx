import { createResource, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { getUsers, registerUser, changeUserRole, deleteUser } from "../../lib/api";

const inputClass = "w-full bg-surface-2 border border-line rounded-ui px-3 py-2 outline-none focus:border-accent transition-colors text-sm";
const labelClass = "flex flex-col gap-1 text-sm";
const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-ui font-medium text-sm bg-accent text-accent-contrast hover:bg-accent-strong transition-colors cursor-pointer";
const btnDanger = "inline-flex items-center justify-center px-3 py-1 rounded-ui text-sm border border-line text-red-500 hover:bg-red-500/10 cursor-pointer";

type UserForm = {
	prename: string;
	surname: string;
	email: string;
	username: string;
	password: string;
};

const emptyForm = (): UserForm => ({ prename: "", surname: "", email: "", username: "", password: "" });

const ROLES = ["admin", "member"] as const;

export default function AdminUsers(props: { onFlash: (msg: string, ok?: boolean) => void }) {
	const [users, { refetch }] = createResource(getUsers);
	const [form, setForm] = createStore<UserForm>(emptyForm());

	const submit = async (e: Event) => {
		e.preventDefault();
		try {
			await registerUser({ ...form });
			props.onFlash("Mitglied angelegt.");
			setForm(emptyForm());
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	const changeRole = async (username: string, newRole: string) => {
		try {
			await changeUserRole(username, newRole);
			props.onFlash(`Rolle von ${username} → ${newRole}.`);
		} catch (err) {
			props.onFlash((err as Error).message, false);
			refetch();
		}
	};

	const remove = async (username: string) => {
		if (!confirm(`Mitglied "${username}" wirklich löschen?`)) return;
		try {
			await deleteUser(username);
			props.onFlash("Mitglied gelöscht.");
			refetch();
		} catch (err) {
			props.onFlash((err as Error).message, false);
		}
	};

	return (
		<div class="flex flex-col gap-6">
			<div class="bg-surface border border-line rounded-ui-lg p-5">
				<h2 class="font-display text-xl font-bold mb-4">Neues Mitglied anlegen</h2>
				<form class="grid sm:grid-cols-2 gap-4" onSubmit={submit}>
					<label class={labelClass}>
						<span class="font-medium">Vorname</span>
						<input class={inputClass} value={form.prename} onInput={(e) => setForm("prename", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Nachname</span>
						<input class={inputClass} value={form.surname} onInput={(e) => setForm("surname", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">E-Mail</span>
						<input class={inputClass} type="email" value={form.email} onInput={(e) => setForm("email", e.currentTarget.value)} required />
					</label>
					<label class={labelClass}>
						<span class="font-medium">Benutzername</span>
						<input class={inputClass} value={form.username} onInput={(e) => setForm("username", e.currentTarget.value)} required />
					</label>
					<label class={`${labelClass} sm:col-span-2`}>
						<span class="font-medium">Passwort</span>
						<input class={inputClass} type="password" value={form.password} onInput={(e) => setForm("password", e.currentTarget.value)} required />
					</label>
					<div class="sm:col-span-2">
						<button type="submit" class={btnPrimary}>Anlegen</button>
					</div>
				</form>
			</div>

			<div class="bg-surface border border-line rounded-ui-lg p-5 overflow-x-auto">
				<Show when={!users.loading} fallback={<p class="text-muted text-sm">Lade…</p>}>
					<Show when={(users() as any[])?.length > 0} fallback={<p class="text-muted text-sm">Keine Mitglieder.</p>}>
						<table class="w-full text-sm">
							<thead>
								<tr class="text-left text-muted border-b border-line">
									<th class="py-2 pr-3">Name</th>
									<th class="py-2 pr-3">Benutzername</th>
									<th class="py-2 pr-3">E-Mail</th>
									<th class="py-2 pr-3">Rolle</th>
									<th class="py-2" />
								</tr>
							</thead>
							<tbody>
								<For each={users() as any[]}>
									{(u) => (
										<tr class="border-b border-line/60">
											<td class="py-2 pr-3">{u.prename} {u.surname}</td>
											<td class="py-2 pr-3">{u.username}</td>
											<td class="py-2 pr-3 text-muted">{u.email}</td>
											<td class="py-2 pr-3">
												<select
													class="bg-surface-2 border border-line rounded-ui px-2 py-1 text-sm"
													onChange={(e) => changeRole(u.username, e.currentTarget.value)}
												>
													<For each={ROLES}>
														{(r) => <option value={r} selected={u.role === r}>{r}</option>}
													</For>
												</select>
											</td>
											<td class="py-2 text-right">
												<button class={btnDanger} onClick={() => remove(u.username)}>Löschen</button>
											</td>
										</tr>
									)}
								</For>
							</tbody>
						</table>
					</Show>
				</Show>
			</div>
		</div>
	);
}

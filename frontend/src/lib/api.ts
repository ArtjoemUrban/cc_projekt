// Generiert mit Claude Opus 4.8
import { getToken } from "./auth";

const API_URL = "http://localhost:3000";

/** Fehler einer API-Antwort mit nutzbarer Message (Backend liefert `{ message }`). */
export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

interface RequestOptions {
	method?: string;
	body?: unknown;
	/** true -> Authorization-Header mit gespeichertem JWT mitsenden. */
	auth?: boolean;
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
	const { method = "GET", body, auth = false } = options;
	const headers: Record<string, string> = {};
	if (body !== undefined) headers["Content-Type"] = "application/json";
	if (auth) {
		const token = getToken();
		if (token) headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetch(`${API_URL}${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	let data: any = null;
	const text = await res.text();
	if (text) {
		try {
			data = JSON.parse(text);
		} catch {
			data = text;
		}
	}

	if (!res.ok) {
		const message = (data && data.message) || (typeof data === "string" && data) || `Fehler ${res.status}`;
		throw new ApiError(res.status, message);
	}
	return data as T;
}

/* ----------------------------- Öffentlich ----------------------------- */

export async function getEvents() {
	return request("/events");
}

export async function getInventory() {
	return request("/inventory");
}

export async function getInventoryItem(id: string) {
	return request(`/inventory/${id}`);
}

export async function getOpeningHours() {
	return request("/opening-hours");
}

/* -------------------------------- Auth -------------------------------- */

export async function loginWithUsername(username: string, password: string) {
	return request<{ message: string; token: string }>("/auth/login/username", {
		method: "POST",
		body: { username, password },
	});
}

/* --------------------------- Nutzer (Admin) --------------------------- */

export async function getMe() {
	return request("/user/me", { auth: true });
}

export async function getUsers() {
	return request("/user", { auth: true });
}

export async function registerUser(payload: {
	prename: string;
	surname: string;
	email: string;
	username: string;
	password: string;
}) {
	return request("/auth/register", { method: "POST", body: payload });
}

export async function changeUserRole(username: string, newRole: string) {
	return request("/user/change-role", { method: "PUT", body: { username, newRole }, auth: true });
}

export async function deleteUser(username: string) {
	return request(`/user/username/${encodeURIComponent(username)}`, { method: "DELETE", auth: true });
}

/* --------------------------- Events (Admin) --------------------------- */

export async function createEvent(payload: Record<string, unknown>) {
	return request("/events", { method: "POST", body: payload, auth: true });
}

export async function updateEvent(id: number, payload: Record<string, unknown>) {
	return request(`/events/${id}`, { method: "PUT", body: payload, auth: true });
}

export async function deleteEvent(id: number) {
	return request(`/events/${id}`, { method: "DELETE", auth: true });
}

/* -------------------------- Inventar (Admin) -------------------------- */

export async function createInventoryItem(payload: Record<string, unknown>) {
	return request("/inventory", { method: "POST", body: payload, auth: true });
}

export async function updateInventoryItem(id: number, payload: Record<string, unknown>) {
	return request(`/inventory/${id}`, { method: "PATCH", body: payload, auth: true });
}

export async function deleteInventoryItem(id: number) {
	return request(`/inventory/${id}`, { method: "DELETE", auth: true });
}

/* ---------------------- Boardmitglieder (Public) ---------------------- */

export async function getBoardMembers() {
	return request("/board-members");
}

/* --------------------- Boardmitglieder (Admin) ----------------------- */

export async function getAllBoardMembers() {
	return request("/board-members/all", { auth: true });
}

export async function createBoardMember(payload: Record<string, unknown>) {
	return request("/board-members", { method: "POST", body: payload, auth: true });
}

export async function updateBoardMember(id: number, payload: Record<string, unknown>) {
	return request(`/board-members/${id}`, { method: "PUT", body: payload, auth: true });
}

export async function deleteBoardMember(id: number) {
	return request(`/board-members/${id}`, { method: "DELETE", auth: true });
}

/* ----------------------- Öffnungszeiten (Admin) ----------------------- */

export async function updateOpeningHours(weekday: number, open_time: string, close_time: string) {
	if (open_time === close_time) {
		return request(`/opening-hours/${weekday}`, {
			method: "PUT",
			body: { open_time: null, close_time: null },
			auth: true,
		});
	}
	return request(`/opening-hours/${weekday}`, {
		method: "PUT",
		body: { open_time, close_time },
		auth: true,
	});
}

// Generiert mit Claude Opus 4.8
/**
 * Client-seitige Auth-Helfer. Das JWT vom Backend (/auth/login/...) wird im
 * localStorage gehalten; Astro rendert statisch, daher läuft die Anmeldung
 * komplett im Browser. Nur im Browser aufrufen (z. B. in <script>-Blöcken).
 */

const TOKEN_KEY = "fse_token";

export interface JwtPayload {
	id: number;
	username: string;
	role: "admin" | "member";
	iat?: number;
	exp?: number;
}

export function getToken(): string | null {
	if (typeof localStorage === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
	localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
	localStorage.removeItem(TOKEN_KEY);
}

/** Liest die Claims aus dem JWT (ohne Signaturprüfung – die macht das Backend). */
export function getPayload(): JwtPayload | null {
	const token = getToken();
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
		if (payload.exp && payload.exp * 1000 < Date.now()) {
			clearToken();
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}

export function isLoggedIn(): boolean {
	return getPayload() !== null;
}

export function isAdmin(): boolean {
	return getPayload()?.role === "admin";
}

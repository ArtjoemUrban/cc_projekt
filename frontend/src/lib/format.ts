// Generiert mit Claude Opus 4.8
/** Hilfsfunktionen für die Anzeige. */

/** ISO-Datum -> { day: "05", month: "JUN" } für die Datumskachel. */
export function dateParts(iso: string) {
	const d = new Date(iso);
	const day = String(d.getDate()).padStart(2, "0");
	const month = d.toLocaleDateString("de-DE", { month: "short" }).replace(".", "").toUpperCase();
	return { day, month };
}

/** ISO-Datum -> "Freitag, 05.06.2026". */
export function longDate(iso: string) {
	return new Date(iso).toLocaleDateString("de-DE", {
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

/** ISO-Datetime -> "19:00". */
export function shortTime(iso: string) {
	return new Date(iso).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

/** ISO-Datetime -> "Fr., 20.06." (Kurzform für mehrtägige Zeiträume). */
export function shortDate(iso: string) {
	return new Date(iso).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}

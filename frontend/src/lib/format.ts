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

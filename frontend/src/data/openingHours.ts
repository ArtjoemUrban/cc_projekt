import type { OpeningDay } from "../lib/types";

/** Öffnungszeiten Mo–Fr. `null` = geschlossen. Reihenfolge entspricht Mo..Fr. */
export const openingHours: OpeningDay[] = [
	{ name: "Montag", hours: "12:00 – 14:00 Uhr" },
	{ name: "Dienstag", hours: "11:00 – 13:00 Uhr" },
	{ name: "Mittwoch", hours: "13:00 – 16:00 Uhr" },
	{ name: "Donnerstag", hours: "12:00 – 14:00 Uhr" },
	{ name: "Freitag", hours: null },
];

export const room = {
	label: "FS-Raum (Raca)",
	building: "Gebäude H · EG",
	detail: "Raum H004, neben der Cafeteria",
};

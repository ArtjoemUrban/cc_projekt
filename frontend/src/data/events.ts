import type { EventCategory, EventItem } from "../lib/types";

/** Filter-Reihenfolge für die Event-Seite ("Alle" wird im Board ergänzt). */
export const eventCategories: EventCategory[] = ["Social", "Vortrag", "Workshop", "Gaming", "Sonstiges"];

/** Platzhalter-Daten – später durch Backend-Aufruf ersetzbar. */
export const events: EventItem[] = [
	{
		id: "kicker",
		title: "Kicker-Turnier",
		category: "Social",
		description: "Zweierteams treten im K.-o.-System gegeneinander an. Anmeldung als Team oder einzeln.",
		date: "2026-06-05",
		time: "19:00 Uhr",
		location: "FS-Raum (Raca)",
		capacity: 16,
		taken: 11,
	},
	{
		id: "embedded",
		title: "Vortrag: Embedded Systems in der Praxis",
		category: "Vortrag",
		description: "Ein Gast aus der Industrie zeigt, wie Embedded-Entwicklung im Alltag wirklich aussieht.",
		date: "2026-06-12",
		time: "16:00 Uhr",
		location: "Hörsaal H101",
		capacity: 80,
		taken: 42,
	},
	{
		id: "git-workshop",
		title: "Git & GitHub Workshop",
		category: "Workshop",
		description: "Von Commit bis Pull Request – ein Hands-on-Workshop für Einsteiger:innen.",
		date: "2026-06-18",
		time: "14:00 Uhr",
		location: "PC-Pool H004",
		capacity: 24,
		taken: 24,
	},
	{
		id: "lan",
		title: "LAN-Party",
		category: "Gaming",
		description: "Bring deinen Rechner mit und zock mit der Fachschaft bis in die Nacht.",
		date: "2026-06-21",
		time: "18:00 Uhr",
		location: "Mensa-Foyer",
		capacity: 40,
		taken: 15,
	},
	{
		id: "ersti",
		title: "Ersti-Frühstück",
		category: "Sonstiges",
		description: "Gemütliches Kennenlernen bei Kaffee, Brötchen und allen Fragen rund ums Studium.",
		date: "2026-06-28",
		time: "10:00 Uhr",
		location: "FS-Raum (Raca)",
		capacity: 30,
		taken: 8,
	},
];

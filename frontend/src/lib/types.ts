// Generiert mit Claude Opus 4.8
/** Gemeinsame Typen – werden von den Mock-Daten und später vom Backend genutzt. */

export interface Member {
	role: string; // Funktion in der Fachschaft, z. B. "Vorsitz"
	title: string; // Amtsbezeichnung, z. B. "1. Vorsitzende:r"
	program: string; // Studiengang
	email: string;
}

export type EventCategory = "Social" | "Vortrag" | "Workshop" | "Gaming" | "Sonstiges";

export interface EventItem {
	id: string;
	title: string;
	category: EventCategory;
	description: string;
	date: string; // ISO-Datum, z. B. "2026-06-05"
	time: string; // z. B. "19:00 Uhr"
	location: string;
	capacity: number;
	taken: number;
}

export type InventoryStatus = "available" | "borrowed";

export interface InventoryItem {
	id: string;
	name: string;
	category: string;
	description: string;
	status: InventoryStatus;
}

export interface OpeningDay {
	name: string; // Wochentag
	hours: string | null; // null = geschlossen
}

export interface BoardMember {
	id: number;
	user_id: number | null;
	name: string;
	position: string;
	description: string | null;
	image_path: string | null;
	sort_order: number;
	visible: number;
}

// Generiert mit Claude Opus 4.8
/** Gemeinsame Typen – werden von den Mock-Daten und später vom Backend genutzt. */

export interface Member {
	role: string; // Funktion in der Fachschaft, z. B. "Vorsitz"
	title: string; // Amtsbezeichnung, z. B. "1. Vorsitzende:r"
	program: string; // Studiengang
	email: string;
}

export interface EventItem {
	id: number;
	title: string;
	description: string | null;
	start_time: string;
	end_time: string;
	location: string | null;
	host_name: string | null;
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

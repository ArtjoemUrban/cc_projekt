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

export interface InventoryItem {
	id: number;
	name: string;
	category: string;
	description: string | null;
	quantity: number;
	quantity_available: number;
	picture_url: string | null;
	is_for_borrow: number;
}

export type BorrowStatus = "pending" | "borrowed" | "returned" | "overdue" | "rejected";

export interface BorrowItem {
	id: number;
	item_id: number;
	item_name?: string;
	item_category?: string;
	user_id: number | null;
	guest_name: string | null;
	guest_email: string | null;
	quantity: number;
	start_date: string;
	end_date: string | null;
	status: BorrowStatus;
	comment: string | null;
	created_at: string;
	updated_at: string;
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

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

const API_URL = "http://localhost:3000";

export async function getBoardMembers(): Promise<BoardMember[]> {
	const response = await fetch(`${API_URL}/board-members`);
	if (!response.ok) {
		throw new Error("Fehler beim Laden der Boardmitglieder");
	}
	return response.json();
}

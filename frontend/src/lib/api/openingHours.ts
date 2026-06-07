export interface OpeningHour {
	id: number;
	weekday: number;
	open_time: string | null;
	close_time: string | null;
}

const API_URL = "http://localhost:3000";

// Wochentag-Namen (Index 0=Mo, ..., 6=So nach Backend-Format 1=Mo...0=So)
const WEEKDAY_NAMES: Record<number, string> = {
	1: "Montag",
	2: "Dienstag",
	3: "Mittwoch",
	4: "Donnerstag",
	5: "Freitag",
	6: "Samstag",
	0: "Sonntag",
};

export async function getOpeningHours(): Promise<(OpeningHour & { name: string; hours: string | null })[]> {
	const response = await fetch(`${API_URL}/opening-hours`);

	if (!response.ok) {
		throw new Error("Failed to fetch opening hours");
	}

	const data: OpeningHour[] = await response.json();
	
	// Sortiere nach Wochentag (Mo-So: 1,2,3,4,5,6,0) und formatiere
	return data
		.sort((a, b) => {
			const order = [1, 2, 3, 4, 5, 6, 0]; // Mo-So
			return order.indexOf(a.weekday) - order.indexOf(b.weekday);
		})
		.map((day) => ({
			...day,
			name: WEEKDAY_NAMES[day.weekday],
			hours: day.open_time && day.close_time ? `${day.open_time} - ${day.close_time}` : null,
		}));
}

export async function updateOpeningHours(
	day_of_week: number,
	open_time: string | null,
	close_time: string | null,
	token: string
): Promise<void> {
	const response = await fetch(`${API_URL}/opening-hours/${day_of_week}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ open_time, close_time }),
	});

	if (!response.ok) {
		throw new Error("Failed to update opening hours");
	}
}
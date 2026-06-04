import type { Member } from "../lib/types";

/** Platzhalter-Daten – später durch Backend-Aufruf ersetzbar. */
export const members: Member[] = [
	{ role: "Vorsitz", title: "1. Vorsitzende:r", program: "Informatik B.Sc.", email: "vorsitz@fs-ei.rwu.de" },
	{ role: "Stellv. Vorsitz", title: "2. Vorsitzende:r", program: "Elektrotechnik B.Eng.", email: "stellv@fs-ei.rwu.de" },
	{ role: "Finanzen", title: "Kassenwart:in", program: "Wirtschaftsinformatik B.Sc.", email: "finanzen@fs-ei.rwu.de" },
	{ role: "Events", title: "Event-Beauftragte:r", program: "Informatik B.Sc.", email: "events@fs-ei.rwu.de" },
	{ role: "Inventar", title: "Verleih-Beauftragte:r", program: "Mechatronik B.Eng.", email: "verleih@fs-ei.rwu.de" },
	{ role: "Hochschulpolitik", title: "Senatsvertreter:in", program: "Elektrotechnik B.Eng.", email: "hopo@fs-ei.rwu.de" },
];

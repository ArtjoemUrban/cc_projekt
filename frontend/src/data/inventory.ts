import type { InventoryItem } from "../lib/types";

/** Filter-Reihenfolge für die Inventar-Seite ("Alle" wird im Board ergänzt). */
export const inventoryCategories = ["Technik", "Gaming", "Audio", "Werkzeug", "Spiele", "Outdoor"] as const;

/** Platzhalter-Daten – später durch Backend-Aufruf ersetzbar. */
export const inventory: InventoryItem[] = [
	{ id: "beamer", name: "Beamer (Full HD)", category: "Technik", description: "Lichtstarker Beamer inkl. HDMI-Kabel und Fernbedienung.", status: "available" },
	{ id: "switch", name: "Nintendo Switch", category: "Gaming", description: "Konsole mit zwei Joy-Cons und drei Spielen.", status: "borrowed" },
	{ id: "boxen", name: "JBL Bluetooth-Box", category: "Audio", description: "Mobile Box mit fettem Sound für Partys und Events.", status: "available" },
	{ id: "akkuschrauber", name: "Akkuschrauber", category: "Werkzeug", description: "Bosch Akkuschrauber mit Bit-Set und Ersatzakku.", status: "available" },
	{ id: "catan", name: "Die Siedler von Catan", category: "Spiele", description: "Brettspiel-Klassiker inkl. Erweiterung.", status: "available" },
	{ id: "pavillon", name: "Pavillon 3x3m", category: "Outdoor", description: "Wetterfester Pavillon für Außenveranstaltungen.", status: "borrowed" },
	{ id: "mikrofon", name: "Funkmikrofon-Set", category: "Audio", description: "Zwei Funkmikrofone mit Empfänger für Vorträge.", status: "available" },
	{ id: "kamera", name: "DSLR-Kamera", category: "Technik", description: "Spiegelreflexkamera mit Standardobjektiv und Tasche.", status: "available" },
	{ id: "controller", name: "Xbox Controller (4x)", category: "Gaming", description: "Vier kabellose Controller für Multiplayer-Sessions.", status: "borrowed" },
	{ id: "werkzeugkoffer", name: "Werkzeugkoffer", category: "Werkzeug", description: "Gut sortierter Koffer für kleine Reparaturen.", status: "available" },
];

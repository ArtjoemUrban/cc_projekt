// erstellt mit Claude
// Befüllt die Datenbank mit typischen Testdaten
// Aufruf: npm run seed:test-data 

import bcrypt from "bcrypt";
import db from "./db.js";

const DEFAULT_PASSWORD = "test1234";
const SENTINEL_EMAIL = "max.mustermann@rwu.de";

function alreadySeeded() {
  return !!db.prepare("SELECT id FROM users WHERE email = ?").get(SENTINEL_EMAIL);
}

function seedOpeningHours() {
  // weekday: 0 = Sonntag ... 6 = Samstag
  const hours = [
    { weekday: 0, open: "00:00", close: "00:00" }, // Sonntag: geschlossen
    { weekday: 1, open: "10:00", close: "16:00" }, // Montag
    { weekday: 2, open: "10:00", close: "16:00" }, // Dienstag
    { weekday: 3, open: "10:00", close: "16:00" }, // Mittwoch
    { weekday: 4, open: "10:00", close: "16:00" }, // Donnerstag
    { weekday: 5, open: "10:00", close: "13:00" }, // Freitag: früher zu
    { weekday: 6, open: "00:00", close: "00:00" }, // Samstag: geschlossen
  ];
  const stmt = db.prepare(
    "UPDATE opening_hours SET open_time = ?, close_time = ? WHERE weekday = ?"
  );
  for (const h of hours) stmt.run(h.open, h.close, h.weekday);
}

function seedUsers() {
  // OR IGNORE: falls Username/E-Mail (z.B. "admin") schon existiert, wird die
  // bestehende Zeile behalten statt das ganze Seeding abzubrechen.
  const insert = db.prepare(`
    INSERT OR IGNORE INTO users (prename, surname, email, username, password, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const findId = db.prepare("SELECT id FROM users WHERE username = ?");

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const people = [
    // Admin- und Standard-Account zum Testen
    { prename: "Admin", surname: "Admin", email: "admin@rwu.de", username: "admin", password: "admin1234", role: "admin" },
    { prename: "Test", surname: "User", email: "test.user@rwu.de", username: "testuser", password: DEFAULT_PASSWORD, role: "member" },
    // Platzhalter-Mitglieder
    { prename: "Max", surname: "Mustermann", email: "max.mustermann@rwu.de", username: "max.mustermann", password: DEFAULT_PASSWORD, role: "member" },
    { prename: "Lisa", surname: "Schmidt", email: "lisa.schmidt@rwu.de", username: "lisa.schmidt", password: DEFAULT_PASSWORD, role: "member" },
    { prename: "Jonas", surname: "Becker", email: "jonas.becker@rwu.de", username: "jonas.becker", password: DEFAULT_PASSWORD, role: "member" },
    { prename: "Sarah", surname: "Wagner", email: "sarah.wagner@rwu.de", username: "sarah.wagner", password: DEFAULT_PASSWORD, role: "member" },
    { prename: "Tim", surname: "Hoffmann", email: "tim.hoffmann@rwu.de", username: "tim.hoffmann", password: DEFAULT_PASSWORD, role: "member" },
  ];

  const ids = {};
  for (const p of people) {
    insert.run(p.prename, p.surname, p.email, p.username, hash(p.password), p.role);
    const row = findId.get(p.username);
    if (row) ids[p.username] = row.id;
  }
  return ids;
}

function seedInventory() {
  const insert = db.prepare(`
    INSERT INTO inventory (name, quantity, quantity_available, description, category, is_for_borrow)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const items = [
    // Elektronik
    { name: "Arduino Uno R3 Set", quantity: 10, description: "Arduino Uno inkl. USB-Kabel", category: "Elektronik", is_for_borrow: 1 },
    { name: "Raspberry Pi 4 Model B (4GB)", quantity: 6, description: "Inkl. Netzteil und SD-Karte", category: "Elektronik", is_for_borrow: 1 },
    { name: "Steckbrett (Breadboard)", quantity: 15, description: "830 Kontaktpunkte", category: "Elektronik", is_for_borrow: 1 },
    { name: "Jumper-Kabel Set", quantity: 20, description: "Male-Male, Male-Female, Female-Female", category: "Elektronik", is_for_borrow: 1 },
    // Messtechnik
    { name: "Digital-Multimeter", quantity: 8, description: "Für Spannung, Strom und Widerstand", category: "Messtechnik", is_for_borrow: 1 },
    { name: "Oszilloskop Rigol DS1054Z", quantity: 2, description: "Nur für Laborbetrieb, kein Verleih nach außen", category: "Messtechnik", is_for_borrow: 0 },
    { name: "Labornetzteil 30V/5A", quantity: 4, description: "Einstellbares Labornetzteil", category: "Messtechnik", is_for_borrow: 0 },
    // Werkzeug
    { name: "Lötkolben-Set (Weller)", quantity: 6, description: "Inkl. Lötspitzen und Ständer", category: "Werkzeug", is_for_borrow: 1 },
    { name: "Entlötpumpe", quantity: 4, description: "Zum Entfernen von Lötzinn", category: "Werkzeug", is_for_borrow: 1 },
    { name: "Seitenschneider", quantity: 10, description: "Für Kabel und Bauteile", category: "Werkzeug", is_for_borrow: 1 },
    // IT & Veranstaltungstechnik
    { name: "Laptop (Dell Latitude)", quantity: 3, description: "Für Präsentationen und Workshops", category: "IT", is_for_borrow: 1 },
    { name: "Beamer Epson EB-X41", quantity: 2, description: "HDMI und VGA Anschluss", category: "IT", is_for_borrow: 1 },
    { name: "HDMI-Kabel 10m", quantity: 5, description: "Für Beamer-Anschluss", category: "IT", is_for_borrow: 1 },
    { name: "Kabeltrommel", quantity: 6, description: "25m, 3-fach Steckdose", category: "IT", is_for_borrow: 1 },
    // Event
    { name: "Bluetooth-Lautsprecher", quantity: 2, description: "Für Feiern und Veranstaltungen", category: "Event", is_for_borrow: 1 },
    { name: "Pavillon/Faltzelt 3x3m", quantity: 2, description: "Für Außenveranstaltungen", category: "Event", is_for_borrow: 1 },
    { name: "Getränkebollerwagen", quantity: 1, description: "Für Sommerfest und Grillabende", category: "Event", is_for_borrow: 1 },
  ];

  for (const i of items) {
    insert.run(i.name, i.quantity, i.quantity, i.description, i.category, i.is_for_borrow);
  }
}

function seedEvents(userIds) {
  const insert = db.prepare(`
    INSERT INTO events (title, description, start_time, end_time, location, host_id, host_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const events = [
    {
      title: "Lötworkshop für Einsteiger",
      description: "Grundlagen des Lötens – gemeinsam bauen wir eine kleine LED-Schaltung.",
      start_time: "2026-07-10 17:00",
      end_time: "2026-07-10 19:00",
      location: "Fachschaftsraum E014",
      host: "max.mustermann",
    },
    {
      title: "Retro-Gaming & Löt-Abend",
      description: "Alte Konsolen reparieren, zocken und quatschen.",
      start_time: "2026-07-25 18:00",
      end_time: "2026-07-25 23:00",
      location: "Fachschaftsraum E014",
      host: "tim.hoffmann",
    },
    {
      title: "Sommerfest der Fachschaft E+I",
      description: "Grillen, Musik und Spiele zum Semesterausklang.",
      start_time: "2026-07-18 15:00",
      end_time: "2026-07-18 22:00",
      location: "Innenhof Campus",
      host: "sarah.wagner",
    },
    {
      title: "Hackathon: 24h Code & Circuits",
      description: "Ein Tag und eine Nacht voller Software- und Hardware-Projekte in Teams.",
      start_time: "2026-08-01 09:00",
      end_time: "2026-08-02 09:00",
      location: "Rechnerpool E1.12",
      host: "jonas.becker",
    },
    {
      title: "Exkursion zu Bosch Sensortec",
      description: "Werksbesichtigung und Vortrag über Sensorentwicklung.",
      start_time: "2026-09-05 08:00",
      end_time: "2026-09-05 16:00",
      location: "Bosch Sensortec, Reutlingen",
      host: "lisa.schmidt",
    },
    {
      title: "Erstsemester-Begrüßung E+I",
      description: "Kennenlernen, Campusführung und Infos rund ums Studium.",
      start_time: "2026-10-06 10:00",
      end_time: "2026-10-06 13:00",
      location: "Hörsaal H1",
      host: "max.mustermann",
    },
  ];

  for (const e of events) {
    const hostId = userIds[e.host] ?? null;
    const hostName = hostId ? null : e.host;
    insert.run(e.title, e.description, e.start_time, e.end_time, e.location, hostId, hostName);
  }
}

function seedBoardMembers(userIds) {
  if (db.prepare("SELECT 1 FROM board_members WHERE name = ?").get("Max Mustermann")) {
    console.log("ℹ️  Mitgliederboard-Testdaten bereits vorhanden – überspringe.");
    return;
  }

  const insert = db.prepare(`
    INSERT INTO board_members (user_id, name, position, description, sort_order, visible)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  const members = [
    { username: "max.mustermann", name: "Max Mustermann", position: "1. Vorsitz", description: "Leitet die Fachschaftssitzungen und vertritt die Fachschaft nach außen.", sort_order: 10 },
    { username: "lisa.schmidt", name: "Lisa Schmidt", position: "2. Vorsitz", description: "Stellvertretende Vorsitzende, kümmert sich um Organisation und Termine.", sort_order: 11 },
    { username: "jonas.becker", name: "Jonas Becker", position: "Kassenwart", description: "Verwaltet die Finanzen der Fachschaft.", sort_order: 12 },
    { username: "sarah.wagner", name: "Sarah Wagner", position: "Öffentlichkeitsarbeit", description: "Verantwortlich für Social Media und Ankündigungen.", sort_order: 13 },
    { username: "tim.hoffmann", name: "Tim Hoffmann", position: "Beisitz", description: "Unterstützt bei Events und im Tagesgeschäft.", sort_order: 14 },
  ];

  for (const m of members) {
    insert.run(userIds[m.username] ?? null, m.name, m.position, m.description, m.sort_order);
  }
}

function seedTestData() {
  const run = db.transaction(() => {
    if (alreadySeeded()) {
      console.log("ℹ️  Testdaten (Nutzer/Inventar/Events) bereits eingespielt – überspringe.");
    } else {
      seedOpeningHours();
      const userIds = seedUsers();
      seedInventory();
      seedEvents(userIds);
      seedBoardMembers(userIds);
      return;
    }

    // Auch wenn der Rest schon existiert: Mitgliederboard separat prüfen/ergänzen.
    const userIds = Object.fromEntries(
      db.prepare("SELECT username, id FROM users").all().map((u) => [u.username, u.id])
    );
    seedBoardMembers(userIds);
  });
  run();

  console.log("✅ Testdaten-Seed abgeschlossen.");
  console.log(`   Admin-Login:      admin / admin1234`);
  console.log(`   Standard-Login:   testuser / ${DEFAULT_PASSWORD}`);
  console.log(`   Mitglieder-Login: <vorname.nachname> / ${DEFAULT_PASSWORD}`);
}

seedTestData();

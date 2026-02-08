import db from "./db.js";

// damit Foreign Keys funktioniern -> Datenintegrität
function dbInit() {
db.exec(`
PRAGMA foreign_keys = ON;
`);

db.exec(`

-- Benutzer
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role Text NOT NULL CHECK (role IN ('admin', 'user')),
  -- active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  
);
`);
 
db.exec(`
-- Inventar
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL, 
  description TEXT,
  category TEXT NOT NULL,
  is_available INTEGER DEFAULT 1,
  is_for_borrow BOOLEAN DEFAULT TRUE  
);

CREATE TABLE IF NOT EXISTS borrow_request (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inventory_id INTEGER NOT NULL, 
  guest_name TEXT,
  guest_email TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'pending',
  answered_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id),
  FOREIGN KEY (answered_by) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS Borrows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  borrower_name TEXT NOT NULL,
  borrower_email TEXT NOT NULL,
  borrow_date TEXT NOT NULL,
  return_date TEXT,
  returned INTEGER DEFAULT 0,
  FOREIGN KEY (item_id) REFERENCES inventory(id)
);
`);

db.exec(`
-- Events (Kalender)
CREATE TABLE IF NOT EXISTS event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,
  created_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES user(id)
);

-- Öffnungszeiten
CREATE TABLE IF NOT EXISTS opening_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weekday INTEGER NOT NULL, -- 0 = Montag ... 6 = Sonntag
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES user(id)
);

-- Ferien / Feiertage / Sonderzeiträume
CREATE TABLE IF NOT EXISTS calendar_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  type TEXT NOT NULL, -- holiday | vacation | closed | special
  label TEXT,
  created_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES user(id)
);
`);
}


dbInit();

console.log("✅ Database initialized.");

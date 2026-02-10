import db from "./db.js";


function dbinit(db) {
    db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prename TEXT NOT NULL,
        surname TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL, -- hash des Passworts
        role TEXT NOT NULL CHECK (role IN ('admin', 'contributor', 'member')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // quantity_available evtl. entfernen und dynamisch berechnen mit anzahl borrows
    db.exec(`CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        quantity_available INTEGER NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        picture_url TEXT,
        is_for_borrow INTEGER DEFAULT 1, -- 1 = ja, 0 = nein
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        CHECK (quantity >= 0),
        CHECK (quantity_available >= 0 AND quantity_available <= quantity)

    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS borrows(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        user_id INTEGER,
        guest_name TEXT,
        guest_email TEXT,
        quantity INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'borrowed', 'returned', 'overdue', 'rejected')),
        comment TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        CHECK ((user_id IS NOT NULL AND guest_name IS NULL AND guest_email IS NULL) 
        OR 
        (user_id IS NULL AND guest_name IS NOT NULL AND guest_email IS NOT NULL))
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        location TEXT,
        host_id INTEGER,
        host_name TEXT, 
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (host_id) REFERENCES users(id)
    )`);

        // für zukunft
    db.exec(`CREATE TABLE IF NOT EXISTS event_items (
        event_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        PRIMARY KEY (event_id, item_id),
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (item_id) REFERENCES inventory(id)
    )`);
// -- 0 = Sonntag, 6 = Samstag
    db.exec(`CREATE TABLE IF NOT EXISTS opening_hours (
        weekday INTEGER PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6), 
        open_time TEXT NOT NULL,
        close_time TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES users(id),
        CHECK (time(open_time) <= time(close_time))
    )`);

    db.exec(`
        
        INSERT OR IGNORE INTO opening_hours (weekday, open_time, close_time)
        VALUES
        (1, '00:00', '00:00'),
        (2, '00:00', '00:00'),
        (3, '00:00', '00:00'),
        (4, '00:00', '00:00'),
        (5, '00:00', '00:00'),
        (6, '00:00', '00:00'),
        (0, '00:00', '00:00');        
    `);

    db.exec(`CREATE TABLE IF NOT EXISTS calendar_periods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK (type IN ('holiday', 'closed', 'exams')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.exec(`CREATE TABLE IF NOT EXISTS calendar_period_openings(
        weekday INTEGER NOT NULL,
        calendar_period_id INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        PRIMARY KEY (weekday, calendar_period_id),
        FOREIGN KEY (weekday) REFERENCES opening_hours(weekday),
        FOREIGN KEY (calendar_period_id) REFERENCES calendar_periods(id),
        CHECK (time(start_time) <= time(end_time))
    );`);
        
    
}

dbinit(db);
console.log("Datenbank initialisiert.");

    
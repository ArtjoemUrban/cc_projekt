// von KI generiert

import db from "./db.js";

function seedDatabase(db) {
  if (isAllreadySeeded(db)) {
    //return;
  }

  console.log("🌱 Seeding database...");

  db.prepare(`
    INSERT INTO users (username, password_hash, role)
    VALUES 
      ('admin', 'HASHED_ADMIN', 'admin'),
      ('alice', 'HASHED_USER', 'user'),
      ('bob', 'HASHED_USER', 'user')
  `).run();

  db.prepare(`
    INSERT INTO inventory (name, quantity, category, is_available, is_for_borrow)
    VALUES
      ('Laptop', 3, 'IT', 1, 1),
      ('Beamer', 1, 'Technik', 1, 1),
      ('Kabeltrommel', 5, 'Event', 1, 0)
  `).run();
}

function isAllreadySeeded(db) {
    const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (userCount > 0) {
    console.log("ℹ️ DB already seeded");
    return true;
  }
  return false;
}

seedDatabase(db);

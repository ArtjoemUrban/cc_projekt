import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

let db;

// Pfad richtig setzen
const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "database.db");
// console.log("Database path:", dbPath);

try {
  
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  console.log("✅ Connected to the SQLite database.");
} catch (error) {
  console.error("Failed to connect to the SQLite database:", error);
}
 
export default db;
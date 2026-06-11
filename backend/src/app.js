import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db/db.js';
import bycrypt from 'bcrypt';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

// Pflichtfelder beim Start prüfen
const required = ["JWT_SECRET", "INITIAL_ADMIN_USER", "INITIAL_ADMIN_PASSWORD"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Fehlende Umgebungsvariable: ${key}`);
    process.exit(1);
  }
}

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:4321" }));
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// admin user anlegen, falls noch nicht vorhanden
const adminUser = db.prepare("SELECT * FROM users WHERE role = ?").get('admin');
if (!adminUser) {
    const salt  = bycrypt.genSaltSync(10);

    const passwordHash =  bycrypt.hashSync(process.env.INITIAL_ADMIN_PASSWORD, salt);  
    db.prepare("INSERT INTO users (prename, surname, email, username,password, role, created_at) VALUES ('admin', 'admin','placeholder', ?, ?, 'admin', CURRENT_TIMESTAMP )").run(process.env.INITIAL_ADMIN_USER, passwordHash);
    console.log(`Admin user '${process.env.INITIAL_ADMIN_USER}' created.`);
} else {
    //console.log(`Admin user '${process.env.INITIAL_ADMIN_USER}' already exists.`);
}



import inventoryRoutes from './routes/inventory.js';
import borrowRoutes from './routes/borrows.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import eventsRoutes from './routes/events.js';
import openingHoursRoutes from './routes/openingHours.js';
import calendarPeriodsRoutes from './routes/calendarPeriods.js';
import boardMembersRoutes from './routes/boardMembers.js';

app.use('/opening-hours', openingHoursRoutes(db));
app.use('/events', eventsRoutes(db));
app.use('/inventory', inventoryRoutes(db));
app.use('/borrows', borrowRoutes(db));
app.use('/auth', authRoutes(db));
app.use('/user', userRoutes(db));
app.use('/calendar-periods', calendarPeriodsRoutes(db));
app.use('/board-members', boardMembersRoutes(db));
export default app;
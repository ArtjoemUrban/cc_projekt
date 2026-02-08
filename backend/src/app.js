import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import betterSqlite3 from 'better-sqlite3';
import db from './db/db.js';
import bycrypt from 'bcrypt';

const app = express();

app.use(cors());
app.use(express.json());

//const db  = await import('./db/db.js');
db.pragma('foreign_keys = ON');

// admin user anlegen, falls noch nicht vorhanden
const adminUser = db.prepare("SELECT * FROM users WHERE role = ?").get('admin');
if (!adminUser) {
    const salt  = bycrypt.genSaltSync(10);

    const passwordHash =  bycrypt.hashSync(process.env.INITIAL_ADMIN_PASSWORD, salt);  
    db.prepare("INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, 'admin', CURRENT_TIMESTAMP )").run(process.env.INITIAL_ADMIN_USER, passwordHash);
    console.log(`Admin user '${process.env.INITIAL_ADMIN_USER}' created.`);
} else {
    //console.log(`Admin user '${process.env.INITIAL_ADMIN_USER}' already exists.`);
}

import healthRoutes from './routes/health.routes.js';
app.use(healthRoutes);

import inventoryRoutes from './routes/inventory.js';
import borrowRoutes from './routes/borrowRequest.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

app.use('/inventory', inventoryRoutes(db));  
app.use('/borrow', borrowRoutes);
app.use('/auth', authRoutes(db));
app.use('/user', userRoutes(db));
export default app;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db/db.js';
import errorHandler from './middleware/errorHandler.js';
import { seedAdminUser } from './db/seedAdmin.js';

import inventoryRoutes from './routes/inventory.js';
import borrowRoutes from './routes/borrows.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import eventsRoutes from './routes/events.js';
import openingHoursRoutes from './routes/openingHours.js';
import boardMembersRoutes from './routes/boardMembers.js';

const __dirname = dirname(fileURLToPath(import.meta.url)); 

dotenv.config();
seedAdminUser(db);

const app = express();
app.use(cors());
app.use(express.json());
// für uploads (Bilder)
app.use('/uploads', express.static(join(__dirname, '../uploads'))); // Serve static files from the uploads directory

app.use('/opening-hours', openingHoursRoutes(db));
app.use('/events', eventsRoutes(db));
app.use('/inventory', inventoryRoutes(db));
app.use('/borrows', borrowRoutes(db));
app.use('/auth', authRoutes(db));
app.use('/user', userRoutes(db));
app.use('/board-members', boardMembersRoutes(db));

app.use(errorHandler);

export default app;

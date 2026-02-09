import {Router} from 'express';
import { verifyJwt } from '../middleware/authMiddleware.js';

export default function eventsRoutes(db) {
  const router = Router();

  router.post('/', verifyJwt, (req, res) => {
    const body = req.body || {};
    const requiredFields = ['title', 'start_datetime', 'end_datetime', 'location'];
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
    }
    const { title, start_datetime, end_datetime, location } = body;

    try {
      const stmt = db.prepare('INSERT INTO events (title, start_datetime, end_datetime, location) VALUES (?, ?, ?, ?)');
      stmt.run(title, start_datetime, end_datetime, location);
      res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



  router.get('/',  (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM events");
      const events = stmt.all();
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }   
  });

  router.get('/:id', (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("SELECT * FROM events WHERE id = ?");
      const event = stmt.get(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(200).json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }   
  });

  router.delete('/:id', verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("DELETE FROM events WHERE id = ?");
      const result = stmt.run(id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }   
  });

 router.put('/:id', verifyJwt, (req, res) => {
    const id = req.params.id;
    const body = req.body || {};

    try {
        const existing = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
        if (!existing) {
        return res.status(404).json({ message: "Event not found" });
        }

        const title = body.title ?? existing.title;
        const start_datetime = body.start_datetime ?? existing.start_datetime;
        const end_datetime = body.end_datetime ?? existing.end_datetime;
        const location = body.location ?? existing.location;
        const description = body.description ?? existing.description;

        const stmt = db.prepare(
        "UPDATE events SET title = ?, start_datetime = ?, end_datetime = ?, location = ?, description = ? WHERE id = ?"
        );
        stmt.run(title, start_datetime, end_datetime, location, description, id);

        res.status(200).json({ message: "Event updated successfully" });
    } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

  return router;
}
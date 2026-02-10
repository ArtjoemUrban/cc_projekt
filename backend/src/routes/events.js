import {Router} from 'express';
import { verifyJwt, isAdmin } from '../middleware/authMiddleware.js';
import { checkRequiredFields } from '../middleware/missingFields.js';

export default function eventsRoutes(db) {
  const router = Router();

  router.post('/', verifyJwt, isAdmin, (req, res) => {
    const body = req.body || {};
    const requiredFields = ['title', 'start_time', 'end_time'];
    checkRequiredFields(requiredFields)(req, res, () => {});
    const { title,description, start_time, end_time, location, host_id, host_name } = body;
    const createdBy = req.user.id; 

    try {
      const stmt = db.prepare('INSERT INTO events (title, description, start_time, end_time, location, host_id, host_name, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(title, description, start_time, end_time, location, host_id, host_name, createdBy);
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

  router.delete('/:id', verifyJwt, isAdmin, (req, res) => {
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

 router.put('/:id', verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id;
    const body = req.body || {};

    try {
        const existing = db.prepare("SELECT * FROM events WHERE id = ?").get(id);
        if (!existing) {
        return res.status(404).json({ message: "Event not found" });
        }

        const title = body.title ?? existing.title;
        const start_time = body.start_time ?? existing.start_time;
        const end_time = body.end_time ?? existing.end_time;
        const location = body.location ?? existing.location;
        const description = body.description ?? existing.description;
        const host_id = body.host_id ?? existing.host_id;
        const host_name = body.host_name ?? existing.host_name;
        const updatedBy = req.user.id;

        const stmt = db.prepare(
        "UPDATE events SET title = ?, start_time = ?, end_time = ?, location = ?, description = ?, host_id = ?, host_name = ?, updated_by = ? WHERE id = ?"
        );
        stmt.run(title, start_time, end_time, location, description, host_id, host_name, updatedBy, id);

        res.status(200).json({ message: "Event updated successfully" });
    } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

  return router;
}
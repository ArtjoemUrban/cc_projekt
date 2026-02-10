import { Router } from "express";
import { verifyJwt, isAdmin} from "../middleware/authMiddleware.js";
import { checkRequiredFields } from "../middleware/missingFields.js";

export default function calendarPeriodsRoutes(db) {
  const router = Router();

  router.get("/", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM calendar_periods");
      const periods = stmt.all();
      res.status(200).json(periods);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get("/:id", (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("SELECT * FROM calendar_periods WHERE id = ?");
      const period = stmt.get(id);
      if (!period) {
        return res.status(404).json({ message: "Calendar period not found" });
      }
      res.status(200).json(period);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar period" });
    }
  });

  // type: 'holiday', 'closed', 'exams'
  router.post("/", verifyJwt, isAdmin, (req, res) => {
    const body = req.body || {};
    const requiredFields = [ "start_date", "end_date", "type"];
    checkRequiredFields(requiredFields)(req, res, () => {});
    if (!["holiday", "closed", "exams"].includes(body.type)) {
      return res.status(400).json({ message: "Invalid type. Must be 'holiday', 'closed', or 'exams'." });
    }
    
    const { start_date, end_date, description, type } = body;
    try {
      const stmt = db.prepare("INSERT INTO calendar_periods (start_date, end_date, description, type) VALUES (?, ?, ?, ?)");
      const result = stmt.run(start_date, end_date, description, type);
      res.status(201).json({ id: result.lastInsertRowid, start_date, end_date, description, type });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.delete("/:id", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("DELETE FROM calendar_periods WHERE id = ?");
      const result = stmt.run(id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Calendar period not found" });
      }
      res.status(200).json({ message: "Calendar period deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.put("/:id", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id;
    const body = req.body || {};
    const { start_date, end_date, description, type } = body;

    if (type && !["holiday", "closed", "exams"].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be 'holiday', 'closed', or 'exams'." });
    }

    try {
      const existing = db.prepare("SELECT * FROM calendar_periods WHERE id = ?").get(id);
      if (!existing) {
        return res.status(404).json({ message: "Calendar period not found" });
      }

      const updatedStartDate = start_date ?? existing.start_date;
      const updatedEndDate = end_date ?? existing.end_date;
      const updatedDescription = description ?? existing.description;
      const updatedType = type ?? existing.type;

      const stmt = db.prepare("UPDATE calendar_periods SET start_date = ?, end_date = ?, description = ?, type = ? WHERE id = ?");
      stmt.run(updatedStartDate, updatedEndDate, updatedDescription, updatedType, id);

      res.status(200).json({ message: "Calendar period updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/period-openings/:weekday", verifyJwt, isAdmin, (req, res) => {
    const weekday = parseInt(req.params.weekday);
    if (![1, 2, 3, 4, 5, 6, 0].includes(parseInt(weekday))) {
      return res.status(400).json({ message: "Invalid weekday. Must be 0 (Sunday) to 6 (Saturday)." });
    }

    const body = req.body || {};
    const requiredFields = ["period_id", "open_time", "close_time"];
    checkRequiredFields(requiredFields)(req, res, () => {});
    
    const { period_id, open_time, close_time } = body;
    try {
      const stmt = db.prepare("INSERT INTO calendar_period_openings (weekday, calendar_period_id, start_time, end_time) VALUES (?, ?, ?, ?)");
      const result = stmt.run(weekday, period_id, open_time, close_time);s
      res.status(201).json({ id: result.lastInsertRowid, weekday, period_id, open_time, close_time });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get("/period-openings/:weekday/:period_id", (req, res) => {
    const { weekday, period_id } = req.params;
    try {
      const stmt = db.prepare(`
        SELECT * FROM calendar_period_openings 
        WHERE weekday = ? AND period_id = ?`);
      const openings = stmt.all(weekday, period_id);
      res.status(200).json(openings);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

return router;
}
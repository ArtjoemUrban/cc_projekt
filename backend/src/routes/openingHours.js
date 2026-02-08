import { Router } from "express";
import { verifyJwt } from "../middleware/authMiddleware.js";

export default function openingHoursRoutes(db) {
  const router = Router();

  router.post("/opening-hours", verifyJwt, (req, res) => {
    const body = req.body || {};
    const requiredFields = ["day_of_week", "open_time", "close_time"];
    const missing = requiredFields.filter((field) => !body[field]);
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing fields: ${missing.join(", ")}` });
    }
    const { day_of_week, open_time, close_time } = body;

    try {
      const stmt = db.prepare(
        "INSERT INTO opening_hours (day_of_week, open_time, close_time) VALUES (?, ?, ?)"
      );
      stmt.run(day_of_week, open_time, close_time);
      res.status(201).json({ message: "Opening hours created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create opening hours" });
    }
  });

    router.get("/opening-hours", (req, res) => {
    try {      const stmt = db.prepare("SELECT * FROM opening_hours");
      const hours = stmt.all();
      res.status(200).json(hours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opening hours" });
    }
  });

    router.delete("/opening-hours/:id", verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("DELETE FROM opening_hours WHERE id = ?");
      const result = stmt.run(id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Opening hours not found" });
      }
      res.status(200).json({ message: "Opening hours deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete opening hours" });
    }
  });

  router.put("/opening-hours/:id", verifyJwt, (req, res) => {
    const id = req.params.id;
    const body = req.body || {};
    const { day_of_week, open_time, close_time } = body;

    try {
      const stmt = db.prepare(
        "UPDATE opening_hours SET day_of_week = ?, open_time = ?, close_time = ? WHERE id = ?"
      );
      const result = stmt.run(day_of_week, open_time, close_time, id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Opening hours not found" });
      }
      res.status(200).json({ message: "Opening hours updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update opening hours" });
    }
  });

  return router;
}
import { Router } from "express";
import { verifyJwt } from "../middleware/authMiddleware.js";

export default function openingHoursRoutes(db) {
  const router = Router();

  router.post("/", verifyJwt, (req, res) => {
    const body = req.body || {};
    const requiredFields = ["day_of_week", "open_time", "close_time"];
    const missing = requiredFields.filter((field) => !body[field]);
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing fields: ${missing.join(", ")}` });
    }
    const { day_of_week, open_time, close_time } = body;

    const validDays = [0, 1, 2, 3, 4, 5, 6];
    if (!validDays.includes(day_of_week)) {
      return res.status(400).json({ message: "Invalid day_of_week value" });
    }
    const dayExists = db.prepare("SELECT 1 FROM opening_hours WHERE weekday = ?").get(day_of_week);
    if (dayExists) {
      return res.status(400).json({ message: "Opening hours for this day already exist" });
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO opening_hours (weekday, open_time, close_time) VALUES (?, ?, ?)"
      );
      stmt.run(day_of_week, open_time, close_time);
      res.status(201).json({ message: "Opening hours created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

    router.get("/", (req, res) => {
    try {      const stmt = db.prepare("SELECT * FROM opening_hours");
      const hours = stmt.all();
      res.status(200).json(hours);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get("/:day_of_week", (req, res) => {
    const day_of_week = req.params.day_of_week;
    try {
      const stmt = db.prepare("SELECT * FROM opening_hours WHERE weekday = ?");
      const hours = stmt.get(day_of_week);
      if (!hours) {
        return res.status(404).json({ message: "Opening hours not found" });
      }
      res.status(200).json(hours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opening hours" });
    }
  });

    router.delete("/:day_of_week", verifyJwt, (req, res) => {
    const day_of_week = req.params.day_of_week;
    try {
      const stmt = db.prepare("DELETE FROM opening_hours WHERE weekday = ?");
      const result = stmt.run(day_of_week);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Opening hours not found" });
      }
      res.status(200).json({ message: "Opening hours deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.put("/:day_of_week", verifyJwt, (req, res) => {
    const day_of_week = req.params.day_of_week;
    const body = req.body || {};
    const { open_time, close_time } = body;

    try {
      const stmt = db.prepare(
        "UPDATE opening_hours SET open_time = ?, close_time = ? WHERE weekday = ?"
      );
      const result = stmt.run(open_time, close_time, day_of_week);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Opening hours not found" });
      }
      res.status(200).json({ message: "Opening hours updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
}
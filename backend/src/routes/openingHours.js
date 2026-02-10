import { Router } from "express";
import { verifyJwt, isAdmin} from "../middleware/authMiddleware.js";

export default function openingHoursRoutes(db) {
  const router = Router();

 

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

  /*router.post("/:weekday", verifyJwt, isAdmin, (req, res) => {
    const body = req.body || {};
    const requiredFields = ["open_time", "close_time"];
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
        return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
    }
    
    const { open_time, close_time } = body;
    const weekday = parseInt(req.params.weekday);
   
    if (![1, 2, 3, 4, 5, 6, 0].includes(parseInt(weekday))) {
      return res.status(400).json({ message: "Invalid weekday. Must be 0 (Sunday) to 6 (Saturday)." });
    }
    try {
      const stmt = db.prepare("INSERT INTO opening_hours (weekday, open_time, close_time) VALUES (?, ?, ?)");
      const result = stmt.run(weekday, open_time, close_time);
      res.status(201).json({ id: result.lastInsertRowid, weekday, open_time, close_time });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });*/


  router.put("/:day_of_week", verifyJwt, isAdmin, (req, res) => {
    const day_of_week = req.params.day_of_week;
    if (![1, 2, 3, 4, 5, 6, 0].includes(parseInt(day_of_week))) {
      return res.status(400).json({ message: "Invalid day_of_week. Must be 0 (Sunday) to 6 (Saturday)." });
    }
    const body = req.body || {};
    const { open_time, close_time } = body;
    const updatedBy = req.user.id; // Assuming verifyJwt adds user info to req

    try {
      const stmt = db.prepare(
        "UPDATE opening_hours SET open_time = ?, close_time = ?, updated_by = ? WHERE weekday = ?"
      );
      const result = stmt.run(open_time, close_time, updatedBy, day_of_week);
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
import { Router } from "express";
import { verifyJwt } from "../middleware/authMiddleware.js";

export default function openingHoursRoutes(db) {
  const router = Router();

  router.get("/shifts", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM shifts");
      const shifts = stmt.all();
      res.status(200).json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  router.get("/shifts/:id", (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("SELECT * FROM shifts WHERE id = ?");
      const shift = stmt.get(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.status(200).json(shift);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shift" });
    }
  });

  router.post("/shifts", verifyJwt, (req, res) => {
    const body = req.body || {};
    const requiredFields = ["user_id", "start_time", "end_time"];
    const missing = requiredFields.filter((field) => !body[field]);
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing fields: ${missing.join(", ")}` });
    }
    const { user_id, start_time, end_time } = body;

    try {
      const stmt = db.prepare(
        "INSERT INTO shifts (user_id, start_time, end_time) VALUES (?, ?, ?)"
      );
      stmt.run(user_id, start_time, end_time);
      res.status(201).json({ message: "Shift created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create shift" });
    }
  });

  router.delete("/shifts/:id", verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("DELETE FROM shifts WHERE id = ?");
      const result = stmt.run(id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.status(200).json({ message: "Shift deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete shift" });
    }
  });

  router.put("/shifts/:id", verifyJwt, (req, res) => {
    const id = req.params.id;
    const body = req.body || {};
    const { user_id, start_time, end_time } = body;

    try {
      const stmt = db.prepare(
        "UPDATE shifts SET user_id = ?, start_time = ?, end_time = ? WHERE id = ?"
      );
      const result = stmt.run(user_id   , start_time, end_time, id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.status(200).json({ message: "Shift updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update shift" });
    }
  });

  router.post("/shifts/:id/join", verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const getShiftStmt = db.prepare("SELECT * FROM shifts WHERE id = ?");
      const shift = getShiftStmt.get(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      const joinStmt = db.prepare("INSERT INTO shift_participants (shift_id, user_id) VALUES (?, ?)");
      joinStmt.run(id, req.user.id);

      res.status(200).json({ message: "Joined shift successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join shift" });
    }
  });

    router.post("/shifts/:id/leave", verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const getShiftStmt = db.prepare("SELECT * FROM shifts WHERE id = ?");
      const shift = getShiftStmt.get(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      const leaveStmt = db.prepare("DELETE FROM shift_participants WHERE shift_id = ? AND user_id = ?");
      const result = leaveStmt.run(id, req.user.id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "User not part of this shift" });
      }

      res.status(200).json({ message: "Left shift successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave shift" });
    }
  });

  return router;
}
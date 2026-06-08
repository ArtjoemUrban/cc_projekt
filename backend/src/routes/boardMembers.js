import { Router } from "express";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";

export default function boardMembersRoutes(db) {
  const router = Router();

  // Öffentlich: nur sichtbare Mitglieder, sortiert
  router.get("/", (req, res) => {
    try {
      const stmt = db.prepare(
        "SELECT * FROM board_members WHERE visible = 1 ORDER BY sort_order ASC, id ASC"
      );
      res.status(200).json(stmt.all());
    } catch {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Admin: alle Mitglieder (auch unsichtbare)
  router.get("/all", verifyJwt, isAdmin, (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM board_members ORDER BY sort_order ASC, id ASC");
      res.status(200).json(stmt.all());
    } catch {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/", verifyJwt, isAdmin, (req, res) => {
    const { name, position, description, image_path, sort_order, visible, user_id } = req.body || {};
    if (!name || !position) {
      return res.status(400).json({ message: "name und position sind erforderlich" });
    }
    try {
      const stmt = db.prepare(
        "INSERT INTO board_members (user_id, name, position, description, image_path, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      const result = stmt.run(
        user_id ?? null,
        name,
        position,
        description ?? null,
        image_path ?? null,
        sort_order ?? 0,
        visible !== undefined ? (visible ? 1 : 0) : 1
      );
      res.status(201).json({ id: result.lastInsertRowid });
    } catch {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.put("/:id", verifyJwt, isAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { name, position, description, image_path, sort_order, visible, user_id } = req.body || {};
    if (!name || !position) {
      return res.status(400).json({ message: "name und position sind erforderlich" });
    }
    try {
      const stmt = db.prepare(
        "UPDATE board_members SET user_id=?, name=?, position=?, description=?, image_path=?, sort_order=?, visible=? WHERE id=?"
      );
      const result = stmt.run(
        user_id ?? null,
        name,
        position,
        description ?? null,
        image_path ?? null,
        sort_order ?? 0,
        visible !== undefined ? (visible ? 1 : 0) : 1,
        id
      );
      if (result.changes === 0) {
        return res.status(404).json({ message: "Mitglied nicht gefunden" });
      }
      res.status(200).json({ message: "Aktualisiert" });
    } catch {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.delete("/:id", verifyJwt, isAdmin, (req, res) => {
    const id = Number(req.params.id);
    try {
      const result = db.prepare("DELETE FROM board_members WHERE id = ?").run(id);
      if (result.changes === 0) {
        return res.status(404).json({ message: "Mitglied nicht gefunden" });
      }
      res.status(200).json({ message: "Gelöscht" });
    } catch {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
}

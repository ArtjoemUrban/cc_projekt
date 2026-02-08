import { Router } from "express";
import {verifyJwt} from "../middleware/authMiddleware.js";

export default function  inventoryRoutes(db) {
  const router = Router();

  router.get("/available", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM inventory WHERE is_available = 1");
      const items = stmt.all();
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching available inventory:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/categories", (req, res) => {
    try {
      const stmt = db.prepare("SELECT DISTINCT category FROM inventory");
      const categories = stmt.all().map(row => row.category);
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  // Alle Inventaritems abrufen
  router.get("/", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM inventory");
      const items = stmt.all();
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/:id", (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("SELECT * FROM inventory WHERE id = ?");
      const item = stmt.get(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.status(200).json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/", verifyJwt, (req, res) => {
    const body = req.body || {};
    const requiredFields = ["name", "quantity", "category"];
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
        return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
    }
    
    const { name, quantity, description, category, is_available, is_for_borrow } = body;
    try {
      const stmt = db.prepare(`
        INSERT INTO inventory (name, quantity, description, category, is_available, is_for_borrow) 
        VALUES (?, ?, ?, ?, ?, ?)`);
      const info = stmt.run(name, quantity, description || null, category, is_available ? 1 : 0, is_for_borrow ? 1 : 0);

      res.status(201).json({ id: info.lastInsertRowid, name, quantity, description, category, is_available, is_for_borrow });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });



  // patch für teilweises update, put für komplettes update

  router.patch("/:id", verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      const { name, quantity, description, category, is_available, is_for_borrow } = req.body;
      const stmt = db.prepare(`
        UPDATE inventory 
        SET name = ?, quantity = ?, description = ?, category = ?, is_available = ?, is_for_borrow = ?
        WHERE id = ?`);
      stmt.run(name !== undefined ? name : item.name, quantity !== undefined ? quantity : item.quantity, description !== undefined ? description : item.description, category !== undefined ? category : item.category, 
              typeof is_available === 'boolean' ? (is_available ? 1 : 0) : item.is_available, 
              typeof is_for_borrow === 'boolean' ? (is_for_borrow ? 1 : 0) : item.is_for_borrow,
                id);

      res.status(200).json({ message: "Inventory item updated", id });
    } catch (error) { 
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.delete("/:id", verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      const stmt = db.prepare("DELETE FROM inventory WHERE id = ?");
      const info = stmt.run(id);
      res.status(200).json({ message: "Inventory item deleted", id });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
}



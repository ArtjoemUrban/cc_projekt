import { Router } from "express";
import {verifyJwt, isAdmin} from "../middleware/authMiddleware.js";
import { checkRequiredFields } from "../middleware/missingFields.js";

export default function  inventoryRoutes(db) {
  const router = Router();

  router.get("/available", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM inventory WHERE is_quantity_available > 0");
      const items = stmt.all();
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching available inventory:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get("/categories/:category", (req, res) => {
    try {
      const stmt = db.prepare("SELECT  * FROM inventory WHERE category = ?");
      const categories = stmt.all(req.params.category);
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Internal Server Error" });
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
      res.status(500).json({ message: "Internal Server Error" });
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
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/", verifyJwt, isAdmin, (req, res) => {
    const body = req.body || {};
    const requiredFields = ["name", "quantity", "category"];
    checkRequiredFields(requiredFields)(req, res, () => {});
    
    const { name, quantity, category, description, picture_url, is_for_borrow } = body;
    try {
      const stmt = db.prepare(`
        INSERT INTO inventory (name, quantity, quantity_available, description, category, picture_url, is_for_borrow) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`);
      const info = stmt.run(name, quantity, quantity, description || null, category, picture_url || null,  is_for_borrow ? 1 : 0);

      res.status(201).json({ id: info.lastInsertRowid, name, quantity, description, category, picture_url, is_for_borrow });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });



  // patch für teilweises update, put für komplettes update

  router.patch("/:id", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id;
    try {
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      const { name, quantity,  description, category, picture_url, is_for_borrow } = req.body;
      const stmt = db.prepare(`
        UPDATE inventory 
        SET name = ?, quantity = ?, quantity_available = ?, description = ?, category = ?, picture_url = ?, is_for_borrow = ?
        WHERE id = ?`);
      stmt.run(name !== undefined ? name : item.name, quantity !== undefined ? quantity : item.quantity, quantity !== undefined ? quantity : item.quantity, description !== undefined ? description : item.description, category !== undefined ? category : item.category, 
              picture_url !== undefined ? picture_url : item.picture_url,
              typeof is_for_borrow === 'boolean' ? (is_for_borrow ? 1 : 0) : item.is_for_borrow,
                id);

      res.status(200).json({ message: "Inventory item updated", id });
    } catch (error) { 
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.delete("/:id", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id;
    try {
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      const borrowed = db.prepare("SELECT 1 FROM borrows WHERE item_id = ? AND status = 'approved'").get(id);
      if (borrowed) {
        return res.status(409).json({ message: "Cannot delete item that is currently borrowed" });
      }

      const stmt = db.prepare("DELETE FROM inventory WHERE id = ?");
      const info = stmt.run(id);
      res.status(200).json({ message: "Inventory item deleted", id });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
}



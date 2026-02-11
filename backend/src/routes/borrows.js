import { Router } from "express";
import {verifyJwt, isAdmin} from "../middleware/authMiddleware.js";
import { checkRequiredFields } from "../middleware/missingFields.js";
import app from "../app.js";

export default function borrowRoutes(db) {
  const router = Router();
  

  router.get("/", verifyJwt, (req, res) => {
    try {
      const stmt = db.prepare(`SELECT * FROM borrows`);
      const borrows = stmt.all();
      res.status(200).json(borrows);
    } catch (error) {
      console.error("Error fetching borrows:", error);
      res.status(500).json({ message: "Internal Server Error" });
    } 
        
  });

  // evtl transaktions verwenden, damit beide queries entweder erfolgreich sind oder beide fehlschlagen
  router.post("/user", verifyJwt, (req, res) => {
    const body = req.body || {};
    const requiredFields = ["item_id","user_id","quantity", "start_date", "end_date"];
    checkRequiredFields(requiredFields)(req, res, () => {});

    
    const { item_id, user_id, quantity, start_date, end_date } = body;
    try {
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(item_id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      if (item.quantity_available < quantity) {
        return res.status(400).json({ message: "Not enough items available for borrowing" });
      }
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stmt = db.prepare(`
        INSERT INTO borrows (item_id, user_id, quantity, start_date, end_date) 
        VALUES (?, ?, ?, ?, ?)`);
      const info = stmt.run(item_id, user_id, quantity, start_date, end_date);
      res.status(201).json({ id: info.lastInsertRowid, item_id, user_id, quantity, start_date, end_date });
    } catch (error) {
      console.error("Error adding borrow record:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/guest", (req, res) => {
    const body = req.body || {};
    const requiredFields = ["item_id","guest_name","guest_email","quantity", "start_date", "end_date"];
    checkRequiredFields(requiredFields)(req, res, () => {});
    
    const { item_id, guest_name, guest_email, quantity, start_date, end_date } = body;
    try {
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(item_id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      if (item.quantity_available < quantity) {
        return res.status(400).json({ message: "Not enough items available for borrowing" });
      }

      const stmt = db.prepare(`
        INSERT INTO borrows (item_id, guest_name, guest_email, quantity, start_date, end_date) 
        VALUES (?, ?, ?, ?, ?, ?)`);
      const info = stmt.run(item_id, guest_name, guest_email, quantity, start_date, end_date);
      res.status(201).json({ id: info.lastInsertRowid, item_id, guest_name, guest_email, quantity, start_date, end_date });
    } catch (error) {
      console.error("Error adding borrow record:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  /*const approveTransaction = db.transaction((borrowId) => {
    const borrow = db.prepare("SELECT * FROM borrows WHERE id = ?").get(borrowId);
    if (!borrow) {
      throw new Error("Borrow record not found");
    }
    if (borrow.status !== 'pending') {
      throw new Error("Only pending borrows can be approved");
    }

    const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(borrow.item_id);
    if (!item) {
      throw new Error("Inventory item not found");
    }
    if (item.quantity_available < borrow.quantity) {
      throw new Error("Not enough items available to approve this borrow");
    }

    const updateBorrowStmt = db.prepare("UPDATE borrows SET status = 'borrowed', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    updateBorrowStmt.run(borrowId);

    const updateItemStmt = db.prepare("UPDATE inventory SET quantity_available = quantity_available - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    updateItemStmt.run(borrow.quantity, borrow.item_id);
  });*/

  router.put("/:id/approve", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id; 
    try {      const borrow = db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
      if (!borrow) {
        return res.status(404).json({ message: "Borrow record not found" });
      }
      if (borrow.status !== 'pending') {
        return res.status(400).json({ message: "Only pending borrows can be approved" });
      }

      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(borrow.item_id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      if (item.quantity_available < borrow.quantity) {
        return res.status(400).json({ message: "Not enough items available to approve this borrow" });
      }

      const updateBorrowStmt = db.prepare("UPDATE borrows SET status = 'borrowed', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
      updateBorrowStmt.run(id);

      const updateItemStmt = db.prepare("UPDATE inventory SET quantity_available = quantity_available - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
      updateItemStmt.run(borrow.quantity, borrow.item_id);

      res.status(200).json({ message: "Borrow approved successfully" });
    } catch (error) {
      console.error("Error approving borrow:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.put("/:id/reject", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id; 
    try {
      const borrow = db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
      if (!borrow) {
        return res.status(404).json({ message: "Borrow record not found" });
      }
      if (borrow.status !== 'pending') {
        return res.status(400).json({ message: "Only pending borrows can be rejected" });
      }

      const stmt = db.prepare("UPDATE borrows SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
      stmt.run(id);

      res.status(200).json({ message: "Borrow rejected successfully" });
    } catch (error) {
      console.error("Error rejecting borrow:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }); 

  router.put("/:id/return", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id; 
    try {
      const borrow = db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
      if (!borrow) {
        return res.status(404).json({ message: "Borrow record not found" });
      }
      if (borrow.status !== 'borrowed') {
        return res.status(400).json({ message: "Only borrowed items can be returned" });
      }

      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(borrow.item_id);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      const updateBorrowStmt = db.prepare("UPDATE borrows SET status = 'returned', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
      updateBorrowStmt.run(id);

      const updateItemStmt = db.prepare("UPDATE inventory SET quantity_available = quantity_available + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
      updateItemStmt.run(borrow.quantity, borrow.item_id);

      res.status(200).json({ message: "Borrow returned successfully" });
    } catch (error) {
      console.error("Error returning borrow:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.delete("/:id", verifyJwt, isAdmin, (req, res) => {
    const id = req.params.id; 
    try {
      const borrow = db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
      if (!borrow) {
        return res.status(404).json({ message: "Borrow record not found" });
      }
      if (borrow.status === 'borrowed') {
        return res.status(400).json({ message: "Cannot delete a borrow record that is currently borrowed" });
      }

      const stmt = db.prepare("DELETE FROM borrows WHERE id = ?");
      stmt.run(id);

      res.status(200).json({ message: "Borrow record deleted successfully" });
    } catch (error) {
      console.error("Error deleting borrow record:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
      

  return router;
}
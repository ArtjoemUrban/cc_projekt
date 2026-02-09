import { Router } from "express";
import {verifyJwt} from "../middleware/authMiddleware.js";

export default function borrowRoutes(db) {
  const router = Router();

  router.post("/borrow-request", (req, res) => {
    const body = req.body || {};
    const requiredFields = ["item_id", "borrower_name", "borrower_email", "start_date", "end_date"];
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
        return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
    }
    const { item_id, borrower_name, borrower_email, start_date, end_date } = body;

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }
    const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(item_id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const { quantity } = body;

    if (quantity > item.quantity) {
      return res.status(400).json({ message: "Requested quantity exceeds available quantity" });
    }

    try {
      const stmt = db.prepare("INSERT INTO borrow_request (item_id, quantity, borrower_name, borrower_email, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(item_id, quantity, borrower_name, borrower_email, start_date, end_date);
      res.status(201).json({ message: "Borrow request created successfully" });
    } catch (error) {
      console.error("Error creating borrow request:", error);
      res.status(500).json({ message: "Internal Server Error" })
    };
  });

  router.get("/borrow-request", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM borrow_request");
      const requests = stmt.all();
      res.status(200).json(requests);
    } catch (error) {
      console.error("Error fetching borrow requests:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/borrow-request/:id/approve",verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const request = db.prepare("SELECT * FROM borrow_request WHERE id = ?").get(id);
      console.log("Fetched borrow request:", request);
      if (!request) {
        return res.status(404).json({ message: "Borrow request not found" });
      }
      if (request.status !== 'pending') {
        return res.status(400).json({ message: "Only pending requests can be approved" });
      }

      let stmt = db.prepare("UPDATE borrow_request SET status = 'approved' WHERE id = ?");
      stmt.run(id);
      
      stmt = db.prepare("INSERT INTO borrows (item_id, quantity, borrower_name, borrower_email, borrow_date, return_date) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(request.item_id, request.quantity, request.borrower_name, request.borrower_email, request.start_date, request.end_date);
      res.status(200).json({ message: "Borrow request approved" });
    } catch (error) {
      console.error("Error approving borrow request:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/borrow-request/:id/reject",verifyJwt,   (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("SELECT * FROM borrow_request  WHERE id = ?");
      const request = stmt.get(id);
      if (!request) {
        return res.status(404).json({ message: "Borrow request not found" });
      }
      if (request.status !== 'pending') {
        return res.status(400).json({ message: "Only pending requests can be rejected" });
      }

      const stmtUpdate = db.prepare("UPDATE borrow_request SET status = 'rejected' WHERE id = ?");
      stmtUpdate.run(id);
      res.status(200).json({ message: "Borrow request rejected" });
    } catch (error) {
      console.error("Error rejecting borrow request:", error);
      res.status(500).json({ message: "Internal Server Error" });   
    }
  });

  router.delete("/borrow-request/:id",verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("DELETE FROM borrow_request WHERE id = ?");
      stmt.run(id);
      res.status(200).json({ message: "Borrow request deleted" });
    } catch (error) {
      console.error("Error deleting borrow request:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.get("/borrow-requests/:id",verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("SELECT * FROM borrow_request WHERE id = ?");
      const request = stmt.get(id);
      if (!request) {
        return res.status(404).json({ message: "Borrow request not found" });
      }
      res.status(200).json(request);
    } catch (error) {
      console.error("Error fetching borrow request:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.put("/borrow-requests/:id/return",verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("UPDATE borrow_requests SET status = 'returned' WHERE id = ?");
      stmt.run(id);
      res.status(200).json({ message: "Borrow request marked as returned" });
    } catch (error) {
      console.error("Error marking borrow request as returned:", error);
      res.status(500).json({ message: "Internal Server Error" });
     }
   });

   router.get("/borrows",verifyJwt, (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM borrows");
      const borrows = stmt.all();
      res.status(200).json(borrows);
    } catch (error) {
      console.error("Error fetching borrows:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
   });

   router.get("/borrows/:id",verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("SELECT * FROM borrows WHERE id = ?");
      const borrow = stmt.get(id);
      if (!borrow) {
        return res.status(404).json({ message: "Borrow not found" });
      }
      res.status(200).json(borrow);
    } catch (error) {
      console.error("Error fetching borrow:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
   });

   router.put("/borrows/:id/return",verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("UPDATE borrows SET return_date = CURRENT_TIMESTAMP WHERE id = ?");
      stmt.run(id);
      res.status(200).json({ message: "Borrow marked as returned" });
    } catch (error) {
      console.error("Error marking borrow as returned:", error);
      res.status(500).json({ message: "Internal Server Error" });
     }
   });

   router.delete("/borrows/:id",verifyJwt, (req, res) => {
    const id = req.params.id;
    try {
      const stmt = db.prepare("DELETE FROM borrows WHERE id = ?");
      stmt.run(id);
      res.status(200).json({ message: "Borrow deleted" });
    } catch (error) {
      console.error("Error deleting borrow:", error);
      res.status(500).json({ message: "Internal Server Error" });
     }
   });

  return router;
}
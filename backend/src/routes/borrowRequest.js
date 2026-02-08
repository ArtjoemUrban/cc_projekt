import { Router } from "express";
import db from "../db/db.js";

const router = Router();

router.post("/", (req, res) => {
  const { inventory_id, user_name, user_email } = req.body;
  try {
    const statement = db.prepare("INSERT INTO borrow_request (inventory_id, user_name, user_email) VALUES (?, ?, ?)");
    const info = statement.run(inventory_id, user_name, user_email);
    res
      .status(201)
      .json({ id: info.lastInsertRowid, inventory_id, user_name, user_email });
  } catch (error) {
    console.error("Error creating borrow request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
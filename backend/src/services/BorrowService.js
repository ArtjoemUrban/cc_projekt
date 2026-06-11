import AppError from "../errors/AppError.js";

export default class BorrowService {
  constructor(db) {
    this.db = db;
    // Transaktionen einmalig vorbereiten — verhindert Race Conditions
    this.#approveTransaction = db.transaction((id) => {
      const borrow = db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
      if (!borrow) throw new AppError(404, "Borrow record not found");
      if (borrow.status !== "pending") throw new AppError(400, "Only pending borrows can be approved");
      const item = db.prepare("SELECT * FROM inventory WHERE id = ?").get(borrow.item_id);
      if (!item) throw new AppError(404, "Inventory item not found");
      if (item.quantity_available < borrow.quantity) throw new AppError(400, "Not enough items available");
      db.prepare("UPDATE borrows SET status='borrowed', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
      db.prepare("UPDATE inventory SET quantity_available=quantity_available-?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(borrow.quantity, borrow.item_id);
    });

    this.#returnTransaction = db.transaction((id) => {
      const borrow = db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
      if (!borrow) throw new AppError(404, "Borrow record not found");
      if (borrow.status !== "borrowed") throw new AppError(400, "Only borrowed items can be returned");
      db.prepare("UPDATE borrows SET status='returned', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
      db.prepare("UPDATE inventory SET quantity_available=quantity_available+?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(borrow.quantity, borrow.item_id);
    });
  }

  #approveTransaction;
  #returnTransaction;

  getAll() {
    return this.db.prepare("SELECT * FROM borrows").all();
  }

  createForUser({ item_id, user_id, quantity, start_date, end_date }) {
    if (!item_id || !user_id || !quantity || !start_date || !end_date) {
      throw new AppError(400, "Missing fields: item_id, user_id, quantity, start_date, end_date");
    }
    const item = this.db.prepare("SELECT * FROM inventory WHERE id = ?").get(item_id);
    if (!item) throw new AppError(404, "Inventory item not found");
    if (item.quantity_available < quantity) throw new AppError(400, "Not enough items available");
    const user = this.db.prepare("SELECT id FROM users WHERE id = ?").get(user_id);
    if (!user) throw new AppError(404, "User not found");
    const result = this.db.prepare(
      "INSERT INTO borrows (item_id, user_id, quantity, start_date, end_date) VALUES (?, ?, ?, ?, ?)"
    ).run(item_id, user_id, quantity, start_date, end_date);
    return { id: result.lastInsertRowid, item_id, user_id, quantity, start_date, end_date };
  }

  createForGuest({ item_id, guest_name, guest_email, quantity, start_date, end_date }) {
    if (!item_id || !guest_name || !guest_email || !quantity || !start_date || !end_date) {
      throw new AppError(400, "Missing fields: item_id, guest_name, guest_email, quantity, start_date, end_date");
    }
    const item = this.db.prepare("SELECT * FROM inventory WHERE id = ?").get(item_id);
    if (!item) throw new AppError(404, "Inventory item not found");
    if (item.quantity_available < quantity) throw new AppError(400, "Not enough items available");
    const result = this.db.prepare(
      "INSERT INTO borrows (item_id, guest_name, guest_email, quantity, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(item_id, guest_name, guest_email, quantity, start_date, end_date);
    return { id: result.lastInsertRowid, item_id, guest_name, guest_email, quantity, start_date, end_date };
  }

  approve(id) {
    this.#approveTransaction(id);
    return { message: "Borrow approved successfully" };
  }

  reject(id) {
    const borrow = this.db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
    if (!borrow) throw new AppError(404, "Borrow record not found");
    if (borrow.status !== "pending") throw new AppError(400, "Only pending borrows can be rejected");
    this.db.prepare("UPDATE borrows SET status='rejected', updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
    return { message: "Borrow rejected successfully" };
  }

  return(id) {
    this.#returnTransaction(id);
    return { message: "Borrow returned successfully" };
  }

  delete(id) {
    const borrow = this.db.prepare("SELECT * FROM borrows WHERE id = ?").get(id);
    if (!borrow) throw new AppError(404, "Borrow record not found");
    if (borrow.status === "borrowed") throw new AppError(400, "Cannot delete an active borrow");
    this.db.prepare("DELETE FROM borrows WHERE id = ?").run(id);
    return { message: "Borrow record deleted successfully" };
  }
}

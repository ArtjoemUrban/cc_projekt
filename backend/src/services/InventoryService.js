import AppError from "../errors/AppError.js";

export default class InventoryService {
  constructor(db) {
    this.db = db;
  }

  getAll() {
    return this.db.prepare("SELECT * FROM inventory").all();
  }

  getAvailable() {
    return this.db.prepare("SELECT * FROM inventory WHERE quantity_available > 0").all();
  }

  getByCategory(category) {
    return this.db.prepare("SELECT * FROM inventory WHERE category = ?").all(category);
  }

  getById(id) {
    const item = this.db.prepare("SELECT * FROM inventory WHERE id = ?").get(id);
    if (!item) throw new AppError(404, "Inventory item not found");
    return item;
  }

  create({ name, quantity, category, description, picture_url, is_for_borrow }) {
    if (!name || quantity === undefined || !category) {
      throw new AppError(400, "Missing required fields: name, quantity, category");
    }
    const result = this.db.prepare(
      "INSERT INTO inventory (name, quantity, quantity_available, description, category, picture_url, is_for_borrow) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(name, quantity, quantity, description ?? null, category, picture_url ?? null, is_for_borrow ? 1 : 0);
    return { id: result.lastInsertRowid, name, quantity, category };
  }

  update(id, body) {
    const item = this.getById(id);
    const { name, quantity, description, category, picture_url, is_for_borrow } = body;
    this.db.prepare(
      "UPDATE inventory SET name=?, quantity=?, quantity_available=?, description=?, category=?, picture_url=?, is_for_borrow=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(
      name ?? item.name,
      quantity ?? item.quantity,
      quantity ?? item.quantity,
      description ?? item.description,
      category ?? item.category,
      picture_url ?? item.picture_url,
      typeof is_for_borrow === "boolean" ? (is_for_borrow ? 1 : 0) : item.is_for_borrow,
      id
    );
    return { message: "Inventory item updated", id };
  }

  delete(id) {
    this.getById(id);
    const borrowed = this.db.prepare("SELECT 1 FROM borrows WHERE item_id = ? AND status = 'borrowed'").get(id);
    if (borrowed) throw new AppError(409, "Cannot delete item that is currently borrowed");
    this.db.prepare("DELETE FROM inventory WHERE id = ?").run(id);
    return { message: "Inventory item deleted", id };
  }
}

import AppError from "../errors/AppError.js";

export default class BoardMemberService {
  constructor(db) {
    this.db = db;
  }

  getVisible() {
    return this.db.prepare("SELECT * FROM board_members WHERE visible=1 ORDER BY sort_order ASC, id ASC").all();
  }

  getAll() {
    return this.db.prepare("SELECT * FROM board_members ORDER BY sort_order ASC, id ASC").all();
  }

  create({ name, position, description, image_path, sort_order, visible, user_id }) {
    if (!name || !position) throw new AppError(400, "name und position sind erforderlich");
    const result = this.db.prepare(
      "INSERT INTO board_members (user_id, name, position, description, image_path, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(user_id ?? null, name, position, description ?? null, image_path ?? null, sort_order ?? 0, visible !== undefined ? (visible ? 1 : 0) : 1);
    return { id: result.lastInsertRowid };
  }

  update(id, { name, position, description, image_path, sort_order, visible, user_id }) {
    if (!name || !position) throw new AppError(400, "name und position sind erforderlich");
    const result = this.db.prepare(
      "UPDATE board_members SET user_id=?, name=?, position=?, description=?, image_path=?, sort_order=?, visible=? WHERE id=?"
    ).run(user_id ?? null, name, position, description ?? null, image_path ?? null, sort_order ?? 0, visible !== undefined ? (visible ? 1 : 0) : 1, id);
    if (result.changes === 0) throw new AppError(404, "Mitglied nicht gefunden");
    return { message: "Aktualisiert" };
  }

  delete(id) {
    const result = this.db.prepare("DELETE FROM board_members WHERE id = ?").run(id);
    if (result.changes === 0) throw new AppError(404, "Mitglied nicht gefunden");
    return { message: "Gelöscht" };
  }
}

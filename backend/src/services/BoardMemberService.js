import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join, normalize } from "path";
import AppError from "../errors/AppError.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = join(__dirname, "../../uploads");

export default class BoardMemberService {
  constructor(db) {
    this.db = db;
  }

  /** Löscht die zu einem image_path gehörende Datei im uploads-Ordner (best effort). */
  _deleteImageFile(image_path) {
    if (!image_path || !image_path.startsWith("/uploads/")) return;
    const absolutePath = normalize(join(UPLOADS_ROOT, image_path.slice("/uploads".length)));
    if (!absolutePath.startsWith(UPLOADS_ROOT)) return;
    fs.unlink(absolutePath, (err) => {
      if (err && err.code !== "ENOENT") console.error("Konnte Bild nicht löschen:", err);
    });
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
    const existing = this.db.prepare("SELECT image_path FROM board_members WHERE id = ?").get(id);
    if (!existing) throw new AppError(404, "Mitglied nicht gefunden");
    const result = this.db.prepare(
      "UPDATE board_members SET user_id=?, name=?, position=?, description=?, image_path=?, sort_order=?, visible=? WHERE id=?"
    ).run(user_id ?? null, name, position, description ?? null, image_path ?? null, sort_order ?? 0, visible !== undefined ? (visible ? 1 : 0) : 1, id);
    if (existing.image_path && existing.image_path !== (image_path ?? null)) this._deleteImageFile(existing.image_path);
    if (result.changes === 0) throw new AppError(404, "Mitglied nicht gefunden");
    return { message: "Aktualisiert" };
  }

  removeImage(id) {
    const existing = this.db.prepare("SELECT image_path FROM board_members WHERE id = ?").get(id);
    if (!existing) throw new AppError(404, "Mitglied nicht gefunden");
    this.db.prepare("UPDATE board_members SET image_path=NULL WHERE id = ?").run(id);
    this._deleteImageFile(existing.image_path);
    return { message: "Bild entfernt" };
  }

  delete(id) {
    const existing = this.db.prepare("SELECT image_path FROM board_members WHERE id = ?").get(id);
    const result = this.db.prepare("DELETE FROM board_members WHERE id = ?").run(id);
    if (result.changes === 0) throw new AppError(404, "Mitglied nicht gefunden");
    if (existing?.image_path) this._deleteImageFile(existing.image_path);
    return { message: "Gelöscht" };
  }
}

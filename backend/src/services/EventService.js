import AppError from "../errors/AppError.js";

export default class EventService {
  constructor(db) {
    this.db = db;
  }

  getAll() {
    return this.db.prepare("SELECT * FROM events").all();
  }

  getById(id) {
    const event = this.db.prepare("SELECT * FROM events WHERE id = ?").get(id);
    if (!event) throw new AppError(404, "Event not found");
    return event;
  }

  create({ title, description, start_time, end_time, location, host_id, host_name }, userId) {
    if (!title || !start_time || !end_time) {
      throw new AppError(400, "Missing required fields: title, start_time, end_time");
    }
    const result = this.db.prepare(
      "INSERT INTO events (title, description, start_time, end_time, location, host_id, host_name, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(title, description ?? null, start_time, end_time, location ?? null, host_id ?? null, host_name ?? null, userId);
    return { message: "Event created successfully", id: result.lastInsertRowid };
  }

  update(id, body, userId) {
    const existing = this.getById(id);
    this.db.prepare(
      "UPDATE events SET title=?, start_time=?, end_time=?, location=?, description=?, host_id=?, host_name=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(
      body.title ?? existing.title,
      body.start_time ?? existing.start_time,
      body.end_time ?? existing.end_time,
      body.location ?? existing.location,
      body.description ?? existing.description,
      body.host_id ?? existing.host_id,
      body.host_name ?? existing.host_name,
      userId,
      id
    );
    return { message: "Event updated successfully" };
  }

  delete(id) {
    const result = this.db.prepare("DELETE FROM events WHERE id = ?").run(id);
    if (result.changes === 0) throw new AppError(404, "Event not found");
    return { message: "Event deleted successfully" };
  }
}

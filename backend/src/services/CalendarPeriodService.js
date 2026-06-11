import AppError from "../errors/AppError.js";

const VALID_TYPES = ["holiday", "closed", "exams"];
const VALID_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export default class CalendarPeriodService {
  constructor(db) {
    this.db = db;
  }

  getAll() {
    return this.db.prepare("SELECT * FROM calendar_periods").all();
  }

  getById(id) {
    const period = this.db.prepare("SELECT * FROM calendar_periods WHERE id = ?").get(id);
    if (!period) throw new AppError(404, "Calendar period not found");
    return period;
  }

  create({ start_date, end_date, description, type }) {
    if (!start_date || !end_date || !type) {
      throw new AppError(400, "Missing required fields: start_date, end_date, type");
    }
    if (!VALID_TYPES.includes(type)) {
      throw new AppError(400, `Invalid type. Must be: ${VALID_TYPES.join(", ")}`);
    }
    const result = this.db.prepare(
      "INSERT INTO calendar_periods (start_date, end_date, description, type) VALUES (?, ?, ?, ?)"
    ).run(start_date, end_date, description ?? null, type);
    return { id: result.lastInsertRowid, start_date, end_date, description, type };
  }

  update(id, { start_date, end_date, description, type }) {
    if (type && !VALID_TYPES.includes(type)) {
      throw new AppError(400, `Invalid type. Must be: ${VALID_TYPES.join(", ")}`);
    }
    const existing = this.getById(id);
    this.db.prepare(
      "UPDATE calendar_periods SET start_date=?, end_date=?, description=?, type=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(start_date ?? existing.start_date, end_date ?? existing.end_date, description ?? existing.description, type ?? existing.type, id);
    return { message: "Calendar period updated successfully" };
  }

  delete(id) {
    const result = this.db.prepare("DELETE FROM calendar_periods WHERE id = ?").run(id);
    if (result.changes === 0) throw new AppError(404, "Calendar period not found");
    return { message: "Calendar period deleted successfully" };
  }

  createPeriodOpening(weekday, { period_id, open_time, close_time }) {
    if (!VALID_WEEKDAYS.includes(parseInt(weekday))) {
      throw new AppError(400, "Invalid weekday. Must be 0 (Sunday) to 6 (Saturday).");
    }
    if (!period_id || !open_time || !close_time) {
      throw new AppError(400, "Missing fields: period_id, open_time, close_time");
    }
    const result = this.db.prepare(
      "INSERT INTO calendar_period_openings (weekday, calendar_period_id, start_time, end_time) VALUES (?, ?, ?, ?)"
    ).run(parseInt(weekday), period_id, open_time, close_time);
    return { id: result.lastInsertRowid, weekday, period_id, open_time, close_time };
  }

  getPeriodOpening(weekday, period_id) {
    return this.db.prepare(
      "SELECT * FROM calendar_period_openings WHERE weekday=? AND calendar_period_id=?"
    ).all(weekday, period_id);
  }
}

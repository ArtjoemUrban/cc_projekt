import AppError from "../errors/AppError.js";

const VALID_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export default class OpeningHoursService {
  constructor(db) {
    this.db = db;
  }

  getAll() {
    return this.db.prepare("SELECT * FROM opening_hours").all();
  }

  getByDay(day) {
    const hours = this.db.prepare("SELECT * FROM opening_hours WHERE weekday = ?").get(day);
    if (!hours) throw new AppError(404, "Opening hours not found");
    return hours;
  }

  update(day, open_time, close_time, userId) {
    if (!VALID_WEEKDAYS.includes(parseInt(day))) {
      throw new AppError(400, "Invalid weekday. Must be 0 (Sunday) to 6 (Saturday).");
    }
    const result = this.db.prepare(
      "UPDATE opening_hours SET open_time=?, close_time=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE weekday=?"
    ).run(open_time, close_time, userId, day);
    if (result.changes === 0) throw new AppError(404, "Opening hours not found");
    return { message: "Opening hours updated successfully" };
  }
}

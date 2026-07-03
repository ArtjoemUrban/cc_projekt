import bcrypt from "bcrypt";
import AppError from "../errors/AppError.js";

const ALLOWED_ROLES = ["admin", "member"];

export default class UserService {
  constructor(db) {
    this.db = db;
  }

  getMe(id) {
    const user = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  getAll() {
    return this.db.prepare("SELECT * FROM users").all();
  }

  getById(id) {
    const user = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  getByUsername(username) {
    const user = this.db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  getByEmail(email) {
    const user = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }

  delete(username) {
    const result = this.db.prepare("DELETE FROM users WHERE username = ?").run(username);
    if (result.changes === 0) throw new AppError(404, "User not found");
    return { message: "User deleted successfully" };
  }

  async changePassword(username, oldPassword, newPassword) {
    if (!username || !oldPassword || !newPassword) {
      throw new AppError(400, "Missing fields: username, oldPassword, newPassword");
    }
    const user = this.db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) throw new AppError(404, "User not found");
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new AppError(400, "Old password is incorrect");
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    this.db.prepare("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?").run(newHash, username);
    return { message: "Password changed successfully" };
  }

  async changeUsername(oldUsername, newUsername, password) {
    if (!oldUsername || !newUsername || !password) {
      throw new AppError(400, "Missing fields: oldUsername, newUsername, password");
    }
    const user = this.db.prepare("SELECT * FROM users WHERE username = ?").get(oldUsername);
    if (!user) throw new AppError(404, "User not found");
    if (!(await bcrypt.compare(password, user.password))) {
      throw new AppError(400, "Password is incorrect");
    }
    if (this.db.prepare("SELECT id FROM users WHERE username = ?").get(newUsername)) {
      throw new AppError(409, "New username already taken");
    }
    this.db.prepare("UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?").run(newUsername, oldUsername);
    return { message: "Username changed successfully" };
  }

  changeRole(username, newRole) {
    if (!username || !newRole) throw new AppError(400, "Missing fields: username, newRole");
    if (!ALLOWED_ROLES.includes(newRole)) {
      throw new AppError(400, `Invalid role. Allowed: ${ALLOWED_ROLES.join(", ")}`);
    }
    const user = this.db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (!user) throw new AppError(404, "User not found");
    this.db.prepare("UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?").run(newRole, username);
    return { message: "User role updated successfully" };
  }
}

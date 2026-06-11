import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppError from "../errors/AppError.js";

export default class AuthService {
  constructor(db) {
    this.db = db;
  }

  async register({ prename, surname, email, username, password }) {
    if (!prename || !surname || !email || !username || !password) {
      throw new AppError(400, "Missing required fields: prename, surname, email, username, password");
    }
    if (this.db.prepare("SELECT id FROM users WHERE username = ?").get(username)) {
      throw new AppError(409, "Username already exists");
    }
    if (this.db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      throw new AppError(409, "Email already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = this.db.prepare(
      "INSERT INTO users (prename, surname, email, username, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    ).run(prename, surname, email, username, passwordHash);
    return { message: "User registered successfully", userId: result.lastInsertRowid };
  }

  async loginByUsername(username, password) {
    if (!username || !password) throw new AppError(400, "Missing fields: username, password");
    const user = this.db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) throw new AppError(401, `Invalid username: ${username}`);
    await this.#verifyPassword(password, user.password);
    return { message: "Login successful", token: this.#createToken(user) };
  }

  async loginByEmail(email, password) {
    if (!email || !password) throw new AppError(400, "Missing fields: email, password");
    const user = this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) throw new AppError(401, `Invalid email: ${email}`);
    await this.#verifyPassword(password, user.password);
    return { message: "Login successful", token: this.#createToken(user) };
  }

  async #verifyPassword(plain, hash) {
    if (!(await bcrypt.compare(plain, hash))) throw new AppError(401, "Invalid password");
  }

  #createToken(user) {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "3h" }
    );
  }
}

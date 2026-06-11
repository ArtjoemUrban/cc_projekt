import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import { checkRequiredFields } from "../middleware/missingFields.js";

// Eine geteilte Instanz – zählt username- UND email-Login zusammen pro IP
const loginLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Zu viele Login-Versuche. Bitte später erneut versuchen." },
});

export default function authRoutes(db) {
  const router = express.Router();
  const tokenExpiresIn = process.env.JWT_EXPIRES_IN || "3h";

  // Registrierung kann nur von Admins durchgeführt werden
  router.post("/register", verifyJwt, isAdmin, checkRequiredFields(["prename", "surname", "email", "username", "password"]), async (req, res) => {
    try {
      const { prename, surname, email, username, password } = req.body;

      let userInDb = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (userInDb) {
        console.warn("Registration failed: Username already exists");
        return res.status(409).json({ message: "Username already exists" });
      }
      userInDb = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (userInDb) {
        console.warn("Registration failed: Email already exists");
        return res.status(409).json({ message: "Email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const result = db.prepare(
        "INSERT INTO users (prename, surname, email, username, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      ).run(prename, surname, email, username, passwordHash);

      res.status(201).json({ message: "User registered successfully", userId: result.lastInsertRowid });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/login/username", loginLimiter, checkRequiredFields(["username", "password"]), async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiresIn }
      );
      res.json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/login/email", loginLimiter, checkRequiredFields(["email", "password"]), async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiresIn }
      );
      res.json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
}

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import { checkRequiredFields } from "../middleware/missingFields.js";

// import db from "../db/db.js";

export default function authRoutes(db) {
  const router = express.Router();
  const tokenExpiresIn = process.env.JWT_EXPIRES_IN || "3h";

  // Registrierung  kann nur von Admins durchgeführt werden
  router.post("/register",  async (req, res) => {
    try { 
        const body = req.body || {};
       // console.log("Received registration data:", body);
        
        const requiredFields = ["prename", "surname", "email", "username", "password"];
        checkRequiredFields(requiredFields)(req, res, () => {});
        const { prename, surname, email, username, password} = body;

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

        const salt  = bcrypt.genSaltSync(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const result = db.prepare("INSERT INTO users (prename, surname, email, username, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)").run(prename, surname, email, username, passwordHash);

        res.status(201).json({ message: "User registered successfully", userId: result.lastInsertRowid });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router.post("/login/username", async (req, res) => {
    try{
        const body = req.body || {};
       // console.log("Received login data:", body);
        const reqquiredFields = ["username", "password"];
        checkRequiredFields(reqquiredFields)(req, res, () => {});
        const { username, password } = body;

        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
        if (!user) {
            return res.status(401).json({ message: "Invalid username: " + username });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: tokenExpiresIn });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
  });

    router.post("/login/email", async (req, res) => {
        try{
            const body = req.body || {};
           // console.log("Received login data:", body);
           checkRequiredFields(["email", "password"])(req, res, () => {});
            const { email, password } = body;

            const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
            if (!user) {
                return res.status(401).json({ message: "Invalid email: " + email });
            }
           
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid password" });
            }

            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: tokenExpiresIn });

            res.json({ message: "Login successful", token });
        } catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });


  /*
  router.get("/me", verifyJwt, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
  });*/

 
  return router;
}
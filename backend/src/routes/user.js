import express from "express";
import bcrypt from "bcrypt";
import { verifyJwt, isAdmin} from "../middleware/authMiddleware.js";

export default function userRoutes(db) {
    const router = express.Router(); 

    router.get("/me", verifyJwt, async (req, res) => {
        try {
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
        } catch (error) { 
            console.error("Error fetching user data:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    router.get("/",  verifyJwt, async (req, res) => {
        console.log("Fetching all users");
        const users = db.prepare("SELECT * FROM users").all();
        res.status(200).json(users);
    });
    
    router.get("/id/:id", verifyJwt, async (req, res) => {
        console.log(`Fetching user with id: ${req.params.id}`);
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    });

     router.get("/username/:username", verifyJwt, async (req, res) => {
        console.log(`Fetching user with username: ${req.params.username}`);
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(req.params.username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    });

    router.get("/email/:email", verifyJwt, async (req, res) => {
        console.log(`Fetching user with email: ${req.params.email}`);
        const user = db.prepare("SELECT * FROM users WHERE email = ?").get(req.params.email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    });

    
    

    // Nur Admins können einen User löschen
    router.delete("/username/:username", verifyJwt, isAdmin, async (req, res) => {
        console.log(`Deleting user with username: ${req.params.username}`);
        const result = db.prepare("DELETE FROM users WHERE username = ?").run(req.params.username);
        if (result.changes === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    });
    
        
 router.put("/change-password", verifyJwt, async (req, res) => {
    try {
        const body = req.body || {};
        const reqquiredFields = ["username", "oldPassword", "newPassword"];
        const missing = reqquiredFields.filter(field => !body[field]);
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
        }
        const { username, oldPassword, newPassword } = body;

        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
        if (!user) {
            return res.status(409).json({ message: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        
        const salt  = bcrypt.genSaltSync(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);
        db.prepare("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?").run(newPasswordHash, username);

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error during password change:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
  });

  router .put("/change-username", verifyJwt, async (req, res) => {
    try {
        const body = req.body || {};
        const reqquiredFields = ["oldUsername", "newUsername", "password"];
        const missing = reqquiredFields.filter(field => !body[field]);
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
        }
        const { oldUsername, newUsername, password } = body;
        
        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(oldUsername);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        } 
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        const existingUser = db.prepare("SELECT * FROM users WHERE username = ?").get(newUsername);
        if (existingUser) {
            return res.status(409).json({ message: "New username already taken" });
        }

        db.prepare("UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?").run(newUsername, oldUsername);

        res.json({ message: "Username changed successfully" });
    } catch (error) {
        console.error("Error during username change:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } 
  });

  // Nur Admins können die Rolle eines Users ändern 
  router.put("/change-role", verifyJwt, isAdmin, async (req, res) => {
    try {
        const body = req.body || {};
        const reqquiredFields = ["username", "newRole"];
        const missing = reqquiredFields.filter(field => !body[field]);
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
        }
        const { username, newRole } = body;
        const allowedRoles = ["admin", "contributor", "member"];
        if (!allowedRoles.includes(newRole)) {
            return res.status(400).json({ message: `Invalid role. Allowed roles are: ${allowedRoles.join(", ")}` });
        }

        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        db.prepare("UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?").run(newRole, username);

        res.json({ message: "User role updated successfully" });
    } catch (error) {
        console.error("Error during role change:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } 
  });


    return router;
}

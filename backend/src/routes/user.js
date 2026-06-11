import { Router } from "express";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import wrap from "../utils/asyncHandler.js";
import UserService from "../services/UserService.js";

export default function userRoutes(db) {
  const router = Router();
  const service = new UserService(db);

  router.get("/me", verifyJwt, wrap(async (req, res) => {
    res.json(service.getMe(req.user.id));
  }));

  router.get("/", verifyJwt, wrap(async (req, res) => {
    res.json(service.getAll());
  }));

  router.get("/id/:id", verifyJwt, wrap(async (req, res) => {
    res.json(service.getById(req.params.id));
  }));

  router.get("/username/:username", verifyJwt, wrap(async (req, res) => {
    res.json(service.getByUsername(req.params.username));
  }));

  router.get("/email/:email", verifyJwt, wrap(async (req, res) => {
    res.json(service.getByEmail(req.params.email));
  }));

  router.delete("/username/:username", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.delete(req.params.username));
  }));

  router.put("/change-password", verifyJwt, wrap(async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    res.json(await service.changePassword(username, oldPassword, newPassword));
  }));

  router.put("/change-username", verifyJwt, wrap(async (req, res) => {
    const { oldUsername, newUsername, password } = req.body;
    res.json(await service.changeUsername(oldUsername, newUsername, password));
  }));

  router.put("/change-role", verifyJwt, isAdmin, wrap(async (req, res) => {
    const { username, newRole } = req.body;
    res.json(service.changeRole(username, newRole));
  }));

  return router;
}

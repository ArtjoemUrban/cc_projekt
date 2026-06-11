import { Router } from "express";
import wrap from "../utils/asyncHandler.js";
import AuthService from "../services/AuthService.js";

export default function authRoutes(db) {
  const router = Router();
  const service = new AuthService(db);

  router.post("/register", wrap(async (req, res) => {
    res.status(201).json(await service.register(req.body));
  }));

  router.post("/login/username", wrap(async (req, res) => {
    const { username, password } = req.body;
    res.json(await service.loginByUsername(username, password));
  }));

  router.post("/login/email", wrap(async (req, res) => {
    const { email, password } = req.body;
    res.json(await service.loginByEmail(email, password));
  }));

  return router;
}

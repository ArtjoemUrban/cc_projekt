import { Router } from "express";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import wrap from "../utils/asyncHandler.js";
import EventService from "../services/EventService.js";

export default function eventsRoutes(db) {
  const router = Router();
  const service = new EventService(db);

  router.get("/", wrap(async (req, res) => res.json(service.getAll())));
  router.get("/:id", wrap(async (req, res) => res.json(service.getById(req.params.id))));

  router.post("/", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.status(201).json(service.create(req.body, req.user.id));
  }));

  router.put("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.update(req.params.id, req.body, req.user.id));
  }));

  router.delete("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.delete(req.params.id));
  }));

  return router;
}

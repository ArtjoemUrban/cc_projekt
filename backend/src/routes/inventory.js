import { Router } from "express";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import wrap from "../utils/asyncHandler.js";
import InventoryService from "../services/InventoryService.js";

export default function inventoryRoutes(db) {
  const router = Router();
  const service = new InventoryService(db);

  router.get("/available", wrap(async (req, res) => res.json(service.getAvailable())));
  router.get("/categories/:category", wrap(async (req, res) => res.json(service.getByCategory(req.params.category))));
  router.get("/", wrap(async (req, res) => res.json(service.getAll())));
  router.get("/:id", wrap(async (req, res) => res.json(service.getById(req.params.id))));

  router.post("/", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.status(201).json(service.create(req.body));
  }));

  router.patch("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.update(req.params.id, req.body));
  }));

  router.delete("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.delete(req.params.id));
  }));

  return router;
}

import { Router } from "express";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import wrap from "../utils/asyncHandler.js";
import OpeningHoursService from "../services/OpeningHoursService.js";

export default function openingHoursRoutes(db) {
  const router = Router();
  const service = new OpeningHoursService(db);

  router.get("/", wrap(async (req, res) => res.json(service.getAll())));
  router.get("/:day_of_week", wrap(async (req, res) => res.json(service.getByDay(req.params.day_of_week))));

  router.put("/:day_of_week", verifyJwt, isAdmin, wrap(async (req, res) => {
    const { open_time, close_time } = req.body;
    res.json(service.update(req.params.day_of_week, open_time, close_time, req.user.id));
  }));

  return router;
}

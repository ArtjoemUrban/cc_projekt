import { Router } from "express";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import wrap from "../utils/asyncHandler.js";
import CalendarPeriodService from "../services/CalendarPeriodService.js";

export default function calendarPeriodsRoutes(db) {
  const router = Router();
  const service = new CalendarPeriodService(db);

  router.get("/", wrap(async (req, res) => res.json(service.getAll())));
  router.get("/:id", wrap(async (req, res) => res.json(service.getById(req.params.id))));

  router.post("/", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.status(201).json(service.create(req.body));
  }));

  router.put("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.update(req.params.id, req.body));
  }));

  router.delete("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.delete(req.params.id));
  }));

  router.post("/period-openings/:weekday", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.status(201).json(service.createPeriodOpening(req.params.weekday, req.body));
  }));

  router.get("/period-openings/:weekday/:period_id", wrap(async (req, res) => {
    res.json(service.getPeriodOpening(req.params.weekday, req.params.period_id));
  }));

  return router;
}

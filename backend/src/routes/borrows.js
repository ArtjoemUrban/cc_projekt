import { Router } from "express";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import wrap from "../utils/asyncHandler.js";
import BorrowService from "../services/BorrowService.js";

export default function borrowRoutes(db) {
  const router = Router();
  const service = new BorrowService(db);

  router.get("/", verifyJwt, wrap(async (req, res) => res.json(service.getAll())));

  router.post("/user", verifyJwt, wrap(async (req, res) => {
    res.status(201).json(service.createForUser(req.body));
  }));

  router.post("/guest", wrap(async (req, res) => {
    res.status(201).json(service.createForGuest(req.body));
  }));

  router.put("/:id/approve", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.approve(req.params.id));
  }));

  router.put("/:id/reject", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.reject(req.params.id));
  }));

  router.put("/:id/return", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.return(req.params.id));
  }));

  router.delete("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.delete(req.params.id));
  }));

  return router;
}

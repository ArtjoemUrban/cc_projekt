import { Router } from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import { verifyJwt, isAdmin } from "../middleware/authMiddleware.js";
import wrap from "../utils/asyncHandler.js";
import BoardMemberService from "../services/BoardMemberService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, join(__dirname, "../../uploads/members")),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Nur Bilddateien erlaubt")),
});

export default function boardMembersRoutes(db) {
  const router = Router();
  const service = new BoardMemberService(db);

  router.get("/", wrap(async (req, res) => res.json(service.getVisible())));
  router.get("/all", verifyJwt, isAdmin, wrap(async (req, res) => res.json(service.getAll())));

  router.post("/upload", verifyJwt, isAdmin, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Keine Datei empfangen" });
    res.status(201).json({ url: `/uploads/members/${req.file.filename}` });
  });

  router.post("/", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.status(201).json(service.create(req.body));
  }));

  router.put("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.update(Number(req.params.id), req.body));
  }));

  router.delete("/:id/image", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.removeImage(Number(req.params.id)));
  }));

  router.delete("/:id", verifyJwt, isAdmin, wrap(async (req, res) => {
    res.json(service.delete(Number(req.params.id)));
  }));

  return router;
}

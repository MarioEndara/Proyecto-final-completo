import { Router } from "express";
import {
  crearTutoria,
  obtenerTutorias,
  obtenerTutoriaPorId,
  actualizarTutoria,
  eliminarTutoria
} from "../controllers/tutoria_controller.js";
import { verificarTokenJWT } from "../middlewares/JWT.js";

const router = Router();

// Rutas públicas (solo lectura)
router.get("/", obtenerTutorias);
router.get("/:id", obtenerTutoriaPorId);

// Rutas protegidas (solo tutor autenticado)
router.post("/", verificarTokenJWT, crearTutoria);
router.put("/:id", verificarTokenJWT, actualizarTutoria);
router.delete("/:id", verificarTokenJWT, eliminarTutoria);

export default router;

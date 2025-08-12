import { Router } from "express";
import {
  registro,
  confirmarMail,
  login,
  recuperarPassword,
  comprobarTokenPassword,
  crearNuevoPasssword,
  perfil,
  cambiarPassword,
  actualizarPerfil,
} from "../controllers/tutor_controller.js";
import { verificarTokenJWT } from "../middlewares/JWT.js";

const router = Router();

router.post("/registro", registro);
router.get("/confirmar/:token", confirmarMail);
router.post("/login", login);

// Recuperar contraseña
router.post("/recuperarpassword", recuperarPassword);
router.get("/reset/:token", comprobarTokenPassword);
router.post("/reset/:token", crearNuevoPasssword);

// Perfil protegido
router.get("/perfil", verificarTokenJWT, perfil);
router.put("/perfil", verificarTokenJWT, actualizarPerfil);
router.put("/cambiarpassword", verificarTokenJWT, cambiarPassword);

export default router;


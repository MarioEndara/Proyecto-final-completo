import { Router } from "express";
import {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  crearNuevoAdmin,
  confirmarCuentaAdmin,
  recuperarPasswordAdmin,
  comprobarTokenPasswordAdmin,
  crearNuevoPasswordAdmin,
} from "../controllers/admin_controller.js";
import { verificarTokenJWT } from "../middlewares/JWT.js";

const router = Router();

// Ruta para login
router.post("/login", loginAdmin);

// Ruta para obtener perfil (solo lectura)
router.get("/perfil", verificarTokenJWT, getAdminProfile);

// Ruta para actualizar perfil
router.put("/perfil", verificarTokenJWT, updateAdminProfile);

// Ruta para cambiar contraseña
router.put("/cambiarpassword", verificarTokenJWT, changeAdminPassword);

// Nueva ruta para crear admin (protegida con middleware JWT)
router.post("/nuevo", verificarTokenJWT, crearNuevoAdmin);

router.get("/confirmar/:token", confirmarCuentaAdmin);

// Ruta para solicitar recuperación (envía correo con token)
router.post("/recuperarpassword", recuperarPasswordAdmin);

// Ruta para validar token en link (muestra página simple)
router.get("/reset/:token", comprobarTokenPasswordAdmin);

// Ruta para cambiar la contraseña usando token
router.post("/reset/:token", crearNuevoPasswordAdmin);



export default router;

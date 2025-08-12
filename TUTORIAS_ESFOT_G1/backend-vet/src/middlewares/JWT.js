import jwt from "jsonwebtoken";
import Administrador from "../models/Administrador.js";
import Tutor from "../models/Tutor.js";
import Estudiante from "../models/Estudiante.js";  // <-- Importa modelo Estudiante

const crearTokenJWT = (userId, rol) => {
  return jwt.sign({ userId, rol }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const verificarTokenJWT = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization)
    return res.status(401).json({ msg: "Acceso denegado: token no proporcionado o inválido" });

  try {
    const token = authorization.split(" ")[1]; // Obtenemos solo el token
    const { userId, rol } = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verificado. id:", userId, "rol:", rol);

    req.userId = userId;
    req.userRol = rol;

    if (rol === "administrador") {
      req.administradorBDD = await Administrador.findById(userId).lean().select("-password");
      if (!req.administradorBDD)
        return res.status(401).json({ msg: "Administrador no encontrado" });
      next();
    } else if (rol === "tutor") {
      req.tutorBDD = await Tutor.findById(userId).lean().select("-password");
      if (!req.tutorBDD)
        return res.status(401).json({ msg: "Tutor no encontrado" });
      next();
    } else if (rol === "estudiante") {              // <-- Validación para estudiantes
      req.estudianteBDD = await Estudiante.findById(userId).lean().select("-password");
      if (!req.estudianteBDD)
        return res.status(401).json({ msg: "Estudiante no encontrado" });
      next();
    } else {
      return res.status(403).json({ msg: "Rol no autorizado" });
    }
  } catch (error) {
    console.log("Error en verificarTokenJWT:", error.message);
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

export {
  crearTokenJWT,
  verificarTokenJWT
};

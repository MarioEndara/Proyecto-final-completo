// controllers/admin_controller.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Administrador from "../models/Administrador.js";
import dotenv from "dotenv";
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailer.js";
dotenv.config();

// Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (Object.values(req.body).includes("")) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  const adminBDD = await Administrador.findOne({ email });

  if (!adminBDD) {
    return res.status(404).json({ msg: "El usuario no existe" });
  }

  if (adminBDD.confirmEmail === false) {
    return res.status(403).json({ msg: "Debes confirmar tu cuenta" });
  }

  const passwordOK = await bcrypt.compare(password, adminBDD.password);

  if (!passwordOK) {
    return res.status(401).json({ msg: "Contraseña incorrecta" });
  }

  const token = jwt.sign(
    { userId: adminBDD._id, rol: adminBDD.rol },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  const { _id, nombre, apellido, email: correo, rol } = adminBDD;

  res.status(200).json({
    token,
    rol,
    nombre,
    apellido,
    correo,
    _id,
  });
};

// Obtener perfil
const getAdminProfile = async (req, res) => {
  const adminId = req.userId;

  try {
    const admin = await Administrador.findById(adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ msg: "Admin no encontrado" });
    }
    res.status(200).json({ msg: "Tu perfil", admin });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// Actualizar perfil
const updateAdminProfile = async (req, res) => {
  const adminId = req.userId;
  const updates = { ...req.body };

  delete updates.email;
  delete updates.password;
  delete updates.token;

  try {
    const admin = await Administrador.findOneAndUpdate(
      { _id: adminId },
      updates,
      { new: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ msg: "Admin no encontrado" });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ msg: "Tu perfil", admin });
    }

    res.status(200).json({ msg: "Perfil actualizado correctamente", admin });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

// Cambiar contraseña
const changeAdminPassword = async (req, res) => {
  const adminId = req.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  const adminBDD = await Administrador.findById(adminId);

  if (!adminBDD) {
    return res.status(404).json({ msg: "Administrador no encontrado" });
  }

  const match = await bcrypt.compare(oldPassword, adminBDD.password);

  if (!match) {
    return res.status(401).json({ msg: "Contraseña anterior incorrecta" });
  }

  adminBDD.password = await bcrypt.hash(newPassword, 10);
  await adminBDD.save();

  res.status(200).json({ msg: "Contraseña actualizada correctamente" });
};

// Crear nuevo administrador con verificación por email
const crearNuevoAdmin = async (req, res) => {
  if (req.userRol !== "administrador") {
    return res.status(403).json({ msg: "Acceso no autorizado" });
  }

  const { nombre, apellido, email, password, telefono } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ msg: "Todos los campos obligatorios" });
  }

  const existeAdmin = await Administrador.findOne({ email });
  if (existeAdmin) {
    return res.status(400).json({ msg: "El email ya está registrado" });
  }

  // Crear el nuevo admin SIN token primero
  const nuevoAdmin = new Administrador({
    nombre,
    apellido,
    email,
    telefono: telefono || null,
    rol: "administrador",
    confirmEmail: false, // requiere confirmar
  });

  // Generar token con método del modelo y asignar
  nuevoAdmin.token = nuevoAdmin.crearToken();

  nuevoAdmin.password = await nuevoAdmin.encrypPassword(password);

  await sendMailToRegister(email, nuevoAdmin.token);
  await nuevoAdmin.save();

  res.status(201).json({
    msg: "Administrador creado. Revisa el correo para confirmar la cuenta.",
    administrador: {
      _id: nuevoAdmin._id,
      nombre: nuevoAdmin.nombre,
      apellido: nuevoAdmin.apellido,
      email: nuevoAdmin.email,
      telefono: nuevoAdmin.telefono,
      rol: nuevoAdmin.rol,
      confirmEmail: nuevoAdmin.confirmEmail,
    },
  });
};

// Confirmar cuenta de administrador - responde con página simple y JSON dentro de <pre>
const confirmarCuentaAdmin = async (req, res) => {
  const { token } = req.params;

  const admin = await Administrador.findOne({ token });

  if (!admin?.token) {
    return res.status(404).send(`
      <h1>Token inválido o cuenta ya confirmada</h1>
      <p><a href="/">Volver al inicio</a></p>
    `);
  }

  admin.token = null;
  admin.confirmEmail = true;
  await admin.save();

  res.status(200).send(`
    <html>
      <head><title>Confirmación de cuenta</title></head>
      <body>
        <pre>{ "msg" : "Token confirmado, ya puedes iniciar sesión" }</pre>
      </body>
    </html>
  `);
};

// Etapa 1: Solicitar recuperación de contraseña (envía email con token)
const recuperarPasswordAdmin = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ msg: "El email es obligatorio" });

  const adminBDD = await Administrador.findOne({ email });

  if (!adminBDD) return res.status(404).json({ msg: "Administrador no encontrado" });

  const token = adminBDD.crearToken();  // genera token aleatorio
  adminBDD.token = token;
  await adminBDD.save();

  await sendMailToRecoveryPassword(email, token);

  res.status(200).json({ msg: "Revisa tu correo para restablecer tu contraseña" });
};

// Etapa 2: Verificar token recibido para restablecer contraseña
const comprobarTokenPasswordAdmin = async (req, res) => {
  const { token } = req.params;

  const adminBDD = await Administrador.findOne({ token });

  if (!adminBDD || adminBDD.token !== token) {
    return res.status(404).send(`
      <h1>Token inválido o expirado</h1>
      <p><a href="/">Volver al inicio</a></p>
    `);
  }

  res.status(200).send(`
    <html>
      <head><title>Restablecer contraseña</title></head>
      <body>
        <pre>{ "msg": "Token válido, puedes crear tu nueva contraseña" }</pre>
      </body>
    </html>
  `);
};

// Etapa 3: Cambiar la contraseña con el token válido
const crearNuevoPasswordAdmin = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Las contraseñas no coinciden" });
  }

  const adminBDD = await Administrador.findOne({ token });

  if (!adminBDD || adminBDD.token !== token) {
    return res.status(404).json({ msg: "Token inválido o expirado" });
  }

  adminBDD.password = await adminBDD.encrypPassword(password);
  adminBDD.token = null;
  await adminBDD.save();

  res.status(200).json({ msg: "Contraseña restablecida correctamente, ya puedes iniciar sesión" });
};

export {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  crearNuevoAdmin,
  confirmarCuentaAdmin,
  recuperarPasswordAdmin,
  comprobarTokenPasswordAdmin,
  crearNuevoPasswordAdmin,
};

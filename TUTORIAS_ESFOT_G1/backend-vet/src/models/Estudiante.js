import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const estudianteSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String, trim: true, default: null },
  direccion: { type: String, trim: true, default: null },
  universidad: { type: String, trim: true, default: null },
  facultad: { type: String, trim: true, default: null },
  carrera: { type: String, trim: true, default: null },
  status: { type: Boolean, default: true },
  token: { type: String, default: null },
  confirmEmail: { type: Boolean, default: false },
  rol: { type: String, default: "estudiante" }
}, {
  timestamps: true,
  collection: "estudiantes"
});

estudianteSchema.methods.encrypPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
};


estudianteSchema.methods.matchPassword = async function (password) {
    const response = await bcrypt.compare(password,this.password)
    return response
};

estudianteSchema.methods.crearToken = function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
};

export default model("Estudiante", estudianteSchema);







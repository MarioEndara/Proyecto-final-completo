import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const tutorSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: Boolean,
    default: true
  },
  token: {
    type: String,
    default: null
  },
  confirmEmail: {
    type: Boolean,
    default: false
  },
  rol: {
    type: String,
    default: "tutor"
  },
  especialidades: {
    type: [String],
    default: []
  },
  tutorias: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  collection: 'tutores' // 👈 Nombre exacto de la colección en MongoDB
});

// Método para cifrar la contraseña
tutorSchema.methods.encrypPassword = async function(password){
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Método para comparar contraseñas
tutorSchema.methods.matchPassword = async function(password){
  return await bcrypt.compare(password, this.password);
}

// Método para generar un token aleatorio
tutorSchema.methods.crearToken = function(){
  const tokenGenerado = this.token = Math.random().toString(32).slice(2);
  return tokenGenerado;
}

export default model('Tutor', tutorSchema);
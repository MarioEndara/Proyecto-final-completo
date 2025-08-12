import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const administradorSchema = new Schema({
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
    default: "administrador"
  }
}, {
  timestamps: true,
  collection: 'administradores' // 👈 Aquí defines el nombre exacto de la colección
});

// Método para cifrar la contraseña
administradorSchema.methods.encrypPassword = async function(password){
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Método para comparar la contraseña
administradorSchema.methods.matchPassword = async function(password){
  return await bcrypt.compare(password, this.password);
}

// Método para crear un token aleatorio
administradorSchema.methods.crearToken = function(){
  const tokenGenerado = this.token = Math.random().toString(32).slice(2);
  return tokenGenerado;
}

export default model('Administrador', administradorSchema);

import { Schema, model } from 'mongoose';

const tutoriaSchema = new Schema(
  {
    tutor: {
      type: Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true,
    },
    estudiante: {
      type: Schema.Types.ObjectId,
      ref: 'Estudiante',
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: ['pendiente', 'completada', 'cancelada'],
      default: 'pendiente',
    },
    observaciones: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'tutorias', // Nombre explícito de la colección en MongoDB
  }
);

export default model('Tutoria', tutoriaSchema);

import Tutoria from "../models/Tutoria.js";

const crearTutoria = async (req, res) => {
  try {
    if (req.userRol !== "tutor") {
      return res.status(403).json({ msg: "No autorizado, solo tutores" });
    }

    const { estudianteId, fecha, estado, observaciones } = req.body;

    if (!estudianteId || !fecha) {
      return res.status(400).json({ msg: "Estudiante y fecha son obligatorios" });
    }

    const nuevaTutoria = new Tutoria({
      tutor: req.userId,          // CORREGIDO: usar 'tutor'
      estudiante: estudianteId,   // CORREGIDO: usar 'estudiante'
      fecha,
      estado: estado || "pendiente",
      observaciones: observaciones || ""
    });

    await nuevaTutoria.save();

    res.status(201).json({ msg: "Tutoría creada", tutoria: nuevaTutoria });
  } catch (error) {
    console.error("Error creando tutoría:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const obtenerTutorias = async (req, res) => {
  try {
    const { tutorId, estudianteId } = req.query;
    const filtro = {};

    if (tutorId) filtro.tutor = tutorId;         // CORREGIDO: usar 'tutor'
    if (estudianteId) filtro.estudiante = estudianteId; // CORREGIDO: usar 'estudiante'

    const tutorias = await Tutoria.find(filtro).sort({ fecha: -1 });

    res.status(200).json(tutorias);
  } catch (error) {
    console.error("Error obteniendo tutorías:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const actualizarTutoria = async (req, res) => {
  try {
    if (req.userRol !== "tutor") {
      return res.status(403).json({ msg: "No autorizado, solo tutores" });
    }

    const { id } = req.params;
    const tutoria = await Tutoria.findById(id);

    if (!tutoria) return res.status(404).json({ msg: "Tutoría no encontrada" });

    if (tutoria.tutor.toString() !== req.userId) {  // CORREGIDO: 'tutor' en vez de 'tutorId'
      return res.status(403).json({ msg: "No puedes actualizar tutorías de otros tutores" });
    }

    const updates = req.body;
    Object.assign(tutoria, updates);

    await tutoria.save();

    res.status(200).json({ msg: "Tutoría actualizada", tutoria });
  } catch (error) {
    console.error("Error actualizando tutoría:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const eliminarTutoria = async (req, res) => {
  try {
    if (req.userRol !== "tutor") {
      return res.status(403).json({ msg: "No autorizado, solo tutores" });
    }

    const { id } = req.params;
    const tutoria = await Tutoria.findById(id);

    if (!tutoria) return res.status(404).json({ msg: "Tutoría no encontrada" });

    if (tutoria.tutor.toString() !== req.userId) {  // CORREGIDO: 'tutor' en vez de 'tutorId'
      return res.status(403).json({ msg: "No puedes eliminar tutorías de otros tutores" });
    }

    await tutoria.deleteOne();

    res.status(200).json({ msg: "Tutoría eliminada" });
  } catch (error) {
    console.error("Error eliminando tutoría:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const obtenerTutoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tutoria = await Tutoria.findById(id)
      .populate("tutor", "nombre email")
      .populate("estudiante", "nombre email");

    if (!tutoria) {
      return res.status(404).json({ msg: "Tutoría no encontrada" });
    }

    res.json(tutoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener la tutoría" });
  }
};

export {
  crearTutoria,
  obtenerTutorias,
  actualizarTutoria,
  obtenerTutoriaPorId,
  eliminarTutoria
};
